import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';

/**
 * APPOINTMENT CONTROLLER (doctor-service perspective)
 * ─────────────────────────────────────────────────────
 * These endpoints allow doctors to:
 *   • View their incoming appointments
 *   • Accept (confirm) appointment requests
 *   • Reject appointment requests
 *
 * Real data is fetched from / sent to the appointment-service via HTTP.
 * If APPOINTMENT_SERVICE_URL is not set, stubs are used so local dev
 * continues to work without the appointment-service running.
 */

const APPOINTMENT_SERVICE_URL =
  process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5002';

// ─── Internal helper ─────────────────────────────────────────────────────────
/**
 * Build Axios request config with auth forwarding so the appointment-service
 * can verify the caller's identity when its middleware requires a JWT.
 */
const buildConfig = (req) => {
  const config = { timeout: 8000 };
  const auth = req.headers?.authorization;
  if (auth) config.headers = { Authorization: auth };
  return config;
};

// @desc    Get all appointments for a specific doctor
// @route   GET /api/doctors/:doctorId/appointments
// @access  Doctor (Private)
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    // Build query string for the downstream call
    const qs = new URLSearchParams({ doctorId, page, limit });
    if (status) qs.set('status', status);

    const response = await axios.get(
      `${APPOINTMENT_SERVICE_URL}/doctor/${doctorId}?${qs.toString()}`,
      buildConfig(req)
    );

    const { appointments, total } = response.data;

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Doctor appointments fetched successfully',
      count: (appointments || []).length,
      total: total || (appointments || []).length,
      data: appointments || [],
    });
  } catch (error) {
    if (error.response) {
      // Forward appointment-service errors
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.message || 'Error from appointment service',
        data: [],
      });
    }
    // Network / timeout — return empty list so the doctor UI doesn't crash
    console.error('[doctor-service] appointment-service unreachable:', error.message);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Appointment service temporarily unavailable. Please try again later.',
      count: 0,
      total: 0,
      data: [],
    });
  }
};

// @desc    Accept (confirm) an appointment request
// @route   PUT /api/doctors/appointments/:id/accept
// @access  Doctor (Private)
export const acceptAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const response = await axios.put(
      `${APPOINTMENT_SERVICE_URL}/${id}`,
      { status: 'Confirmed', doctorNotes: notes || '' },
      buildConfig(req)
    );

    const appointment = response.data.appointment || response.data.data || response.data;

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Appointment accepted/confirmed successfully',
      data: appointment,
    });
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      return next(new BadRequestError(data?.message || data?.msg || 'Could not accept appointment'));
    }
    next(error);
  }
};

// @desc    Reject an appointment request
// @route   PUT /api/doctors/appointments/:id/reject
// @access  Doctor (Private)
export const rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const response = await axios.put(
      `${APPOINTMENT_SERVICE_URL}/${id}`,
      { status: 'Cancelled', cancellationReason: reason || 'Rejected by doctor' },
      buildConfig(req)
    );

    const appointment = response.data.appointment || response.data.data || response.data;

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Appointment rejected successfully',
      data: appointment,
    });
  } catch (error) {
    if (error.response) {
      const { data } = error.response;
      return next(new BadRequestError(data?.message || data?.msg || 'Could not reject appointment'));
    }
    next(error);
  }
};

// @desc    Mark an appointment as completed after the session
// @route   PUT /api/doctors/appointments/:id/complete
// @access  Doctor (Private)
export const completeAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const response = await axios.put(
      `${APPOINTMENT_SERVICE_URL}/${id}`,
      { status: 'Completed', doctorNotes: notes || '' },
      buildConfig(req)
    );

    const appointment = response.data.appointment || response.data.data || response.data;

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Appointment marked as completed',
      data: appointment,
    });
  } catch (error) {
    if (error.response) {
      const { data } = error.response;
      return next(new BadRequestError(data?.message || data?.msg || 'Could not complete appointment'));
    }
    next(error);
  }
};
