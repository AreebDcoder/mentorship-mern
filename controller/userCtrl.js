const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require('../models/doctorModels')

//register callback
const registerController = async (req, res) => {
    try {
        const exisitingUser = await userModel.findOne({ email: req.body.email });
        if (exisitingUser) {
            return res
                .status(200)
                .send({ message: "User Already Exist", success: false });
        }
        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        req.body.password = hashedPassword;
        const newUser = new userModel(req.body);
        await newUser.save();
        res.status(201).send({ message: "Register Sucessfully", success: true });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: `Register Controller ${error.message}`,
        });
    }
};

// login callback
const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email });
        if (!user) {
            return res
                .status(200)
                .send({ message: "user not found", success: false });
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res
                .status(200)
                .send({ message: "Invlid Email or Password", success: false });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
        });
        res.status(200).send({ message: "Login Success", success: true, token });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
    }
};

const authController = async (req, res) => {
    try {
        const user = await userModel.findById({ _id: req.body.userId });
        user.password = undefined;
        if (!user) {
            return res.status(200).send({
                message: "user not found",
                success: false,
            });
        } return res.status(200).send({
            success: true,
            data: {
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,  // 🔥 REQUIRED
                _id: user._id
            }
        });

    }
    catch (error) {
        console.log(error);
        res.status(500).send({
            message: "auth error",
            success: false,
            error,
        });
    }
};
const applyDoctorController = async (req, res) => {
    try {
        const newDoctor = await doctorModel({ ...req.body, status: 'pending' })
        await newDoctor.save();
        const adminUser = await userModel.findOne({ isAdmin: true })
        const notification = adminUser.notification
        notification.push({
            type: 'apply-doctor-request',
            message: `${newDoctor.firstName} ${newDoctor.lastName} has applied for doctor account`,
            data: {
                doctorId: newDoctor._id,
                name: newDoctor.firstName + " " + newDoctor.lastName,
                onClickPath: '/admin/doctors'
            }
        })
        await userModel.findByIdAndUpdate(adminUser._id, { notification })
        res.status(201).send({
            success: true,
            message: "Doctor account applied successfully",
        })

    } catch (error) {
        console.log(error);
        res.status(500).send({

            success: false,
            message: "Error while applying for doctor",
            error,


        })

    }
};
const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId);

        if (!user) {
            return res.status(404).send({
                success: false,
                message: "User not found"
            });
        }

        const seenNotification = user.seennotification || [];
        const notification = user.notification || [];

        // move all notifications to seen
        seenNotification.push(...notification);
        user.notification = [];
        user.seennotification = seenNotification;

        const updateUser = await user.save();

        res.status(200).send({
            success: true,
            message: 'All notifications marked as read',
            data: updateUser
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: 'Error in notification',
            success: false,
            error
        });
    }
}


module.exports = { loginController, registerController, authController, applyDoctorController, getAllNotificationController };