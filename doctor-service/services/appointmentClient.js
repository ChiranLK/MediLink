import axios from "axios";

const APPOINTMENT_URL =
  process.env.APPOINTMENT_SERVICE_URL || "http://appointment-service:5002";

/**
 * Fetch a single appointment by ID from the appointment-service.
 * Returns null if not found — never throws.
 */
export async function fetchAppointmentById(appointmentId, authToken = null) {
  try {
    const config = { timeout: 5000 };
    if (authToken) config.headers = { Authorization: `Bearer ${authToken}` };
    const { data } = await axios.get(
      `${APPOINTMENT_URL}/appointments/${appointmentId}`,
      config,
    );
    return data?.appointment || data?.data || data || null;
  } catch (err) {
    console.warn(
      `[doctor-service → appointment-service] Could not fetch appointment ${appointmentId}:`,
      err.message,
    );
    return null;
  }
}
