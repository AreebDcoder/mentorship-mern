const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "sessions",
            required: true,
        },
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
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        feedback: {
            type: String,
        },
    },
    { timestamps: true }
);

const ratingModel = mongoose.model("ratings", ratingSchema);
module.exports = ratingModel;

