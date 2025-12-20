const mentorProfileModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const sessionModel = require("../models/sessionModel");
const messageModel = require("../models/messageModel");
const opportunityModel = require("../models/opportunityModel");
const ratingModel = require("../models/ratingModel");

const getAllUsersController = async (req, res) => {
    try {
        // Only show MENTORS in the admin users list (for approval purposes)
        // Mentees don't need approval, so they shouldn't appear here
        const users = await userModel.find({
            isAdmin: { $ne: true },
            role: "mentor"  // Only fetch mentors
        }).select("-password").sort({ createdAt: -1 }).lean();;

        console.log(`Admin Users List: Found ${users.length} mentors (excluding admins and mentees)`);

        res.status(200).send({
            success: true,
            message: "Mentor users list for approval",
            data: users,
        });
    } catch (error) {
        console.error("Error in getAllUsersController:", error);
        res.status(500).send({
            success: false,
            message: "error while fetching users",
            error,
        });
    }
};

const getAllMentorsController = async (req, res) => {
    try {
        // First get all users who are not admins
        const nonAdminUsers = await userModel.find({ isAdmin: { $ne: true } }).select("_id");
        const nonAdminUserIds = nonAdminUsers.map(u => u._id);

        // Then get mentor profiles only for non-admin users
        // Show all statuses (pending, approved, rejected) for admin to manage
        const mentors = await mentorProfileModel
            .find({ userId: { $in: nonAdminUserIds } })
            .populate("userId", "name email profile role mentorStatus")
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: "Mentors Data list",
            data: mentors,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "error while getting mentors data",
            error,
        });
    }
};

const approveMentorController = async (req, res) => {
    try {
        const { mentorId, status } = req.body;
        const mentorProfile = await mentorProfileModel.findById(mentorId);
        if (!mentorProfile) {
            return res.status(404).send({
                success: false,
                message: "Mentor profile not found",
            });
        }

        mentorProfile.status = status;
        await mentorProfile.save();

        // Update user status
        const user = await userModel.findById(mentorProfile.userId);
        if (user) {
            user.mentorStatus = status;
            if (status === "approved") {
                user.isMentor = true;
            }
            await user.save();

            // Notify mentor
            const notification = user.notifcation || [];
            notification.push({
                type: "mentor-status-update",
                message: `Your mentor application has been ${status}`,
                data: {
                    onClickPath: "/profile",
                },
            });
            await userModel.findByIdAndUpdate(user._id, { notifcation: notification });
        }

        res.status(200).send({
            success: true,
            message: `Mentor ${status} successfully`,
            data: mentorProfile,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error updating mentor status",
            error,
        });
    }
};

// Approve/Reject mentor by userId (for Users page)
const approveMentorByUserIdController = async (req, res) => {
    try {
        console.log("\n========================================");
        console.log("APPROVE MENTOR REQUEST RECEIVED");
        console.log("========================================");
        console.log("Request body:", req.body);
        console.log("Request headers:", req.headers.authorization ? "Token present" : "No token");
        const { userId, status } = req.body;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        console.log("User found:", {
            id: user._id,
            role: user.role,
            mentorStatus: user.mentorStatus,
            isMentor: user.isMentor,
            isAdmin: user.isAdmin,
            email: user.email,
            name: user.name
        });

        // Only prevent admins from being approved if they're not already mentors
        // Since getAllUsersController filters out admins, this should rarely happen
        // But if it does, we'll allow it if they already have mentor role/status
        if (user.isAdmin === true && user.role !== "mentor" && !user.isMentor && !user.mentorStatus) {
            console.log("Blocking admin user from being approved as mentor");
            return res.status(400).send({
                success: false,
                message: `Cannot approve user "${user.name}" (${user.email}) as mentor because they are an admin. Please use a regular user account.`,
            });
        }

        // If user is admin but already has mentor role/status, allow the update
        if (user.isAdmin === true) {
            console.log("Warning: User is admin but has mentor role/status - proceeding with approval");
        }

        // Check if user is a mentor or has mentor status (for users who registered as mentor)
        // Allow approval if user has mentorStatus set or if they're marked as isMentor
        if (user.role !== "mentor" && !user.mentorStatus && !user.isMentor) {
            return res.status(400).send({
                success: false,
                message: "User is not a mentor. Only users with mentor role or mentor status can be approved.",
            });
        }

        // Ensure role is set to mentor if not already
        if (user.role !== "mentor") {
            user.role = "mentor";
        }

        // Find or create mentor profile
        let mentorProfile = await mentorProfileModel.findOne({ userId: user._id });
        console.log("Mentor profile lookup result:", mentorProfile ? { id: mentorProfile._id, status: mentorProfile.status } : "NOT FOUND");

        if (!mentorProfile) {
            // Create mentor profile if it doesn't exist (for users who registered but haven't applied)
            console.log("Creating NEW mentor profile for user:", user._id);
            console.log("User details:", { name: user.name, email: user.email, _id: user._id });
            try {
                const newProfileData = {
                    userId: user._id,
                    skills: [],
                    experience: "Not provided",
                    status: status,
                };
                console.log("Profile data to create:", newProfileData);

                mentorProfile = new mentorProfileModel(newProfileData);

                // Validate before saving
                const validationError = mentorProfile.validateSync();
                if (validationError) {
                    console.error("❌ VALIDATION ERROR:");
                    console.error(validationError.errors);
                    throw validationError;
                }

                const savedProfile = await mentorProfile.save();
                console.log("✓ NEW mentor profile created successfully!");
                console.log("  Profile ID:", savedProfile._id);
                console.log("  Status:", savedProfile.status);
                console.log("  User ID:", savedProfile.userId);

                // Verify it was saved
                const verifyCreate = await mentorProfileModel.findById(savedProfile._id);
                if (!verifyCreate) {
                    throw new Error("Profile was not saved to database!");
                }
                console.log("✓ Verified profile exists in database");

                mentorProfile = savedProfile;
            } catch (createError) {
                console.error("❌ CRITICAL ERROR creating mentor profile:");
                console.error("Error name:", createError.name);
                console.error("Error message:", createError.message);
                if (createError.errors) {
                    console.error("Validation errors:", createError.errors);
                }
                console.error("Error stack:", createError.stack);
                return res.status(500).send({
                    success: false,
                    message: "Failed to create mentor profile: " + createError.message,
                    error: createError.message,
                });
            }
        } else {
            // Update existing mentor profile status using findByIdAndUpdate to ensure it saves
            try {
                const updatedProfile = await mentorProfileModel.findByIdAndUpdate(
                    mentorProfile._id,
                    { status: status },
                    { new: true, runValidators: true }
                );
                if (!updatedProfile) {
                    console.error("ERROR: findByIdAndUpdate returned null!");
                    return res.status(500).send({
                        success: false,
                        message: "Failed to update mentor profile",
                    });
                }
                console.log("✓ Updated mentor profile status from", mentorProfile.status, "to", updatedProfile.status, "Profile ID:", updatedProfile._id);
                mentorProfile = updatedProfile;
            } catch (updateError) {
                console.error("ERROR updating mentor profile:", updateError);
                return res.status(500).send({
                    success: false,
                    message: "Failed to update mentor profile",
                    error: updateError.message,
                });
            }
        }

        // Update user status - use findByIdAndUpdate to ensure it saves
        const updateData = {
            mentorStatus: status,  // Explicitly set mentorStatus
        };

        if (status === "approved") {
            updateData.isMentor = true;
        } else if (status === "rejected") {
            updateData.isMentor = false;
        }

        // Ensure role is set to mentor
        if (user.role !== "mentor") {
            updateData.role = "mentor";
        }

        // Prepare notification
        const notification = user.notifcation || [];
        notification.push({
            type: "mentor-status-update",
            message: `Your mentor application has been ${status}`,
            data: {
                onClickPath: "/profile",
            },
        });
        updateData.notifcation = notification;

        // Update user with all fields at once
        console.log("Updating user with data:", JSON.stringify(updateData, null, 2));

        // Use updateOne with $set to ensure the update works
        console.log("Attempting to update user:", user._id);
        console.log("Update data:", JSON.stringify(updateData, null, 2));

        const updateResult = await userModel.updateOne(
            { _id: user._id },
            { $set: updateData }
        );

        console.log("Update result:", {
            matched: updateResult.matchedCount,
            modified: updateResult.modifiedCount,
            acknowledged: updateResult.acknowledged
        });

        if (updateResult.matchedCount === 0) {
            console.error("ERROR: No user matched for update!");
            return res.status(500).send({
                success: false,
                message: "User not found for update",
            });
        }

        if (updateResult.modifiedCount === 0) {
            console.warn("WARNING: User matched but no fields were modified!");
            console.warn("This might mean the data is already set to these values.");
        }

        // Fetch the updated user IMMEDIATELY
        const updatedUser = await userModel.findById(user._id).lean();
        if (!updatedUser) {
            console.error("ERROR: Could not fetch updated user!");
            return res.status(500).send({
                success: false,
                message: "Failed to fetch updated user",
            });
        }

        console.log("Updated user (fresh from DB):", {
            id: updatedUser._id,
            mentorStatus: updatedUser.mentorStatus,
            isMentor: updatedUser.isMentor,
            role: updatedUser.role
        });

        // CRITICAL: Verify the update actually worked
        if (updatedUser.mentorStatus !== status) {
            console.error(`❌ STATUS MISMATCH! Expected: ${status}, Got: ${updatedUser.mentorStatus}`);
            console.error("Attempting to fix with direct update...");

            // Try one more time with explicit update
            await userModel.updateOne(
                { _id: user._id },
                { $set: { mentorStatus: status, isMentor: status === 'approved' } }
            );

            // Verify again
            const recheckUser = await userModel.findById(user._id).lean();
            console.log("After fix attempt, mentorStatus:", recheckUser.mentorStatus);

            if (recheckUser.mentorStatus !== status) {
                console.error("❌ CRITICAL: Status still not updated after fix attempt!");
                return res.status(500).send({
                    success: false,
                    message: `Failed to update mentor status. Expected: ${status}, but got: ${recheckUser.mentorStatus}`,
                });
            }
        } else {
            console.log("✓ Status update verified successfully!");
        }

        // Verify the update actually saved
        if (updatedUser.mentorStatus !== status) {
            console.error(`ERROR: Status mismatch after update! Expected: ${status}, Got: ${updatedUser.mentorStatus}`);
            // Try one more time with explicit $set
            await userModel.updateOne(
                { _id: user._id },
                { $set: { mentorStatus: status } }
            );
            // Fetch again
            const recheckUser = await userModel.findById(user._id).lean();
            console.log("After fix attempt, mentorStatus:", recheckUser.mentorStatus);
        }

        // Verify mentor profile was created/updated - CRITICAL CHECK
        const verifyProfileAfter = await mentorProfileModel.findOne({ userId: user._id }).lean();
        if (!verifyProfileAfter) {
            console.error("CRITICAL ERROR: Mentor profile not found after approval! Creating it now...");
            // Emergency create if it doesn't exist
            try {
                const emergencyProfile = new mentorProfileModel({
                    userId: user._id,
                    skills: [],
                    experience: "Not provided",
                    status: status,
                });
                await emergencyProfile.save();
                console.log("✓ Emergency created mentor profile:", emergencyProfile._id);
            } catch (emergencyError) {
                console.error("FAILED to create emergency profile:", emergencyError);
                return res.status(500).send({
                    success: false,
                    message: "Failed to create mentor profile. Please try again.",
                    error: emergencyError.message,
                });
            }
        } else {
            console.log("Verification - Mentor Profile after update:", {
                profileId: verifyProfileAfter._id,
                status: verifyProfileAfter.status,
                userId: verifyProfileAfter.userId
            });

            if (verifyProfileAfter.status !== status) {
                console.error(`ERROR: Profile status mismatch! Expected: ${status}, Got: ${verifyProfileAfter.status}`);
                const fixResult = await mentorProfileModel.updateOne(
                    { _id: verifyProfileAfter._id },
                    { $set: { status: status } }
                );
                console.log("Fix result:", fixResult);

                // Verify fix worked
                const recheckProfile = await mentorProfileModel.findById(verifyProfileAfter._id).lean();
                console.log("After fix, profile status:", recheckProfile?.status);
            }
        }

        // Final verification - get the profile we just created/updated
        let finalProfile = await mentorProfileModel.findOne({ userId: user._id }).lean();

        if (!finalProfile) {
            console.error("❌ CRITICAL: Profile still not found after all attempts!");
            console.error("Attempting FINAL emergency profile creation...");

            // FINAL EMERGENCY: Create profile if it still doesn't exist
            try {
                const emergencyProfile = new mentorProfileModel({
                    userId: user._id,
                    skills: [],
                    experience: "Not provided",
                    status: status,
                });

                const savedEmergency = await emergencyProfile.save();
                console.log("✓ FINAL Emergency profile created:", savedEmergency._id);
                finalProfile = savedEmergency;
            } catch (emergencyError) {
                console.error("❌ FAILED to create FINAL emergency profile:", emergencyError);
                console.error("Error details:", emergencyError.message);
                return res.status(500).send({
                    success: false,
                    message: "Mentor profile creation failed. Please contact support.",
                    error: emergencyError.message
                });
            }
        }

        console.log("Final verification - Profile ID:", finalProfile._id, "Status:", finalProfile.status);

        // Ensure status is correct one final time
        if (finalProfile.status !== status) {
            console.log("Fixing profile status from", finalProfile.status, "to", status);
            await mentorProfileModel.updateOne(
                { _id: finalProfile._id },
                { $set: { status: status } }
            );
            console.log("✓ Final status fix applied");
        }

        // ULTIMATE VERIFICATION: Check one more time
        const ultimateCheck = await mentorProfileModel.findOne({ userId: user._id }).lean();
        if (!ultimateCheck || ultimateCheck.status !== status) {
            console.error("❌ FATAL: Final verification failed!");
            console.error("Profile exists:", !!ultimateCheck);
            if (ultimateCheck) {
                console.error("Profile status:", ultimateCheck.status, "Expected:", status);
            }
        } else {
            console.log("✅ ALL VERIFICATIONS PASSED - Profile exists and is correct!");
        }

        res.status(200).send({
            success: true,
            message: `Mentor ${status} successfully`,
            data: {
                ...updatedUser,
                mentorProfileStatus: status,
                mentorProfileId: finalProfile._id
            },
        });

        console.log("========================================");
        console.log("✓ APPROVAL SUCCESSFUL - Response sent");
        console.log("========================================\n");
    } catch (error) {
        console.error("\n========================================");
        console.error("❌ ERROR in approveMentorByUserIdController");
        console.error("========================================");
        console.error("Error:", error);
        console.error("Stack:", error.stack);
        console.error("========================================\n");
        res.status(500).send({
            success: false,
            message: "Error updating mentor status",
            error: error.message || String(error),
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const getDashboardStatsController = async (req, res) => {
    try {
        const totalUsers = await userModel.countDocuments({});
        const totalMentors = await mentorProfileModel.countDocuments({ status: "approved" });
        const totalMentees = await userModel.countDocuments({ role: "mentee" });
        const totalSessions = await sessionModel.countDocuments({});
        const pendingSessions = await sessionModel.countDocuments({ status: "pending" });
        const completedSessions = await sessionModel.countDocuments({ status: "completed" });
        const totalOpportunities = await opportunityModel.countDocuments({ isActive: true });
        const totalMessages = await messageModel.countDocuments({});

        res.status(200).send({
            success: true,
            data: {
                totalUsers,
                totalMentors,
                totalMentees,
                totalSessions,
                pendingSessions,
                completedSessions,
                totalOpportunities,
                totalMessages,
            },
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error fetching dashboard stats",
            error,
        });
    }
};
const deleteMentorController = async (req, res) => {
    try {
        const { mentorId } = req.params;  // This is the mentor profile ID
        const { userId } = req.body;

        console.log("\n========================================");
        console.log("DELETE MENTOR REQUEST");
        console.log("========================================");
        console.log("Mentor Profile ID:", mentorId);
        console.log("User ID:", userId);

        // Find the mentor profile
        const mentorProfile = await mentorProfileModel.findById(mentorId);

        if (!mentorProfile) {
            console.log("❌ Mentor profile not found");
            console.log("========================================\n");
            return res.status(404).json({
                success: false,
                message: 'Mentor profile not found'
            });
        }

        console.log("✓ Mentor profile found:", {
            profileId: mentorProfile._id,
            userId: mentorProfile.userId,
            status: mentorProfile.status
        });

        // Delete the mentor profile from database
        await mentorProfileModel.findByIdAndDelete(mentorId);
        console.log("✓ Mentor profile deleted from database");

        // Update the user's status back to mentee
        if (userId || mentorProfile.userId) {
            const userIdToUpdate = userId || mentorProfile.userId;

            const updateResult = await userModel.findByIdAndUpdate(
                userIdToUpdate,
                {
                    isMentor: false,
                    mentorStatus: null,
                    role: 'mentee'
                },
                { new: true }
            );

            if (updateResult) {
                console.log("✓ User status updated:", {
                    userId: updateResult._id,
                    role: updateResult.role,
                    isMentor: updateResult.isMentor,
                    mentorStatus: updateResult.mentorStatus
                });
            } else {
                console.log("⚠️ User not found for status update");
            }
        }

        console.log("✓ Mentor deleted successfully");
        console.log("========================================\n");

        res.status(200).json({
            success: true,
            message: 'Mentor deleted successfully'
        });

    } catch (error) {
        console.error("\n========================================");
        console.error("❌ ERROR DELETING MENTOR");
        console.error("========================================");
        console.error("Error:", error);
        console.error("Stack:", error.stack);
        console.error("========================================\n");
        res.status(500).json({
            success: false,
            message: 'Failed to delete mentor',
            error: error.message
        });
    }
};


module.exports = {
    getAllUsersController,
    getAllMentorsController,
    approveMentorController,
    approveMentorByUserIdController,
    getDashboardStatsController,
    deleteMentorController,
};