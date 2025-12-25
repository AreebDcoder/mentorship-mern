const mentorProfileModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
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
        users.forEach((u, i) => {
            console.log(`[${i}] ${u.name} | Role: ${u.role} | Status: ${u.mentorStatus} | ID: ${u._id}`);
        });
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


module.exports = {
    getAllUsersController,
    getAllMentorsController,
    approveMentorController,
    approveMentorByUserIdController,
    getDashboardStatsController,
    deleteMentorController,
};