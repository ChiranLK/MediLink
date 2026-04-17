import mongoose from "mongoose";
import Notification from "../models/Notification.js";
import { sendEmailNotification } from "../services/emailService.js";
import { sendSmsNotification } from "../services/smsService.js";
import { isValidEmail, normalizeLkPhone } from "../utils/validation.js";

const ALLOWED_TYPES = [
  "APPOINTMENT_BOOKED",
  "CONSULTATION_COMPLETED",
  "APPOINTMENT_BOOKED_DOCTOR",
  "CONSULTATION_COMPLETED_DOCTOR",
];

// GET /notify/history?email=...&limit=20
export async function getNotificationHistory(req, res) {
  try {
    const { email, limit = 20 } = req.query;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "email query param is required." });
    }
    const records = await Notification.find({
      email: email.trim().toLowerCase(),
    })
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

// Builds dynamic message content based on notification event type.
function buildNotificationMessage(type, name, extra = {}) {
  if (type === "APPOINTMENT_BOOKED") {
    const subject = "Appointment Successfully Booked – MediLink";
    const text = `Hello ${name}, your appointment has been successfully booked in MediLink. Our team will confirm the details shortly.`;
    return { subject, text, html: wrapHtml(subject, text) };
  }
  if (type === "CONSULTATION_COMPLETED") {
    const subject = "Consultation Completed – MediLink";
    const text = `Hello ${name}, your consultation has been marked as completed in MediLink. Thank you for using MediLink.`;
    return { subject, text, html: wrapHtml(subject, text) };
  }
  if (type === "APPOINTMENT_BOOKED_DOCTOR") {
    const patientInfo = extra.patientName
      ? ` by patient ${extra.patientName}`
      : "";
    const dateInfo = extra.appointmentDate
      ? ` on ${new Date(extra.appointmentDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`
      : "";
    const subject = "New Appointment Booked – MediLink";
    const text = `Dear Dr. ${name}, a new appointment has been booked with you${patientInfo}${dateInfo}. Please log in to MediLink to review your schedule.`;
    return { subject, text, html: wrapHtml(subject, text) };
  }
  // CONSULTATION_COMPLETED_DOCTOR
  const patientInfo = extra.patientName ? ` with ${extra.patientName}` : "";
  const subject = "Consultation Session Completed – MediLink";
  const text = `Dear Dr. ${name}, your consultation session${patientInfo} has been marked as completed in MediLink. The session record is now available in your dashboard.`;
  return { subject, text, html: wrapHtml(subject, text) };
}

function wrapHtml(subject, text) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:30px 0;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#1e88e5,#1565c0);padding:28px 32px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:1px;">MediLink</h1>
<p style="margin:6px 0 0;color:#bbdefb;font-size:13px;">Your Smart Healthcare Partner</p>
</td></tr>
<tr><td style="padding:32px;">
<h2 style="margin:0 0 16px;color:#1565c0;font-size:18px;">${subject.replace(" – MediLink", "")}</h2>
<p style="margin:0;color:#333;font-size:15px;line-height:1.7;">${text}</p>
</td></tr>
<tr><td style="background:#f8f9fa;padding:18px 32px;text-align:center;border-top:1px solid #eee;">
<p style="margin:0;color:#999;font-size:12px;">&copy; 2026 MediLink &middot; This is an automated notification</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

// Persists notification record if MongoDB is connected.
async function saveNotificationLog(payload) {
  try {
    if (mongoose.connection.readyState !== 1) return null;
    const log = new Notification(payload);
    return await log.save();
  } catch (err) {
    console.error("Notification log save failed:", err.message);
    return null;
  }
}

// Validates required payload fields and formats for notify endpoint.
function validateBody({ email, phone, name, type }) {
  if (!email || !phone || !name || !type) {
    return "email, phone, name, and type are required.";
  }
  if (
    typeof email !== "string" ||
    typeof phone !== "string" ||
    typeof name !== "string"
  ) {
    return "email, phone, and name must be strings.";
  }
  if (!ALLOWED_TYPES.includes(type)) {
    return `type must be one of: ${ALLOWED_TYPES.join(", ")}.`;
  }
  if (!isValidEmail(email)) {
    return "Invalid email format.";
  }
  const normalizedPhone = normalizeLkPhone(phone);
  if (!normalizedPhone) {
    return "Invalid phone number. Use a Sri Lankan mobile in international form 947XXXXXXXX (11 digits, e.g. 94712345678) or domestic 0712345678.";
  }
  return null;
}

// Handles POST /api/notifications/notify request.
export async function sendNotification(req, res) {
  try {
    const { email, phone, name, type, patientName, appointmentDate } = req.body;
    const validationError = validateBody({ email, phone, name, type });

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const normalizedPhone = normalizeLkPhone(phone);

    const { subject, text, html } = buildNotificationMessage(type, name, {
      patientName,
      appointmentDate,
    });

    let emailStatus = "FAILED";
    let smsStatus = "FAILED";
    let errorMessage = null;

    try {
      await sendEmailNotification({ to: email.trim(), subject, text, html });
      emailStatus = "SUCCESS";
    } catch (error) {
      errorMessage = error.message;
    }

    try {
      await sendSmsNotification({ to: normalizedPhone, message: text });
      smsStatus = "SUCCESS";
    } catch (error) {
      errorMessage = errorMessage
        ? `${errorMessage} | ${error.message}`
        : error.message;
    }

    const finalStatus =
      emailStatus === "SUCCESS" && smsStatus === "SUCCESS"
        ? "SUCCESS"
        : emailStatus === "SUCCESS" || smsStatus === "SUCCESS"
          ? "PARTIAL_SUCCESS"
          : "FAILED";

    await saveNotificationLog({
      name: String(name).trim(),
      email: email.trim().toLowerCase(),
      phone: normalizedPhone,
      type,
      message: text,
      status: finalStatus,
      error: errorMessage,
    });

    if (finalStatus === "FAILED") {
      return res.status(500).json({
        success: false,
        message: "Both email and SMS delivery failed.",
        data: { emailStatus, smsStatus, error: errorMessage },
      });
    }

    return res.status(200).json({
      success: true,
      message:
        finalStatus === "SUCCESS"
          ? "Notification sent via email and SMS."
          : "Notification partially sent. One channel failed.",
      data: { emailStatus, smsStatus, type },
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
