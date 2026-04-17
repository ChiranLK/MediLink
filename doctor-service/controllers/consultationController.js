import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Consultation from "../models/Consultation.js";
import Doctor from "../models/Doctor.js";
import {
  sendNotification,
  sendDoctorNotification,
} from "../services/notificationClient.js";
import { fetchAppointmentById } from "../services/appointmentClient.js";

/** Strip "dr"/"dr." prefix and title-case for notification templates */
const cleanDoctorName = (name) => {
  if (!name || typeof name !== "string") return "";
  let t = name.trim().replace(/^dr\.?\s*/i, "");
  if (!t) t = name.trim();
  return t
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

/**
 * VIDEO CONSULTATION CONTROLLER
 * Handles Jitsi Meet video session creation, retrieval, and status management.
 */

// @desc    Create a new video consultation session
// @route   POST /api/doctors/consultations/create-session
// @access  Doctor (Private)
export const createConsultationSession = async (req, res, next) => {
  try {
    const { appointmentId, doctorId, patientId, notes } = req.body;

    if (!appointmentId || !doctorId || !patientId) {
      throw new BadRequestError(
        "Required fields missing: appointmentId, doctorId, patientId",
      );
    }

    // Return existing session if already created for this appointment
    const existingSession = await Consultation.findOne({ appointmentId });
    if (existingSession) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message:
          "Session already exists for this appointment — returning existing link",
        data: existingSession,
      });
    }

    // Generate Jitsi room name — unique per appointment
    // Frontend opens this URL in a new tab; no API key required for public rooms
    const meetingLink = `https://meet.jit.si/medilink-${appointmentId}`;

    const newSession = await Consultation.create({
      appointmentId,
      doctorId,
      patientId,
      meetingLink,
      platform: "JITSI",
      status: "scheduled",
      notes: notes || null,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Video consultation session created successfully",
      data: newSession,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all consultations for a specific doctor
// @route   GET /api/doctors/consultations/doctor/:doctorId
// @access  Doctor (Private)
export const getConsultationsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { doctorId };
    if (status) filter.status = status;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Consultation.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      count: consultations.length,
      total,
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a consultation session by appointment ID
// @route   GET /api/doctors/consultations/:appointmentId
// @access  Doctor / Patient (Private)
export const getConsultationByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const session = await Consultation.findOne({ appointmentId });
    if (!session) {
      throw new NotFoundError(
        `No video consultation found for appointment: ${appointmentId}`,
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultation status (and optional timestamps/notes)
// @route   PATCH /api/doctors/consultations/:appointmentId/status
// @access  Doctor (Private)
export const updateConsultationStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    const VALID_STATUSES = ["scheduled", "active", "completed", "cancelled"];
    if (!VALID_STATUSES.includes(status)) {
      throw new BadRequestError(
        `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      );
    }

    const updateData = { status };
    if (notes !== undefined) updateData.notes = notes;

    // Set timestamps automatically based on status transitions
    if (status === "active") updateData.startedAt = new Date();
    if (status === "completed" || status === "cancelled")
      updateData.endedAt = new Date();

    const session = await Consultation.findOneAndUpdate(
      { appointmentId },
      updateData,
      { new: true, runValidators: true },
    );

    if (!session) {
      throw new NotFoundError(
        `No video consultation found for appointment: ${appointmentId}`,
      );
    }

    // Fire consultation-completed notification — fire-and-forget
    if (status === "completed") {
      const authToken = req.headers?.authorization?.split(" ")[1];
      const appt = await fetchAppointmentById(appointmentId, authToken);

      // Notify patient (email + SMS)
      if (appt?.patientEmail && appt?.patientName && appt?.contactPhone) {
        sendNotification({
          email: appt.patientEmail,
          phone: appt.contactPhone,
          name: appt.patientName,
          type: "CONSULTATION_COMPLETED",
          recipientId: appt.patientId,
          recipientRole: "patient",
        });
      }

      // Notify doctor (email + SMS)
      try {
        const doctor = await Doctor.findOne({
          doctorId: session.doctorId,
        }).lean();
        if (doctor?.email && doctor?.name && doctor?.phone) {
          sendDoctorNotification({
            email: doctor.email,
            phone: doctor.phone,
            name: cleanDoctorName(doctor.name),
            type: "CONSULTATION_COMPLETED_DOCTOR",
            patientName: appt?.patientName,
            recipientId: String(session.doctorId),
            recipientRole: "doctor",
          });
        }
      } catch {
        // Non-critical — doctor lookup failure should not affect response
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: `Consultation status updated to '${status}'`,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add/update clinical notes to a consultation
// @route   PATCH /api/doctors/consultations/:appointmentId/notes
// @access  Doctor (Private)
export const updateConsultationNotes = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const { notes } = req.body;

    if (notes === undefined) {
      throw new BadRequestError("notes field is required");
    }

    const session = await Consultation.findOneAndUpdate(
      { appointmentId },
      { notes },
      { new: true },
    );

    if (!session) {
      throw new NotFoundError(
        `No video consultation found for appointment: ${appointmentId}`,
      );
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Consultation notes updated",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all consultations for a specific patient
// @route   GET /api/doctors/consultations/by-patient/:patientId
// @access  Patient / Doctor / Admin (Private)
export const getConsultationsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { status, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { patientId };
    if (status) filter.status = status;

    const [consultations, total] = await Promise.all([
      Consultation.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Consultation.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      count: consultations.length,
      total,
      data: consultations,
    });
  } catch (error) {
    next(error);
  }
};
