import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';

/**
 * ----------------------------------------------------------------------------
 * PLACEHOLDER MOCK DATA & STUB SERVICE
 * ----------------------------------------------------------------------------
 * As the appointment-service is not yet built/integrated, we use an in-memory
 * array to stub the data so the doctor-service can be developed and tested fully.
 * 
 * When the real appointment service is ready, replace this mock array 
 * and wire these controller methods to use standard Mongoose schemas or Axios 
 * calls to the appointment-service.
 */
let mockAppointments = [
  {
    id: 'appt-101',
    doctorId: 'DOC-mock1',
    patientId: 'PAT-101',
    patientName: 'John Doe',
    date: '2026-05-10',
    time: '10:00 AM',
    status: 'Pending',
  },
  {
    id: 'appt-102',
    doctorId: 'DOC-mock1',
    patientId: 'PAT-102',
    patientName: 'Jane Smith',
    date: '2026-05-11',
    time: '02:00 PM',
    status: 'Approved',
  },
  {
    id: 'appt-103',
    doctorId: 'DOC-mock2',
    patientId: 'PAT-103',
    patientName: 'Alice Brown',
    date: '2026-05-12',
    time: '04:00 PM',
    status: 'Pending',
  }
];

// Helper to check valid status transitions
const VALID_STATUSES = ['Pending', 'Approved', 'Rejected', 'Completed'];

// @desc    Get all appointments for a specific doctor
// @route   GET /api/doctors/:doctorId/appointments
// @access  Doctor
export const getDoctorAppointments = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    // TODO: Replace with real DB query or axios call to appointment-service
    const appointments = mockAppointments.filter(
      (appt) => appt.doctorId === doctorId
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Fetched mock appointments successfully',
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept an appointment request
// @route   PUT /api/doctors/appointments/:id/accept
// @access  Doctor
export const acceptAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Replace with real DB update
    const apptIndex = mockAppointments.findIndex((a) => a.id === id);

    if (apptIndex === -1) {
      throw new NotFoundError(`No mock appointment found with id: ${id}`);
    }

    if (mockAppointments[apptIndex].status !== 'Pending') {
      throw new BadRequestError('Only Pending appointments can be accepted');
    }

    mockAppointments[apptIndex].status = 'Approved';

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Appointment accepted successfully',
      data: mockAppointments[apptIndex],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject an appointment request
// @route   PUT /api/doctors/appointments/:id/reject
// @access  Doctor
export const rejectAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // TODO: Replace with real DB update
    const apptIndex = mockAppointments.findIndex((a) => a.id === id);

    if (apptIndex === -1) {
      throw new NotFoundError(`No mock appointment found with id: ${id}`);
    }

    if (mockAppointments[apptIndex].status !== 'Pending') {
      throw new BadRequestError('Only Pending appointments can be rejected');
    }

    mockAppointments[apptIndex].status = 'Rejected';

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Appointment rejected successfully',
      data: mockAppointments[apptIndex],
    });
  } catch (error) {
    next(error);
  }
};
