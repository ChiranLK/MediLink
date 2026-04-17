import axios from "axios";

/**
 * Doctor Service Client
 *
 * Handles cross-service communication with Doctor microservice
 * for fetching doctor profiles filtered by specialization,
 * availability status, and other criteria.
 *
 * NOTE: Doctor service runs on http://localhost:3003 (not 5002)
 * Port mapping:
 * - Auth Service: :5000
 * - Appointment Service: :5002 (this service)
 * - Doctor Service: :3003
 * - Patient Service: :3000
 * - Payment Service: :3005
 */

// Configuration
const DOCTOR_SERVICE_URL =
  process.env.DOCTOR_SERVICE_URL || "http://localhost:3003";
const DOCTOR_SERVICE_TIMEOUT = parseInt(
  process.env.DOCTOR_SERVICE_TIMEOUT || "10000",
  10,
); // 10 seconds

// Axios instance with Doctor service configuration
// Doctor service mounts doctor routes at /api/doctors
const doctorServiceClient = axios.create({
  baseURL: `${DOCTOR_SERVICE_URL}/api/doctors`,
  timeout: DOCTOR_SERVICE_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Fetch doctors by specialization from Doctor microservice
 *
 * @param {string} specialty - The medical specialization (e.g., 'Cardiology', 'Dermatology')
 * @param {Object} options - Optional filtering parameters
 * @param {string} options.status - Filter by doctor status ('active', 'inactive', 'pending')
 * @param {number} options.page - Pagination page number (default: 1)
 * @param {number} options.limit - Results per page (default: 10, max: 50)
 * @param {string} options.sortBy - Sort field (e.g., '-rating' for descending by rating)
 * @returns {Promise<Array>} Array of doctor objects matching the specialty
 * @throws {Error} If the Doctor service is unavailable or request fails
 *
 * @example
 * // Fetch all active cardiologists
 * const cardiologists = await fetchDoctorsBySpecialty('Cardiology');
 *
 * @example
 * // Fetch with custom pagination and sorting
 * const doctors = await fetchDoctorsBySpecialty('Neurology', {
 *   status: 'active',
 *   page: 1,
 *   limit: 10,
 *   sortBy: '-rating'
 * });
 */
export const fetchDoctorsBySpecialty = async (specialty, options = {}) => {
  try {
    if (!specialty || typeof specialty !== "string") {
      throw new Error("Specialty parameter must be a non-empty string");
    }

    // Build query parameters from options
    const queryParams = {
      status: options.status || "active", // Default to active doctors
      page: options.page || 1,
      limit: Math.min(options.limit || 10, 50), // Max 50 per page
      ...(options.sortBy && { sortBy: options.sortBy }),
    };

    // Remove undefined/null values
    Object.keys(queryParams).forEach(
      (key) =>
        (queryParams[key] === undefined || queryParams[key] === null) &&
        delete queryParams[key],
    );

    console.log(
      `[DoctorService] Fetching doctors for specialty: ${specialty} from ${DOCTOR_SERVICE_URL}/specialty/${specialty}`,
    );

    // baseURL already includes /api/doctors
    const response = await doctorServiceClient.get(
      `/specialty/${encodeURIComponent(specialty)}`,
      { params: queryParams },
    );

    // Validate response structure
    if (!response.data || !Array.isArray(response.data.data)) {
      throw new Error("Invalid response structure from Doctor service");
    }

    console.log(
      `[DoctorService] Successfully retrieved ${response.data.data.length} doctors for ${specialty}`,
    );

    // Return doctor list with pagination metadata
    return {
      success: true,
      doctors: response.data.data,
      count: response.data.data.length,
      pagination: response.data.pagination || {},
      message: response.data.message,
    };
  } catch (error) {
    // Handle different error types
    if (error.response) {
      // Doctor service responded with an error status
      console.error(
        `[DoctorService] Error response from Doctor service (${error.response.status}):`,
        error.response.data,
      );

      throw new Error(
        error.response.data?.message ||
          `Doctor service error: ${error.response.status} ${error.response.statusText}`,
      );
    } else if (error.code === "ECONNREFUSED") {
      // Doctor service is not running
      console.error(
        "[DoctorService] Doctor service is unavailable (connection refused)",
      );
      throw new Error(
        `Doctor service unavailable. Is it running on ${DOCTOR_SERVICE_URL}?`,
      );
    } else if (error.code === "ENOTFOUND") {
      // DNS resolution failed
      console.error(
        "[DoctorService] Doctor service hostname not found",
        error.message,
      );
      throw new Error(
        "Doctor service hostname not found. Check DOCTOR_SERVICE_URL configuration.",
      );
    } else if (error.code === "ETIMEDOUT") {
      // Request timeout
      console.error(
        "[DoctorService] Request timeout while calling Doctor service",
      );
      throw new Error(
        `Doctor service request timeout (${DOCTOR_SERVICE_TIMEOUT}ms). Service may be overloaded.`,
      );
    } else {
      // Generic error
      console.error("[DoctorService] Unexpected error:", error.message);
      throw new Error(`Failed to fetch doctors: ${error.message}`);
    }
  }
};

/**
 * Fetch a single doctor by ID from Doctor microservice
 *
 * @param {string} doctorId - The doctor's MongoDB ObjectId or custom doctorId
 * @returns {Promise<Object>} Doctor object
 * @throws {Error} If doctor not found or service unavailable
 */
export const fetchDoctorById = async (doctorId) => {
  try {
    if (!doctorId) {
      throw new Error("Doctor ID is required");
    }

    console.log(`[DoctorService] Fetching doctor by ID: ${doctorId}`);

    const response = await doctorServiceClient.get(
      `/${encodeURIComponent(doctorId)}`,
    );

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response structure from Doctor service");
    }

    console.log(`[DoctorService] Successfully retrieved doctor: ${doctorId}`);

    return {
      success: true,
      doctor: response.data.data,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      console.error(`[DoctorService] Doctor not found: ${doctorId}`);
      throw new Error(`Doctor with ID ${doctorId} not found`);
    }

    if (error.response) {
      console.error(
        `[DoctorService] Error response: ${error.response.status}`,
        error.response.data,
      );
      throw new Error(error.response.data?.message || "Error fetching doctor");
    }

    console.error("[DoctorService] Error:", error.message);
    throw new Error(`Failed to fetch doctor: ${error.message}`);
  }
};

/**
 * Health check for Doctor service
 *
 * @returns {Promise<boolean>} True if service is healthy
 */
export const checkDoctorServiceHealth = async () => {
  try {
    const response = await doctorServiceClient.get("/", {
      timeout: 5000,
      params: { limit: 1 },
    });
    console.log("[DoctorService] Health check passed");
    return true;
  } catch (error) {
    console.error("[DoctorService] Health check failed:", error.message);
    return false;
  }
};

export default doctorServiceClient;
