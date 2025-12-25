const workshopModel = require("../models/workshopModel");
const userModel = require("../models/userModels");

// Create Workshop
const createWorkshopController = async (req, res) => {
    try {
        const { title, description, date, time, duration, maxSeats, meetingLink } = req.body;
        const mentorId = req.body.userId;

        const newWorkshop = new workshopModel({
            mentorId,
            title,
            description,
            date,
            time,
            duration,
            maxSeats,
            meetingLink,
        });

        await newWorkshop.save();

        res.status(201).send({
            success: true,
            message: "Workshop created successfully",
            data: newWorkshop,
        });
    } catch (error) {
        console.error("Error in createWorkshopController:", error);
        res.status(500).send({
            success: false,
            message: "Error creating workshop",
            error: error.message,
        });
    }
};

// Get All Workshops
const getAllWorkshopsController = async (req, res) => {
    try {
        const workshops = await workshopModel
            .find({ status: "active" })
            .populate("mentorId", "name email profile")
            .sort({ date: 1 });

        res.status(200).send({
            success: true,
            message: "Workshops fetched successfully",
            data: workshops,
        });
    } catch (error) {
        console.error("Error in getAllWorkshopsController:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching workshops",
            error: error.message,
        });
    }
};

// Join Workshop
const joinWorkshopController = async (req, res) => {
    try {
        const { workshopId } = req.body;
        const menteeId = req.body.userId;

        const workshop = await workshopModel.findById(workshopId);

        if (!workshop) {
            return res.status(404).send({
                success: false,
                message: "Workshop not found",
            });
        }

        if (workshop.enrolledMentees.includes(menteeId)) {
            return res.status(400).send({
                success: false,
                message: "You are already enrolled in this workshop",
            });
        }

        if (workshop.enrolledMentees.length >= workshop.maxSeats) {
            return res.status(400).send({
                success: false,
                message: "Workshop is full",
            });
        }

        workshop.enrolledMentees.push(menteeId);
        await workshop.save();

        res.status(200).send({
            success: true,
            message: "Joined workshop successfully",
            data: workshop,
        });
    } catch (error) {
        console.error("Error in joinWorkshopController:", error);
        res.status(500).send({
            success: false,
            message: "Error joining workshop",
            error: error.message,
        });
    }
};

// Get User Workshops (Workshops created by mentor or joined by mentee)
const getUserWorkshopsController = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await userModel.findById(userId);

        let workshops;
        if (user.role === "mentor") {
            workshops = await workshopModel.find({ mentorId: userId }).sort({ date: 1 });
        } else {
            workshops = await workshopModel.find({ enrolledMentees: userId }).populate("mentorId", "name email").sort({ date: 1 });
        }

        res.status(200).send({
            success: true,
            message: "User workshops fetched successfully",
            data: workshops,
        });
    } catch (error) {
        console.error("Error in getUserWorkshopsController:", error);
        res.status(500).send({
            success: false,
            message: "Error fetching user workshops",
            error: error.message,
        });
    }
};

module.exports = {
    createWorkshopController,
    getAllWorkshopsController,
    joinWorkshopController,
    getUserWorkshopsController,
};
