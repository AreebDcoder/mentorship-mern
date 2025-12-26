const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is require"],
    },
    email: {
        type: String,
        required: [true, "email is require"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "password is require"],
    },
    role: {
        type: String,
        enum: ["mentor", "mentee", "admin"],
        default: "mentee",
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isMentor: {
        type: Boolean,
        default: false,
    },
    mentorStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
    },
    profile: {
        phone: String,
        address: String,
        bio: String,
        linkedin: String,
        github: String,
        graduationYear: String,
        currentPosition: String,
        company: String,
        profilePicture: String, // Base64 encoded image or URL
    },
    notifcation: {
        type: Array,
        default: [],
    },
    seennotification: {
        type: Array,
        default: [],
    },
    favoriteMentors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "mentorProfiles",
        default: [],
    }],
}, { timestamps: true });

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;