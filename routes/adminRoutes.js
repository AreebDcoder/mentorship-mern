const express = require("express");
const {
    getAllUsersController,
    getAllMentorsController,
    approveMentorController,
    approveMentorByUserIdController,
    getDashboardStatsController,
    deleteMentorController,
    createUserController,
    updateUserController,
    deleteUserController,
} = require("../controllers/adminCtrl");
const {
    getAllFeedbackController,
    updateFeedbackStatusController,
} = require("../controllers/feedbackCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

// CRUD for users
router.post("/users", authMiddleware, createUserController);
router.put("/users/:userId", authMiddleware, updateUserController);
router.delete("/users/:userId", authMiddleware, deleteUserController);

//GET METHOD || MENTORS
router.get("/getAllMentors", authMiddleware, getAllMentorsController);

//APPROVE/REJECT MENTOR || PUT
router.put("/approve-mentor", authMiddleware, approveMentorController);

//APPROVE/REJECT MENTOR BY USER ID || PUT
router.put("/approve-mentor-by-user", authMiddleware, approveMentorByUserIdController);

//DASHBOARD STATS || GET
router.get("/dashboard-stats", authMiddleware, getDashboardStatsController);
//DELETE MENTOR
router.delete('/mentors/:mentorId', authMiddleware, deleteMentorController);

//FEEDBACK MANAGEMENT
router.get("/getAllFeedback", authMiddleware, getAllFeedbackController);
router.put("/updateFeedbackStatus", authMiddleware, updateFeedbackStatusController);

module.exports = router;