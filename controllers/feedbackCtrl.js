const feedbackModel = require("../models/feedbackModel");

// Submit Feedback (User)
const submitFeedbackController = async (req, res) => {
    try {
        const { type, subject, message } = req.body;
        const userId = req.body.userId;

        const newFeedback = new feedbackModel({
            userId,
            type,
            subject,
            message,
        });

        await newFeedback.save();

        res.status(201).send({
            success: true,
            message: "Feedback submitted successfully",
        });
    } catch (error) {
        console.error("Error in submitFeedbackController:", error);
        res.status(500).send({
            success: false,
            message: "Error submitting feedback",
            error: error.message,
        });
    }
};

// Get All Feedback (Admin)
const getAllFeedbackController = async (req, res) => {
    try {
        const feedbacks = await feedbackModel
            .find({})
            .populate("userId", "name email role")
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            message: "Feedbacks fetched successfully",
            data: feedbacks,
        });
    } catch (error) {
        console.error("Error in getAllFeedbackController:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching feedbacks",
            error: error.message,
        });
    }
};

// Update Feedback Status (Admin)
const updateFeedbackStatusController = async (req, res) => {
    try {
        const { feedbackId, status, adminNotes } = req.body;

        const updatedFeedback = await feedbackModel.findByIdAndUpdate(
            feedbackId,
            { status, adminNotes },
            { new: true }
        );

        res.status(200).send({
            success: true,
            message: "Feedback status updated successfully",
            data: updatedFeedback,
        });
    } catch (error) {
        console.error("Error in updateFeedbackStatusController:", error);
        res.status(500).send({
            success: false,
            message: "Error updating feedback status",
            error: error.message,
        });
    }
};

module.exports = {
    submitFeedbackController,
    getAllFeedbackController,
    updateFeedbackStatusController,
};
