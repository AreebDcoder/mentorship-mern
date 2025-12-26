const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
    {
        mentorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ["job", "internship"],
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        company: {
            type: String,
            required: true,
        },
        location: {
            type: String,
        },
        requirements: [{
            type: String,
        }],
        applicationLink: {
            type: String,
        },
        deadline: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const opportunityModel = mongoose.model("opportunities", opportunitySchema);
module.exports = opportunityModel;

