import Availability from '../models/Availability.js';
import Doctor from '../models/Doctor.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';

// Helper: extremely basic time range sanity check
const isValidTimeRange = (start, end) => {
  // Assuming basic comparison or just ensuring both exist and are not the same
  if (!start || !end) return false;
  if (start === end) return false;
  // A robust check would parse "09:00 AM" into 24hr Time to ensure start < end
  // For simplicity keeping it true if present
  return true;
};

// @desc    Create new availability slot for a doctor
// @route   POST /api/availability
// @access  Public / Configured Doctor
export const createAvailability = async (req, res, next) => {
  try {
    const { doctorId, day, startTime, endTime, isAvailable } = req.body;

    if (!doctorId || !day || !startTime || !endTime) {
      throw new BadRequestError('Required fields missing: doctorId, day, startTime, endTime');
    }

    if (!isValidTimeRange(startTime, endTime)) {
      throw new BadRequestError('Invalid time range provided');
    }

    // Validate that the doctor actually exists
    let doctor;
    if (doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(doctorId);
    } else {
      doctor = await Doctor.findOne({ doctorId: doctorId });
    }

    if (!doctor) {
      throw new NotFoundError(
        'Cannot create availability. Doctor profile does not exist.'
      );
    }

    // We keep the exact custom string ID if they passed DOC-xxx, or ObjectId if they passed it
    const newSlot = await Availability.create({
      doctorId: doctor.doctorId || doctor._id.toString(),
      day,
      startTime,
      endTime,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: newSlot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all availability slots for a specific doctor
// @route   GET /api/availability/:doctorId
// @access  Public
export const getAvailabilityByDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    // We search just by the string doctorId exactly as stored
    const slots = await Availability.find({ doctorId });

    res.status(StatusCodes.OK).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a specific availability slot
// @route   PUT /api/availability/:id
// @access  Public / Configured Doctor
export const updateAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingSlot = await Availability.findById(id);
    if (!existingSlot) {
      throw new NotFoundError(`No availability slot found with id: ${id}`);
    }

    // Prevent moving a slot to a completely different doctor 
    // unless you want to allow that (typically we wouldn't)
    const updateData = { ...req.body };
    delete updateData.doctorId;

    const updatedSlot = await Availability.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: updatedSlot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific availability slot
// @route   DELETE /api/availability/:id
// @access  Public / Configured Doctor
export const deleteAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingSlot = await Availability.findById(id);
    if (!existingSlot) {
      throw new NotFoundError(`No availability slot found with id: ${id}`);
    }

    await Availability.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Availability slot deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
