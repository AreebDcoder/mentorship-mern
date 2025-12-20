const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        attachments: [{
            filename: String,
            fileUrl: String,
            fileType: String,
        }],
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const messageModel = mongoose.model("messages", messageSchema);
module.exports = messageModel;

