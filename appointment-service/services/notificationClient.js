import axios from "axios";

const NOTIFICATION_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5003";
const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://auth-service:5000";

/**
 * Fire-and-forget notification. Never throws — just logs on failure.
 */
export async function sendNotification(payload) {
  try {
    await axios.post(`${NOTIFICATION_URL}/notifications/notify`, payload, {
      timeout: 5000,
    });
    console.log(`✅ Notification sent [${payload.type}] to ${payload.email}`);
  } catch (err) {
    console.warn(`⚠️  Notification failed [${payload.type}]:`, err.message);
  }
}

/**
 * Email-only notification for doctors. Never throws.
 */
export async function sendDoctorNotification(payload) {
  try {
    await axios.post(`${NOTIFICATION_URL}/notifications/notify`, payload, {
      timeout: 5000,
    });
    console.log(
      `✅ Doctor notification sent [${payload.type}] to ${payload.email}`,
    );
  } catch (err) {
    console.warn(
      `⚠️  Doctor notification failed [${payload.type}]:`,
      err.message,
    );
  }
}

/**
 * Resolve patient email from auth-service by userId (used as fallback).
 */
export async function resolvePatientEmail(userId, authHeader) {
  try {
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return null;
    const { data } = await axios.post(
      `${AUTH_URL}/api/auth/verify`,
      { token },
      { timeout: 4000 },
    );
    return data?.email || null;
  } catch {
    return null;
  }
}
