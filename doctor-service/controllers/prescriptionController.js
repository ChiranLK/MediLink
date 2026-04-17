import Prescription from "../models/Prescription.js";
import Doctor from "../models/Doctor.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";

// ─── Helper: normalise medicine list ─────────────────────────────────────────
/**
 * Accepts either:
 *  - An array of strings  →  converted to { name: <string> }
 *  - An array of objects  →  passed through as-is
 *  - A single string      →  wrapped in an array
 *  - No medicines         →  returns []
 */
const normaliseMedicines = (medicines) => {
  if (!medicines) return [];
  const arr = Array.isArray(medicines) ? medicines : [medicines];
  return arr.map((m) => {
    if (typeof m === "string") {
      return {
        name: m,
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      };
    }
    return {
      name: m.name || "",
      dosage: m.dosage || "",
      frequency: m.frequency || "",
      duration: m.duration || "",
      instructions: m.instructions || "",
    };
  });
};

// ─── Helper: resolve doctor doc from string ID ───────────────────────────────
const resolveDoctor = async (doctorId) => {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(doctorId);
  return isObjectId ? Doctor.findById(doctorId) : Doctor.findOne({ doctorId });
};

// @desc    Create a new digital prescription
// @route   POST /api/prescriptions
// @access  Doctor (Private)
export const createPrescription = async (req, res, next) => {
  try {
    const {
      doctorId,
      patientId,
      appointmentId,
      diagnosis,
      medicines,
      notes,
      followUpDate,
    } = req.body;

    if (!doctorId || !patientId || !diagnosis) {
      throw new BadRequestError(
        "Missing required fields: doctorId, patientId, diagnosis",
      );
    }

    const doctor = await resolveDoctor(doctorId);
    if (!doctor) {
      throw new NotFoundError(
        `Cannot issue prescription. No doctor found with id: ${doctorId}`,
      );
    }

    const newPrescription = await Prescription.create({
      doctorId: doctor.doctorId || doctor._id.toString(),
      doctorName: doctor.name || "",
      patientId,
      appointmentId,
      diagnosis,
      medicines: normaliseMedicines(medicines),
      notes,
      followUpDate: followUpDate || null,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Prescription created successfully",
      data: newPrescription,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions written by a specific doctor
// @route   GET /api/prescriptions/doctor/:doctorId
// @access  Doctor / Admin (Private)
export const getPrescriptionsByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const filter = { doctorId };
    if (status) filter.status = status;

    const [prescriptions, total] = await Promise.all([
      Prescription.find(filter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Prescription.countDocuments(filter),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      count: prescriptions.length,
      total,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions assigned to a specific patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Patient / Doctor / Admin (Private)
export const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;

    const filter = { patientId };
    if (status) filter.status = status;

    const prescriptions = await Prescription.find(filter)
      .sort({ date: -1 })
      .lean();

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
// @access  Patient / Doctor (Private)
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

// @desc    Update a prescription (add/update medicines, notes, follow-up date, status)
// @route   PUT /api/prescriptions/:id
// @access  Doctor (Private)
export const updatePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { diagnosis, medicines, notes, followUpDate, status } = req.body;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      throw new NotFoundError(`No prescription found with id: ${id}`);
    }

    // Only the issuing doctor or an admin can update
    if (
      req.user &&
      req.user.role !== "admin" &&
      prescription.doctorId !== req.user.userId
    ) {
      throw new BadRequestError("Not authorized to update this prescription");
    }

    const updateData = {};
    if (diagnosis) updateData.diagnosis = diagnosis;
    if (medicines) updateData.medicines = normaliseMedicines(medicines);
    if (notes !== undefined) updateData.notes = notes;
    if (followUpDate !== undefined)
      updateData.followUpDate = followUpDate || null;
    if (status) updateData.status = status;

    const updated = await Prescription.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Prescription updated successfully",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel / delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Doctor / Admin (Private)
export const deletePrescription = async (req, res, next) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id);
    if (!prescription) {
      throw new NotFoundError(`No prescription found with id: ${id}`);
    }

    // Only the issuing doctor or an admin can cancel
    if (
      req.user &&
      req.user.role !== "admin" &&
      prescription.doctorId !== req.user.userId
    ) {
      throw new BadRequestError("Not authorized to cancel this prescription");
    }

    await Prescription.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Prescription cancelled/deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
