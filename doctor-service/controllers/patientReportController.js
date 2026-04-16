import axios from 'axios';
import { StatusCodes } from 'http-status-codes';
import { fetchPatientReports } from '../services/patientService.js';
import { BadRequestError } from '../errors/customErrors.js';

const APPOINTMENT_SERVICE_URL =
  process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:5002';

/**
 * Reports from patients who have at least one appointment with this doctor.
 * @route GET /incoming-patient-reports/:doctorId
 */
export const getIncomingPatientReports = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      throw new BadRequestError('doctorId is required');
    }

    const authHeader = req.headers.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    const aptRes = await axios.get(`${APPOINTMENT_SERVICE_URL}/doctor/${doctorId}`, {
      params: { limit: 500 },
      headers: authHeader ? { Authorization: authHeader } : {},
      timeout: 20000,
    });

    const appointments = aptRes.data?.appointments || [];
    const byUser = new Map();
    for (const a of appointments) {
      const uid =
        typeof a.patientId === 'object' && a.patientId !== null
          ? String(a.patientId._id || a.patientId)
          : String(a.patientId);
      if (!byUser.has(uid)) {
        byUser.set(uid, a.patientName || 'Patient');
      }
    }

    const seenIds = new Set();
    const merged = [];

    for (const [userId, senderName] of byUser) {
      try {
        const reps = await fetchPatientReports(userId, token);
        const list = Array.isArray(reps) ? reps : [];
        for (const r of list) {
          // Only include reports addressed to this doctor (or reports with no doctor — legacy)
          if (r.doctorId && String(r.doctorId) !== String(doctorId)) continue;

          const rid = r._id ? String(r._id) : null;
          if (rid && seenIds.has(rid)) continue;
          if (rid) seenIds.add(rid);
          merged.push({
            ...r,
            senderPatientName: senderName,
            patientAuthUserId: userId,
          });
        }
      } catch (e) {
        console.warn(`[incoming-reports] skip patient ${userId}:`, e.message);
      }
    }

    merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Incoming patient reports retrieved',
      count: merged.length,
      data: merged,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    View all reports uploaded by a specific patient (accessed by doctor)
// @route   GET /api/doctors/patient/:patientId/reports
// @access  Doctor (Private)
export const getPatientReports = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    if (!patientId) {
      throw new BadRequestError('patientId is required');
    }

    // Extract bearer token from this request and forward it to patient-service
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    const reports = await fetchPatientReports(patientId, token);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Patient reports retrieved successfully',
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};
