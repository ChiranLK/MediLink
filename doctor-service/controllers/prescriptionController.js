import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';

// @desc    Create a new digital prescription
// @route   POST /api/prescriptions
// @access  Doctor
export const createPrescription = async (req, res, next) => {
  try {
    const { doctorId, patientId, appointmentId, diagnosis, medicines, notes } = req.body;

    // Validate required baseline fields
    if (!doctorId || !patientId || !diagnosis) {
      throw new BadRequestError('Missing required fields: doctorId, patientId, diagnosis');
    }

    // Validate that the doctor actually exists in the local database
    let doctor;
    if (doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(doctorId);
    } else {
      doctor = await Doctor.findOne({ doctorId: doctorId });
    }

    if (!doctor) {
      throw new NotFoundError(`Cannot outline prescription. No doctor found with id: ${doctorId}`);
    }

    // Note: Patient validation against existence heavily depends on cross-service HTTP calls 
    // to the patient-service. Since microservices are decoupled, we trust the frontend 
    // payload for patientId or rely on an API Gateway/Token to valid it. For now, we
    // ensure it's provided.

    // Force array type if it's sent improperly
    const formattedMedicines = Array.isArray(medicines) ? medicines : (medicines ? [medicines] : []);

    const newPrescription = await Prescription.create({
      doctorId: doctor.doctorId || doctor._id.toString(),
      patientId,
      appointmentId,
      diagnosis,
      medicines: formattedMedicines,
      notes,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Prescription created successfully',
      data: newPrescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions written by a specific doctor
// @route   GET /api/prescriptions/doctor/:doctorId
// @access  Doctor / Admin
export const getPrescriptionsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    const prescriptions = await Prescription.find({ doctorId }).sort({ date: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions assigned to a specific patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Patient / Doctor / Admin
export const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({ patientId }).sort({ date: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get details of a single prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Patient / Doctor
export const getPrescriptionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);

    if (!prescription) {
      throw new NotFoundError(`No prescription found with id: ${id}`);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};
