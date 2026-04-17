import axios from "axios";

const NOTIFICATION_URL =
  process.env.NOTIFICATION_SERVICE_URL || "http://notification-service:5003";

/**
 * Fire-and-forget notification. Never throws — just logs on failure.
 * @param {{ email: string, phone: string, name: string, type: string }} payload
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
 * @param {{ email: string, name: string, type: string, patientName?: string }} payload
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
