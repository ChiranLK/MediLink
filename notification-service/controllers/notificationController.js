import Notification from "../models/Notification.js";
import {
  processNotification,
  validateNotificationPayload,
} from "../services/notificationService.js";

// GET /notifications/history?email=...&recipientId=...&limit=20
export async function getNotificationHistory(req, res) {
  try {
    const { email, recipientId, limit = 20 } = req.query;
    if (!email && !recipientId) {
      return res.status(400).json({
        success: false,
        message: "email or recipientId query param is required.",
      });
    }
    const filter = {};
    if (recipientId) {
      filter.recipientId = recipientId;
    } else {
      filter.email = email.trim().toLowerCase();
    }
    const records = await Notification.find(filter)
      .sort({ timestamp: -1 })
      .limit(Math.min(Number(limit) || 20, 100))
      .lean();
    return res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("History error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch notification history.",
    });
  }
}

// PATCH /notifications/:id/read
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true },
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }
    return res.status(200).json({ success: true, data: notification });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read.",
    });
  }
}

// PATCH /notifications/read-all
export async function markAllAsRead(req, res) {
  try {
    const { recipientId, email } = req.body;
    if (!recipientId && !email) {
      return res
        .status(400)
        .json({ success: false, message: "recipientId or email is required." });
    }
    const filter = { read: false };
    if (recipientId) {
      filter.recipientId = recipientId;
    } else {
      filter.email = email.trim().toLowerCase();
    }
    const result = await Notification.updateMany(filter, { read: true });
    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read.`,
    });
  } catch (error) {
    console.error("Mark all read error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to mark all as read." });
  }
}

// DELETE /notifications/clear
export async function clearNotifications(req, res) {
  try {
    const { recipientId, email } = req.body;
    if (!recipientId && !email) {
      return res
        .status(400)
        .json({ success: false, message: "recipientId or email is required." });
    }
    const filter = {};
    if (recipientId) {
      filter.recipientId = recipientId;
    } else {
      filter.email = email.trim().toLowerCase();
    }
    const result = await Notification.deleteMany(filter);
    return res.status(200).json({
      success: true,
      message: `${result.deletedCount} notifications cleared.`,
    });
  } catch (error) {
    console.error("Clear notifications error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to clear notifications." });
  }
}

// Handles POST /api/notifications/notify request.
export async function sendNotification(req, res) {
  try {
    const {
      email,
      phone,
      name,
      type,
      patientName,
      appointmentDate,
      recipientId,
      recipientRole,
    } = req.body;

    const validationError = validateNotificationPayload({
      email,
      phone,
      name,
      type,
    });
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const result = await processNotification({
      email,
      phone,
      name,
      type,
      patientName,
      appointmentDate,
      recipientId,
      recipientRole,
    });

    if (result.finalStatus === "FAILED") {
      return res.status(500).json({
        success: false,
        message: "Both email and SMS delivery failed.",
        data: {
          emailStatus: result.emailStatus,
          smsStatus: result.smsStatus,
          error: result.error,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message:
        result.finalStatus === "SUCCESS"
          ? "Notification sent via email and SMS."
          : "Notification partially sent. One channel failed.",
      data: {
        emailStatus: result.emailStatus,
        smsStatus: result.smsStatus,
        type: result.type,
      },
    });
  } catch (error) {
    console.error("Notification controller error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to process notification request.",
      error: error.message,
    });
  }
}
