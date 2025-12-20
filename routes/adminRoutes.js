const express = require("express");
const {
    getAllUsersController,
    getAllMentorsController,
    approveMentorController,
    approveMentorByUserIdController,
    getDashboardStatsController,
    deleteMentorController,
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//GET METHOD || USERS
router.get("/getAllUsers", authMiddleware, getAllUsersController);

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

module.exports = router;