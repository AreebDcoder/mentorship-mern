const mentorProfileModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const sessionModel = require("../models/sessionModel");
const messageModel = require("../models/messageModel");
const opportunityModel = require("../models/opportunityModel");
const ratingModel = require("../models/ratingModel");
const feedbackModel = require("../models/feedbackModel");

const getAllUsersController = async (req, res) => {
    try {
        // Only show MENTORS in the admin users list (for approval purposes)
        // Mentees don't need approval, so they shouldn't appear here
        const users = await userModel.find({
            isAdmin: { $ne: true },
            $or: [
                { role: "mentor" },
                { mentorStatus: { $in: ["pending", "approved", "rejected"] } }
            ]
        }).select("-password").sort({ updatedAt: -1 }).lean();

        console.log(`\n--- ADMIN USERS LIST FETCH ---`);
        console.log(`Found ${users.length} users matching criteria`);

        // Ensure we have consistent mentorStatus on user objects. Some older
        // mentor records may have the role set to 'mentor' but not have
        // `mentorStatus` stored on the user document. For the admin Users
        // page we need mentorStatus to render action buttons correctly.
        for (let i = 0; i < users.length; i++) {
            const u = users[i];
            if (!u.mentorStatus) {
                // Try to find the mentor profile and derive the status from it
                try {
                    const profile = await mentorProfileModel.findOne({ userId: u._id }).select('status');
                    if (profile && profile.status) {
                        // Keep response consistent
                        u.mentorStatus = profile.status;
                        // Persist to user document so future calls are consistent
                        try {
                            await userModel.findByIdAndUpdate(u._id, { $set: { mentorStatus: profile.status, isMentor: profile.status === 'approved', role: profile.status === 'approved' ? 'mentor' : 'mentee' } });
                        } catch (updErr) {
                            console.warn('Failed to persist mentorStatus for user', u._id, updErr.message || updErr);
                        }
                    }
                } catch (pfErr) {
                    console.warn('Error fetching mentor profile for user', u._id, pfErr.message || pfErr);
                }
            }
            console.log(`[${i}] ${u.name} | Role: ${u.role} | Status: ${u.mentorStatus} | ID: ${u._id}`);
        }
        console.log(`-------------------------------\n`);

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
        console.log(`\n=== APPROVE MENTOR (BY PROFILE ID): ${mentorId} to ${status} ===`);

        const mentorProfile = await mentorProfileModel.findByIdAndUpdate(
            mentorId,
            { $set: { status: status } },
            { new: true }
        );

        if (!mentorProfile) {
            return res.status(404).send({
                success: false,
                message: "Mentor profile not found",
            });
        }

        // Update user status
        const userUpdate = {
            mentorStatus: status,
            isMentor: status === "approved",
            role: status === "approved" ? "mentor" : "mentee"
        };

        const updatedUser = await userModel.findByIdAndUpdate(
            mentorProfile.userId,
            { $set: userUpdate },
            { new: true }
        );

        if (updatedUser) {
            // Notify mentor
            const notification = updatedUser.notifcation || [];
            notification.push({
                type: "mentor-status-update",
                message: `Your mentor application has been ${status}`,
                data: {
                    onClickPath: "/profile",
                },
            });
            await userModel.findByIdAndUpdate(updatedUser._id, { $set: { notifcation: notification } });
        }

        res.status(200).send({
            success: true,
            message: `Mentor ${status} successfully`,
            data: mentorProfile,
        });
    } catch (error) {
        console.error("Error in approveMentorController:", error);
        res.status(500).send({
            success: false,
            message: "Error updating mentor status",
            error: error.message,
        });
    }
};

// Approve/Reject mentor by userId (for Users page)
const approveMentorByUserIdController = async (req, res) => {
    try {
        const { userId, status } = req.body;
        console.log(`\n=== APPROVE/REJECT MENTOR BY USER ID: ${userId} to ${status} ===`);

        // 1. Update User
        // If status is approved, set role to mentor. If rejected/revoked, set role to mentee.
        const userUpdate = {
            mentorStatus: status,
            isMentor: status === 'approved',
            role: status === 'approved' ? 'mentor' : 'mentee'
        };

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { $set: userUpdate },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // 2. Update/Create Mentor Profile
        // We use findOneAndUpdate with upsert to ensure a profile exists
        await mentorProfileModel.findOneAndUpdate(
            { userId: userId },
            { 
                $set: { status: status },
                $setOnInsert: {
                    experience: "Not provided",
                    skills: [],
                    bio: ""
                }
            },
            { upsert: true, new: true }
        );

        // 3. Add Notification
        const notification = updatedUser.notifcation || [];
        notification.push({
            type: "mentor-status-update",
            message: status === 'approved' 
                ? "Your mentor application has been approved!" 
                : "Your mentor status has been revoked/rejected.",
            data: {
                onClickPath: "/profile",
            },
        });

        await userModel.findByIdAndUpdate(userId, { $set: { notifcation: notification } });

        console.log("✓ Mentor status updated successfully");

        res.status(200).send({
            success: true,
            message: `Mentor ${status} successfully`,
            data: updatedUser
        });

    } catch (error) {
        console.error("Error in approveMentorByUserIdController:", error);
        res.status(500).send({
            success: false,
            message: "Error updating mentor status",
            error: error.message,
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
        const pendingFeedback = await feedbackModel.countDocuments({ status: "pending" });

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
                pendingFeedback,
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

const requireAdminUser = async (req, res) => {
    try {
        if (!req.user?.id) {
            res.status(401).send({
                success: false,
                message: "Auth Failed - no user attached to token",
            });
            return null;
        }
        const adminUser = await userModel.findById(req.user.id).select("isAdmin");
        if (!adminUser || !adminUser.isAdmin) {
            res.status(403).send({
                success: false,
                message: "Admin access required",
            });
            return null;
        }
        return adminUser;
    } catch (error) {
        console.error("Error verifying admin user:", error);
        res.status(500).send({
            success: false,
            message: "Failed to verify admin permissions",
            error: error.message,
        });
        return null;
    }
};

const createUserController = async (req, res) => {
    try {
        const adminUser = await requireAdminUser(req, res);
        if (!adminUser) return;

        const { name, email, password, role = "mentee" } = req.body;
        if (!name || !email || !password) {
            return res.status(400).send({
                success: false,
                message: "Name, email, and password are required to create a user",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await userModel.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).send({
                success: false,
                message: "Email already in use",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profile = typeof req.body.profile === "object" ? req.body.profile : {};

        const newUser = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role,
            isAdmin: role === "admin",
            isMentor: role === "mentor",
            mentorStatus: role === "mentor" ? (req.body.mentorStatus || "pending") : undefined,
            profile,
        });

        newUser.password = undefined;
        res.status(201).send({
            success: true,
            message: "User created successfully",
            data: newUser,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send({
            success: false,
            message: "Error creating user",
            error: error.message,
        });
    }
};

const updateUserController = async (req, res) => {
    try {
        const adminUser = await requireAdminUser(req, res);
        if (!adminUser) return;

        const { userId } = req.params;
        if (!userId) {
            return res.status(400).send({
                success: false,
                message: "User ID parameter is required",
            });
        }

        const existingUser = await userModel.findById(userId);
        if (!existingUser) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        const updates = {};
        if (req.body.name) updates.name = req.body.name.trim();
        if (req.body.email) {
            const normalizedEmail = req.body.email.trim().toLowerCase();
            if (normalizedEmail !== existingUser.email) {
                const duplicate = await userModel.findOne({ email: normalizedEmail });
                if (duplicate && duplicate._id.toString() !== userId) {
                    return res.status(400).send({
                        success: false,
                        message: "Another user is already using that email",
                    });
                }
            }
            updates.email = normalizedEmail;
        }
        if (req.body.password) {
            updates.password = await bcrypt.hash(req.body.password, 10);
        }
        if (req.body.role) {
            updates.role = req.body.role;
            updates.isAdmin = req.body.role === "admin";
            updates.isMentor = req.body.role === "mentor";
            if (req.body.role !== "mentor") {
                updates.mentorStatus = null;
            } else if (!Object.prototype.hasOwnProperty.call(req.body, "mentorStatus") && !existingUser.mentorStatus) {
                updates.mentorStatus = "pending";
            }
        }
        if (Object.prototype.hasOwnProperty.call(req.body, "mentorStatus")) {
            updates.mentorStatus = req.body.mentorStatus || null;
        }
        if (req.body.profile && typeof req.body.profile === "object") {
            updates.profile = {
                ...(existingUser.profile instanceof Object ? existingUser.profile : {}),
                ...req.body.profile,
            };
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).send({
                success: false,
                message: "No valid fields provided to update",
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(userId, { $set: updates }, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        updatedUser.password = undefined;
        res.status(200).send({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).send({
            success: false,
            message: "Error updating user",
            error: error.message,
        });
    }
};

const deleteUserController = async (req, res) => {
    try {
        const adminUser = await requireAdminUser(req, res);
        if (!adminUser) return;

        const { userId } = req.params;
        if (!userId) {
            return res.status(400).send({
                success: false,
                message: "User ID parameter is required",
            });
        }

        const userToDelete = await userModel.findById(userId);
        if (!userToDelete) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        if (userToDelete.isAdmin) {
            const adminCount = await userModel.countDocuments({ isAdmin: true });
            if (adminCount <= 1) {
                return res.status(403).send({
                    success: false,
                    message: "Cannot delete the last admin",
                });
            }
        }

        await mentorProfileModel.deleteMany({ userId: userId });
        await userModel.findByIdAndDelete(userId);

        res.status(200).send({
            success: true,
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).send({
            success: false,
            message: "Error deleting user",
            error: error.message,
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
    createUserController,
    updateUserController,
    deleteUserController,
};