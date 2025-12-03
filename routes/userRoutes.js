const express = require('express');
const { loginController, registerController, authController, applyDoctorController, getAllNotificationController } = require('../controller/userCtrl');
const authMiddleware = require('../middlewares/authMiddleware');

const route = express.Router();

//login router
route.post('/login', loginController)
//register router
route.post('/register', registerController)
//auth
route.post('/getUserData', authMiddleware, authController)
//apply-doc
route.post('/apply-doctor', authMiddleware, applyDoctorController)
//
route.post('/get-all-notification', authMiddleware, getAllNotificationController)

module.exports = route;