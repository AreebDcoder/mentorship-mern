const express = require("express");
const {
    loginController,
    registerController,
    authController,
    applyMentorController,
    getAllMentorsController,
    getMentorProfileController,
    getAllNotificationController,
    deleteAllNotificationController,
    createSessionController,
    updateSessionController,
    getSessionsController,
    deleteSessionController,
    sendMessageController,
    getMessagesController,
    getConversationsController,
    createOpportunityController,
    getOpportunitiesController,
    deleteOpportunityController,
    submitRatingController,
    updateProfileController,
    getFavoriteMentorsController,
    toggleFavoriteMentorController,
} = require("../controllers/userCtrl");
const {
    createWorkshopController,
    getAllWorkshopsController,
    joinWorkshopController,
    getUserWorkshopsController,
} = require("../controllers/workshopCtrl");
const { submitFeedbackController } = require("../controllers/feedbackCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

//router object
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//Apply Mentor || POST
router.post("/apply-mentor", authMiddleware, applyMentorController);

//Get All Mentors || GET
router.get("/mentors", getAllMentorsController);

//Get Mentor Profile || GET
router.get("/mentor/:id", getMentorProfileController);

//Notification || POST
router.post(
    "/get-all-notification",
    authMiddleware,
    getAllNotificationController
);
router.post(
    "/delete-all-notification",
    authMiddleware,
    deleteAllNotificationController
);

//Sessions || POST/GET
router.post("/sessions", authMiddleware, createSessionController);
router.put("/sessions", authMiddleware, updateSessionController);
router.post("/get-sessions", authMiddleware, getSessionsController);
// DELETE route for deleting rejected sessions
router.delete('/sessions/:sessionId', authMiddleware, deleteSessionController);

//Messages || POST/GET
router.post("/messages", authMiddleware, sendMessageController);
router.get("/messages/:id", authMiddleware, getMessagesController);
router.get("/conversations", authMiddleware, getConversationsController);

//Opportunities || POST/GET
router.post("/opportunities", authMiddleware, createOpportunityController);
router.get("/opportunities", getOpportunitiesController);
router.delete('/opportunities/:opportunityId', authMiddleware, deleteOpportunityController);

//Ratings || POST
router.post("/ratings", authMiddleware, submitRatingController);

//Update Profile || PUT
router.put("/update-profile", authMiddleware, updateProfileController);

// Favorite mentors || GET/POST (toggle)
router.get("/favorites", authMiddleware, getFavoriteMentorsController);
router.post("/favorites/:mentorId", authMiddleware, toggleFavoriteMentorController);

// Workshops || POST/GET
router.post("/workshops", authMiddleware, createWorkshopController);
router.get("/workshops", authMiddleware, getAllWorkshopsController);
router.post("/join-workshop", authMiddleware, joinWorkshopController);
router.get("/user-workshops", authMiddleware, getUserWorkshopsController);

// Feedback || POST
router.post("/submit-feedback", authMiddleware, submitFeedbackController);

module.exports = router;