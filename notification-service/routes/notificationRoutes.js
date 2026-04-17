import express from "express";
import {
  sendNotification,
  getNotificationHistory,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from "../controllers/notificationController.js";

const router = express.Router();

// Single notification endpoint for external microservice integration.
router.post("/notify", sendNotification);

// Fetch notification history for a patient/doctor by email or recipientId.
router.get("/history", getNotificationHistory);

// Mark a single notification as read.
router.patch("/:id/read", markAsRead);

// Mark all notifications as read for a user.
router.patch("/read-all", markAllAsRead);

// Clear all notifications for a user.
router.delete("/clear", clearNotifications);

export default router;
