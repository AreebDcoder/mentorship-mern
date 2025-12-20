const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        menteeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        scheduledDate: {
            type: Date,
            required: true,
        },
        duration: {
            type: Number, // in minutes
            default: 60,
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
            default: "pending",
        },
        meetingLink: {
            type: String,
        },
        meetingNotes: {
            type: String,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
        },
    },
    { timestamps: true }
);

const sessionModel = mongoose.model("sessions", sessionSchema);
module.exports = sessionModel;

