const mongoose = require("mongoose");

const mentorProfileSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        skills: [{
            type: String,
        }],
        industry: {
            type: String,
        },
        languages: [{
            type: String,
        }],
        tags: [{
            type: String,
        }],
        experience: {
            type: String,
            required: [true, "experience is required"],
        },
        availability: {
            type: Object,
            default: {},
        },
        bio: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        github: {
            type: String,
        },
        company: {
            type: String,
        },
        currentPosition: {
            type: String,
        },
        graduationYear: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        rating: {
            type: Number,
            default: 0,
        },
        totalSessions: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

const mentorProfileModel = mongoose.model("mentorProfiles", mentorProfileSchema);
module.exports = mentorProfileModel;