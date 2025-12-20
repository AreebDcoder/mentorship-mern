const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mentorProfileModel = require("../models/doctorModel");
const sessionModel = require("../models/sessionModel");
const messageModel = require("../models/messageModel");
const opportunityModel = require("../models/opportunityModel");
const ratingModel = require("../models/ratingModel");

//register callback
const registerController = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email });
        if (existingUser) {
            return res
                .status(200)
                .send({ message: "User Already Exist", success: false });
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Set role and defaults
        const userData = {
            ...req.body,
            password: hashedPassword,
            role: req.body.role || "mentee",
        };

        // Only set mentor-specific fields if registering as mentor
        if (req.body.role === "mentor") {
            userData.isMentor = true;
            userData.mentorStatus = "pending";
        } else {
            // Mentees don't need these fields
            userData.isMentor = false;
            // Don't set mentorStatus for mentees
        }

        const newUser = new userModel(userData);
        await newUser.save();

        // Note: Mentor profile will be created when user applies via /apply-mentor route
        // This allows users to register first and complete their mentor profile later

        res.status(201).send({
            message: "Register Successfully",
            success: true,
            role: newUser.role
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: `Register Controller ${error.message}`,
        });
    }
};

// login callback
const loginController = async (req, res) => {
    try {
        console.log("\n========================================");
        console.log("LOGIN REQUEST");
        console.log("========================================");
        console.log("Email:", req.body.email);
        console.log("Password provided:", !!req.body.password);

        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            console.log("❌ User not found");
            console.log("========================================\n");
            return res
                .status(404)
                .send({ message: "user not found", success: false });
        }

        console.log("✓ User found:", user.name);
        console.log("  Role:", user.role);
        console.log("  isAdmin:", user.isAdmin);
        console.log("  isMentor:", user.isMentor);

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            console.log("❌ Password mismatch");
            console.log("========================================\n");
            return res
                .status(401)
                .send({ message: "Invalid Email or Password", success: false });
        }

        console.log("✓ Password matched");

        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET not configured!");
            console.log("========================================\n");
            return res.status(500).send({
                message: "Server configuration error",
                success: false,
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });

        console.log("✓ Token generated");
        console.log("✓ Login successful for:", user.email);
        console.log("========================================\n");

        res.status(200).send({ message: "Login Success", success: true, token });
    } catch (error) {
        console.error("\n========================================");
        console.error("❌ LOGIN ERROR");
        console.error("========================================");
        console.error("Error:", error);
        console.error("Stack:", error.stack);
        console.error("========================================\n");
        res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
    }
};

const authController = async (req, res) => {
    try {
        console.log("\n=== GET USER DATA REQUEST ===");
        // Check if userId is provided in body (for fetching other users) or use token userId (for current user)
        const userId = req.body.userId || req.user?.id;
        console.log("User ID:", userId);
        console.log("Source:", req.body.userId ? "request body" : "token");

        const user = await userModel.findById(userId);
        if (!user) {
            console.log("❌ User not found");
            console.log("================================\n");
            return res.status(200).send({
                message: "user not found",
                success: false,
            });
        }

        console.log("✓ User found:", user.name, `(${user.email})`);
        console.log("  Role:", user.role);
        console.log("  isAdmin:", user.isAdmin);
        console.log("  isMentor:", user.isMentor);
        console.log("  mentorStatus:", user.mentorStatus);
        console.log("================================\n");

        user.password = undefined;
        res.status(200).send({
            success: true,
            data: user,
        });
    } catch (error) {
        console.error("\n=== AUTH ERROR ===");
        console.error("Error:", error);
        console.error("==================\n");
        res.status(500).send({
            message: "auth error",
            success: false,
            error,
        });
    }
};

// Apply Mentor Profile CTRL
const applyMentorController = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Update user role and status
        user.role = "mentor";
        user.isMentor = true;
        user.mentorStatus = "pending";
        if (req.body.profile) {
            user.profile = { ...user.profile, ...req.body.profile };
        }
        await user.save();

        // Create or update mentor profile
        let mentorProfile = await mentorProfileModel.findOne({ userId });
        if (mentorProfile) {
            mentorProfile = await mentorProfileModel.findByIdAndUpdate(
                mentorProfile._id,
                {
                    skills: req.body.skills || mentorProfile.skills,
                    experience: req.body.experience || mentorProfile.experience,
                    availability: req.body.availability || mentorProfile.availability,
                    bio: req.body.bio || mentorProfile.bio,
                    linkedin: req.body.linkedin || mentorProfile.linkedin,
                    github: req.body.github || mentorProfile.github,
                    company: req.body.company || mentorProfile.company,
                    currentPosition: req.body.currentPosition || mentorProfile.currentPosition,
                    graduationYear: req.body.graduationYear || mentorProfile.graduationYear,
                    status: "pending",
                },
                { new: true }
            );
        } else {
            mentorProfile = new mentorProfileModel({
                userId,
                skills: req.body.skills || [],
                experience: req.body.experience || "",
                availability: req.body.availability || {},
                bio: req.body.bio || "",
                linkedin: req.body.linkedin || "",
                github: req.body.github || "",
                company: req.body.company || "",
                currentPosition: req.body.currentPosition || "",
                graduationYear: req.body.graduationYear || "",
                status: "pending",
            });
            await mentorProfile.save();
        }

        // Notify admin
        const adminUser = await userModel.findOne({ isAdmin: true });
        if (adminUser) {
            const notification = adminUser.notifcation || [];
            notification.push({
                type: "mentor-application",
                message: `${user.name} has applied to become a mentor`,
                data: {
                    userId: user._id,
                    name: user.name,
                    onClickPath: "/admin/mentors",
                },
            });
            await userModel.findByIdAndUpdate(adminUser._id, { notifcation: notification });
        }

        res.status(201).send({
            success: true,
            message: "Mentor Application Submitted Successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error While Applying For Mentor",
        });
    }
};

// Get all mentors
const getAllMentorsController = async (req, res) => {
    try {
        console.log("\n=== GET ALL MENTORS REQUEST ===");

        // First, let's check all mentor profiles to debug
        const allProfiles = await mentorProfileModel.find({}).select("_id userId status");
        console.log(`Total mentor profiles in DB: ${allProfiles.length}`);
        allProfiles.forEach(p => {
            console.log(`  Profile ID: ${p._id}, User ID: ${p.userId}, Status: "${p.status}" (type: ${typeof p.status})`);
        });

        // Count approved profiles before populate
        const approvedCount = await mentorProfileModel.countDocuments({ status: "approved" });
        console.log(`Mentor profiles with status "approved": ${approvedCount}`);

        // Get all approved mentor profiles
        const allApprovedProfiles = await mentorProfileModel
            .find({ status: "approved" })
            .populate({
                path: "userId",
                select: "name email profile isAdmin",
            })
            .sort({ rating: -1 })
            .lean();

        console.log(`Found ${allApprovedProfiles.length} approved mentor profiles`);

        // Filter out any mentors with admin users or null userId
        const mentors = allApprovedProfiles.filter(m => {
            if (!m.userId) {
                console.log(`  Filtering out profile ${m._id} - userId is null`);
                return false;
            }
            if (m.userId.isAdmin === true) {
                console.log(`  Filtering out profile ${m._id} - user is admin: ${m.userId.name}`);
                return false;
            }
            return true;
        });

        console.log(`\n=== FINAL RESULT: ${mentors.length} approved mentors with valid users ===`);
        mentors.forEach(m => {
            console.log(`  ✓ Mentor: ${m.userId?.name || 'N/A'}, Profile ID: ${m._id}, Status: ${m.status}, User ID: ${m.userId?._id || 'N/A'}`);
        });
        if (allApprovedProfiles.length > mentors.length) {
            console.log(`  ⚠ Filtered out ${allApprovedProfiles.length - mentors.length} mentors with admin users or null userId`);
        }
        console.log("==========================================\n");

        res.status(200).send({
            success: true,
            message: "Mentors list",
            data: mentors,
        });
    } catch (error) {
        console.error("ERROR in getAllMentorsController:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching mentors",
            error: error.message,
        });
    }
};

// Get mentor profile by mentorProfileId
const getMentorProfileController = async (req, res) => {
    try {
        const mentor = await mentorProfileModel
            .findOne({ _id: req.params.id, status: "approved" })
            .populate("userId", "name email profile");
        if (!mentor) {
            return res.status(404).send({
                success: false,
                message: "Mentor not found or not approved",
            });
        }
        res.status(200).send({
            success: true,
            data: mentor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error fetching mentor profile",
            error,
        });
    }
};

//notification ctrl
const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        const seennotification = user.seennotification;
        const notification = user.notifcation;
        seennotification.push(...notification);
        user.notifcation = [];
        user.seennotification = seennotification;
        const updatedUser = await user.save();
        updatedUser.password = undefined;
        res.status(200).send({
            success: true,
            message: "all notification marked as read",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error in notification",
            success: false,
            error,
        });
    }
};

// delete notifications
const deleteAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }
        user.notifcation = [];
        user.seennotification = [];
        const updatedUser = await user.save();
        updatedUser.password = undefined;
        res.status(200).send({
            success: true,
            message: "Notifications Deleted successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "unable to delete all notifications",
            error,
        });
    }
};

// Session Controllers
const createSessionController = async (req, res) => {
    try {
        // req.body.mentorId is the mentorProfileId
        const mentorProfile = await mentorProfileModel.findById(req.body.mentorId);
        if (!mentorProfile) {
            return res.status(404).send({
                success: false,
                message: "Mentor profile not found",
            });
        }

        // IMPORTANT: mentorId in session should be the user ID, not the profile ID
        const session = new sessionModel({
            mentorId: mentorProfile.userId, // Use the actual user ID from the mentor profile
            menteeId: req.body.userId,
            title: req.body.title,
            description: req.body.description,
            scheduledDate: req.body.scheduledDate,
            duration: req.body.duration || 60,
            status: "pending",
        });
        await session.save();

        console.log("Session created:", {
            sessionId: session._id,
            mentorUserId: mentorProfile.userId,
            menteeUserId: req.body.userId,
            title: session.title
        });

        // Notify mentor - get user from mentor profile
        const mentorUser = await userModel.findById(mentorProfile.userId);
        if (mentorUser) {
            const notification = mentorUser.notifcation || [];
            const mentee = await userModel.findById(req.body.userId);
            notification.push({
                type: "session-request",
                message: `${mentee.name} has requested a mentorship session`,
                data: {
                    sessionId: session._id,
                    onClickPath: "/sessions",
                },
            });
            await userModel.findByIdAndUpdate(mentorProfile.userId, { notifcation: notification });
        }

        res.status(201).send({
            success: true,
            message: "Session request sent successfully",
            data: session,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error creating session",
            error,
        });
    }
};

const updateSessionController = async (req, res) => {
    try {
        const { sessionId, status, meetingLink, meetingNotes } = req.body;
        console.log("Updating session:", { sessionId, status, hasMeetingLink: !!meetingLink });

        const session = await sessionModel.findById(sessionId);
        if (!session) {
            return res.status(404).send({
                success: false,
                message: "Session not found",
            });
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (meetingLink) updateData.meetingLink = meetingLink;
        if (meetingNotes) updateData.meetingNotes = meetingNotes;

        const updatedSession = await sessionModel.findByIdAndUpdate(sessionId, updateData, { new: true });
        console.log("Session updated successfully:", updatedSession._id);

        // Notify mentee if accepted
        if (status === "accepted") {
            const mentee = await userModel.findById(session.menteeId);
            if (mentee) {
                const notification = mentee.notifcation || [];
                const mentor = await userModel.findById(session.mentorId);
                notification.push({
                    type: "session-accepted",
                    message: `${mentor.name} has accepted your session request`,
                    data: {
                        sessionId: session._id,
                        onClickPath: "/sessions",
                    },
                });
                await userModel.findByIdAndUpdate(session.menteeId, { notifcation: notification });
            }
        }

        res.status(200).send({
            success: true,
            message: "Session updated successfully",
            data: updatedSession,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error updating session",
            error,
        });
    }
};

const getSessionsController = async (req, res) => {
    try {
        const userId = req.body.userId;
        console.log("Fetching sessions for user:", userId);

        const sessions = await sessionModel
            .find({
                $or: [{ mentorId: userId }, { menteeId: userId }],
            })
            .populate("mentorId", "name email")
            .populate("menteeId", "name email")
            .sort({ scheduledDate: -1 });

        console.log(`Found ${sessions.length} sessions for user ${userId}`);
        const pendingSessions = sessions.filter(s => s.status === 'pending');
        console.log(`  - ${pendingSessions.length} pending sessions`);

        res.status(200).send({
            success: true,
            data: sessions,
        });
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching sessions",
            error,
        });
    }
};

// Add this controller after getSessionsController and before Message Controllers section

const deleteSessionController = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.body.userId;

        console.log("\n=== DELETE SESSION REQUEST ===");
        console.log("Session ID:", sessionId);
        console.log("User ID:", userId);

        // Find the session
        const session = await sessionModel.findById(sessionId);

        if (!session) {
            console.log("❌ Session not found");
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        console.log("Session found:", {
            mentorId: session.mentorId,
            menteeId: session.menteeId,
            status: session.status
        });

        // Verify the user is either the mentor OR the mentee
        const isMentor = session.mentorId.toString() === userId.toString();
        const isMentee = session.menteeId.toString() === userId.toString();

        if (!isMentor && !isMentee) {
            console.log("❌ Unauthorized - user is neither mentor nor mentee");
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this session'
            });
        }

        // Only allow deletion of rejected sessions
        if (session.status !== 'rejected') {
            console.log("❌ Cannot delete - session status is not rejected");
            return res.status(400).json({
                success: false,
                message: 'Only rejected sessions can be deleted'
            });
        }

        // Delete the session from MongoDB
        await sessionModel.findByIdAndDelete(sessionId);

        console.log(`✓ Session deleted successfully by ${isMentor ? 'mentor' : 'mentee'}`);
        console.log("================================\n");

        res.status(200).json({
            success: true,
            message: 'Session deleted successfully'
        });

    } catch (error) {
        console.error("\n=== ERROR DELETING SESSION ===");
        console.error("Error:", error);
        console.error("================================\n");
        res.status(500).json({
            success: false,
            message: 'Failed to delete session',
            error: error.message
        });
    }
};

// Message Controllers
const sendMessageController = async (req, res) => {
    try {
        const senderId = req.user?.id || req.body.userId;
        const receiverId = req.body.receiverId;

        console.log("\n=== SEND MESSAGE REQUEST ===");
        console.log("Sender ID:", senderId);
        console.log("Receiver ID:", receiverId);
        console.log("Message:", req.body.message);

        if (!senderId) {
            console.error("ERROR: No sender ID found");
            return res.status(400).send({
                success: false,
                message: "Sender ID is required",
            });
        }

        if (!receiverId) {
            console.error("ERROR: No receiver ID provided");
            return res.status(400).send({
                success: false,
                message: "Receiver ID is required",
            });
        }

        if (!req.body.message || !req.body.message.trim()) {
            console.error("ERROR: Empty message");
            return res.status(400).send({
                success: false,
                message: "Message cannot be empty",
            });
        }

        // Verify both users exist
        const sender = await userModel.findById(senderId);
        const receiver = await userModel.findById(receiverId);

        if (!sender) {
            console.error("ERROR: Sender not found");
            return res.status(404).send({
                success: false,
                message: "Sender not found",
            });
        }

        if (!receiver) {
            console.error("ERROR: Receiver not found");
            return res.status(404).send({
                success: false,
                message: "Receiver not found",
            });
        }

        console.log("Creating message...");
        const message = new messageModel({
            senderId: senderId,
            receiverId: receiverId,
            message: req.body.message,
            attachments: req.body.attachments || [],
        });
        await message.save();
        console.log("✓ Message saved:", message._id);

        // Notify receiver (receiver already fetched above for validation)
        if (receiver) {
            const notification = receiver.notifcation || [];
            notification.push({
                type: "new-message",
                message: `New message from ${sender.name}`,
                data: {
                    messageId: message._id,
                    onClickPath: "/messages",
                },
            });
            await userModel.findByIdAndUpdate(receiverId, { notifcation: notification });
        }

        const populatedMessage = await messageModel.findById(message._id)
            .populate("senderId", "name email")
            .populate("receiverId", "name email");

        console.log("✓ Message sent successfully");
        console.log("================================\n");

        res.status(201).send({
            success: true,
            message: "Message sent successfully",
            data: populatedMessage,
        });
    } catch (error) {
        console.error("\n=== ERROR SENDING MESSAGE ===");
        console.error("Error:", error);
        console.error("Stack:", error.stack);
        console.error("================================\n");
        res.status(500).send({
            success: false,
            message: "Error sending message",
            error: error.message,
        });
    }
};

const getMessagesController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;
        const otherUserId = req.params.id;

        console.log("\n=== GET MESSAGES REQUEST ===");
        console.log("Current user ID:", userId);
        console.log("Other user ID:", otherUserId);

        if (!otherUserId) {
            console.error("ERROR: No other user ID provided");
            return res.status(400).send({
                success: false,
                message: "Other user ID is required",
            });
        }

        const messages = await messageModel
            .find({
                $or: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            })
            .populate("senderId", "name email")
            .populate("receiverId", "name email")
            .sort({ createdAt: 1 });

        console.log(`Found ${messages.length} messages`);

        // Mark as read
        const markResult = await messageModel.updateMany(
            { receiverId: userId, senderId: otherUserId, isRead: false },
            { isRead: true }
        );
        console.log(`Marked ${markResult.modifiedCount} messages as read`);
        console.log("================================\n");

        res.status(200).send({
            success: true,
            data: messages,
        });
    } catch (error) {
        console.error("\n=== ERROR FETCHING MESSAGES ===");
        console.error("Error:", error);
        console.error("================================\n");
        res.status(500).send({
            success: false,
            message: "Error fetching messages",
            error: error.message,
        });
    }
};

// Get conversations list (users you've messaged with)
const getConversationsController = async (req, res) => {
    try {
        const userId = req.user?.id || req.body.userId;

        console.log("\n=== GET CONVERSATIONS REQUEST ===");
        console.log("User ID:", userId);

        // Get all unique users you've messaged with
        const sentMessages = await messageModel.find({ senderId: userId }).distinct("receiverId");
        const receivedMessages = await messageModel.find({ receiverId: userId }).distinct("senderId");

        console.log(`Sent messages to ${sentMessages.length} users`);
        console.log(`Received messages from ${receivedMessages.length} users`);

        // Combine and get unique user IDs
        const allUserIds = [...new Set([...sentMessages, ...receivedMessages])];

        // Get user details and last message for each conversation
        const conversations = await Promise.all(
            allUserIds.map(async (otherUserId) => {
                const otherUser = await userModel.findById(otherUserId).select("name email profile").lean();
                const lastMessage = await messageModel
                    .findOne({
                        $or: [
                            { senderId: userId, receiverId: otherUserId },
                            { senderId: otherUserId, receiverId: userId },
                        ],
                    })
                    .sort({ createdAt: -1 })
                    .populate("senderId", "name")
                    .lean();

                const unreadCount = await messageModel.countDocuments({
                    senderId: otherUserId,
                    receiverId: userId,
                    isRead: false,
                });

                return {
                    _id: otherUser._id,
                    name: otherUser.name,
                    email: otherUser.email,
                    profile: otherUser.profile,
                    lastMessage: lastMessage ? {
                        message: lastMessage.message,
                        createdAt: lastMessage.createdAt,
                        senderName: lastMessage.senderId?.name,
                    } : null,
                    unreadCount,
                };
            })
        );

        // Sort by last message time (most recent first)
        conversations.sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });

        console.log(`Returning ${conversations.length} conversations`);
        console.log("================================\n");

        res.status(200).send({
            success: true,
            data: conversations,
        });
    } catch (error) {
        console.error("\n=== ERROR FETCHING CONVERSATIONS ===");
        console.error("Error:", error);
        console.error("================================\n");
        res.status(500).send({
            success: false,
            message: "Error fetching conversations",
            error: error.message,
        });
    }
};

// Opportunity Controllers
const createOpportunityController = async (req, res) => {
    try {
        const opportunity = new opportunityModel({
            mentorId: req.body.userId,
            title: req.body.title,
            type: req.body.type,
            description: req.body.description,
            company: req.body.company,
            location: req.body.location,
            requirements: req.body.requirements || [],
            applicationLink: req.body.applicationLink,
            deadline: req.body.deadline,
        });
        await opportunity.save();

        // Notify all mentees
        const mentees = await userModel.find({ role: "mentee" });
        for (const mentee of mentees) {
            const notification = mentee.notifcation || [];
            notification.push({
                type: "new-opportunity",
                message: `New ${req.body.type} opportunity: ${req.body.title}`,
                data: {
                    opportunityId: opportunity._id,
                    onClickPath: "/opportunities",
                },
            });
            await userModel.findByIdAndUpdate(mentee._id, { notifcation: notification });
        }

        res.status(201).send({
            success: true,
            message: "Opportunity posted successfully",
            data: opportunity,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error creating opportunity",
            error,
        });
    }
};

const getOpportunitiesController = async (req, res) => {
    try {
        const opportunities = await opportunityModel
            .find({ isActive: true })
            .populate("mentorId", "name email")
            .sort({ createdAt: -1 });
        res.status(200).send({
            success: true,
            data: opportunities,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error fetching opportunities",
            error,
        });
    }
};

//delete opportunity

const deleteOpportunityController = async (req, res) => {
    try {
        const { opportunityId } = req.params;
        const userId = req.body.userId;

        console.log("\n=== DELETE OPPORTUNITY REQUEST ===");
        console.log("Opportunity ID:", opportunityId);
        console.log("User ID:", userId);

        // Find the opportunity
        const opportunity = await opportunityModel.findById(opportunityId);

        if (!opportunity) {
            console.log("❌ Opportunity not found");
            return res.status(404).json({
                success: false,
                message: 'Opportunity not found'
            });
        }

        console.log("Opportunity found:", {
            mentorId: opportunity.mentorId,
            title: opportunity.title
        });

        // Verify the user is the mentor who created it
        if (opportunity.mentorId.toString() !== userId.toString()) {
            console.log("❌ Unauthorized - user is not the creator");
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this opportunity'
            });
        }

        // Delete the opportunity from MongoDB
        await opportunityModel.findByIdAndDelete(opportunityId);

        console.log("✓ Opportunity deleted successfully");
        console.log("================================\n");

        res.status(200).json({
            success: true,
            message: 'Opportunity deleted successfully'
        });

    } catch (error) {
        console.error("\n=== ERROR DELETING OPPORTUNITY ===");
        console.error("Error:", error);
        console.error("================================\n");
        res.status(500).json({
            success: false,
            message: 'Failed to delete opportunity',
            error: error.message
        });
    }
};

// Rating Controller
const submitRatingController = async (req, res) => {
    try {
        const session = await sessionModel.findById(req.body.sessionId);
        if (!session) {
            return res.status(404).send({
                success: false,
                message: "Session not found",
            });
        }

        // Update session with rating
        session.rating = req.body.rating;
        session.feedback = req.body.feedback;
        session.status = "completed";
        await session.save();

        // Create rating record
        const rating = new ratingModel({
            sessionId: req.body.sessionId,
            mentorId: session.mentorId,
            menteeId: session.menteeId,
            rating: req.body.rating,
            feedback: req.body.feedback,
        });
        await rating.save();

        // Update mentor's average rating
        const mentorRatings = await ratingModel.find({ mentorId: session.mentorId });
        const avgRating = mentorRatings.reduce((sum, r) => sum + r.rating, 0) / mentorRatings.length;
        await mentorProfileModel.findOneAndUpdate(
            { userId: session.mentorId },
            { rating: avgRating, $inc: { totalSessions: 1 } }
        );

        res.status(201).send({
            success: true,
            message: "Rating submitted successfully",
            data: rating,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error submitting rating",
            error,
        });
    }
};

// Update Profile Controller
const updateProfileController = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found",
            });
        }

        // Update user fields
        if (req.body.name) user.name = req.body.name;
        if (req.body.profile) {
            user.profile = {
                ...user.profile,
                ...req.body.profile,
            };
        }

        await user.save();
        user.password = undefined;

        res.status(200).send({
            success: true,
            message: "Profile updated successfully",
            data: user,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Error updating profile",
            error,
        });
    }
};

module.exports = {
    loginController,
    registerController,
    authController,
    applyMentorController,
    getAllMentorsController,
    getMentorProfileController,
    getAllNotificationController,
    deleteAllNotificationController,
    createSessionController,
    updateSessionController,
    getSessionsController,
    deleteSessionController,
    sendMessageController,
    getMessagesController,
    getConversationsController,
    createOpportunityController,
    getOpportunitiesController,
    deleteOpportunityController,
    submitRatingController,
    updateProfileController,
};