import express from "express";
import {
  sendNotification,
  getNotificationHistory,
} from "../controllers/notificationController.js";

const router = express.Router();

// Single notification endpoint for external microservice integration.
router.post("/notify", sendNotification);

// Fetch notification history for a patient by email.
router.get("/history", getNotificationHistory);

export default router;
