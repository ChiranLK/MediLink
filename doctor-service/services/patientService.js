import axios from 'axios';

/**
 * patientService.js
 * ─────────────────
 * Cross-service HTTP client for patient-service.
 * Fetches patient-uploaded medical reports so doctors can view them
 * directly inside the doctor dashboard.
 *
 * Set PATIENT_SERVICE_URL in .env; defaults to http://localhost:3000
 * when running locally without Docker.
 */

const PATIENT_SERVICE_URL =
  process.env.PATIENT_SERVICE_URL || 'http://localhost:3001';

/**
 * Fetch all reports uploaded by a patient.
 * @param {string} patientId   - Patient's ID (ObjectId or custom string)
 * @param {string} [authToken] - Bearer token to forward for auth, if required
 * @returns {Promise<Array>}   - Array of report objects
 */
export const fetchPatientReports = async (patientId, authToken = null) => {
  try {
    const config = { timeout: 8000 };
    if (authToken) {
      config.headers = { Authorization: `Bearer ${authToken}` };
    }

    const response = await axios.get(
      `${PATIENT_SERVICE_URL}/reports/patient/${patientId}`,
      config
    );

    // patient-service returns { success, data: [...] } or { reports: [...] }
    return (
      response.data?.data ||
      response.data?.reports ||
      []
    );
  } catch (error) {
    console.error(
      `[doctor-service → patient-service] Failed to fetch reports for patient ${patientId}:`,
      error.message
    );

    if (error.response) {
      // Forward meaningful HTTP errors
      const err = new Error(
        error.response.data?.message || 'Could not retrieve patient reports'
      );
      err.statusCode = error.response.status;
      throw err;
    }

    // Network error — throw a friendly 503-style error
    const err = new Error(
      'Patient service is temporarily unavailable. Please try again later.'
    );
    err.statusCode = 503;
    throw err;
  }
};

// Backwards-compatible export for existing imports that used the old name
export const fetchPatientReportsUrl = fetchPatientReports;
