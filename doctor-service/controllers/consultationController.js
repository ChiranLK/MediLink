import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';

/**
 * ----------------------------------------------------------------------------
 * PLACEHOLDER MOCK DATA & STUB SERVICE
 * ----------------------------------------------------------------------------
 * The heavy lifting (Jitsi/Agora/Twilio) will eventually be done by a dedicated 
 * telemedicine service or directly integrated here later.
 * For now, this stores and generates mock session links so the Doctor UI flow 
 * can be built completely.
 */

const mockConsultations = [];

// @desc    Create a new video consultation session
// @route   POST /api/doctors/consultations/create-session
// @access  Doctor
export const createConsultationSession = async (req, res, next) => {
  try {
    const { appointmentId, doctorId, patientId } = req.body;

    if (!appointmentId || !doctorId || !patientId) {
      throw new BadRequestError('Required fields missing: appointmentId, doctorId, patientId');
    }

    // Checking if a session already exists for this appointment
    const existingSession = mockConsultations.find((c) => c.appointmentId === appointmentId);
    if (existingSession) {
      return res.status(StatusCodes.OK).json({
        success: true,
        message: 'Session already exists',
        data: existingSession,
      });
    }

    // TODO: Replace this block with actual API generation (e.g. Agora Token or Twilio Room)
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const mockLink = `https://mock-telemedicine.medilink.com/room/${appointmentId}-${randomSuffix}`;
    
    const newSession = {
      appointmentId,
      doctorId,
      patientId,
      meetingLink: mockLink,
      platform: 'Mock/Jitsi',
      status: 'Created',
      createdAt: new Date().toISOString(),
    };

    mockConsultations.push(newSession);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Consultation session generated successfully',
      data: newSession,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a consultation session link by appointment ID
// @route   GET /api/doctors/consultations/:appointmentId
// @access  Doctor / Patient
export const getConsultationByAppointment = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const session = mockConsultations.find((c) => c.appointmentId === appointmentId);

    if (!session) {
      throw new NotFoundError(`No consultation session found for appointment: ${appointmentId}`);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: session,
    });
  } catch (error) {
    next(error);
  }
};
