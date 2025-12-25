const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        type: {
            type: String,
            enum: ["bug", "feedback", "suggestion", "other"],
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved", "closed"],
            default: "pending",
        },
        adminNotes: {
            type: String,
        },
    },
    { timestamps: true }
);

const feedbackModel = mongoose.model("feedbacks", feedbackSchema);
module.exports = feedbackModel;
