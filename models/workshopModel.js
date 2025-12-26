const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
    {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Title is required"],
        },
        description: {
            type: String,
            required: [true, "Description is required"],
        },
        date: {
            type: Date,
            required: [true, "Date is required"],
        },
        time: {
            type: String,
            required: [true, "Time is required"],
        },
        duration: {
            type: Number, // in minutes
            required: [true, "Duration is required"],
        },
        maxSeats: {
            type: Number,
            required: [true, "Maximum seats is required"],
        },
        enrolledMentees: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],
        meetingLink: {
            type: String,
        },
        status: {
            type: String,
            enum: ["active", "completed", "cancelled"],
            default: "active",
        },
    },
    { timestamps: true }
);

const workshopModel = mongoose.model("workshops", workshopSchema);
module.exports = workshopModel;
