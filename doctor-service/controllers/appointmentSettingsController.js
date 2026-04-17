import AppointmentSettings from "../models/AppointmentSettings.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";
import Doctor from "../models/Doctor.js";
import TimeSlot from "../models/TimeSlot.js";

// @desc    Get appointment settings for a doctor
// @route   GET /api/availability/settings/:doctorId
// @access  Doctor/Admin
export const getAppointmentSettings = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    let settings = await AppointmentSettings.findOne({ doctorId });

    // If no settings exist, create default settings
    if (!settings) {
      // Verify doctor exists
      let doctor;
      if (doctorId.match(/^[0-9a-fA-F]{24}$/)) {
        doctor = await Doctor.findById(doctorId);
      } else {
        doctor = await Doctor.findOne({ doctorId: doctorId });
      }

      if (!doctor) {
        throw new NotFoundError(`No doctor found with id: ${doctorId}`);
      }

      settings = await AppointmentSettings.create({ doctorId });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update appointment settings
// @route   PUT /api/availability/settings
// @access  Doctor/Admin
export const updateAppointmentSettings = async (req, res, next) => {
  try {
    const {
      doctorId,
      appointmentDuration,
      bufferTime,
      isBufferTimeEnabled,
      maxAppointmentsPerDay,
      defaultStartTime,
      defaultEndTime,
      workingDays,
    } = req.body;

    if (!doctorId) {
      throw new BadRequestError("doctorId is required");
    }

    // Verify doctor exists
    let doctor;
    if (doctorId.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(doctorId);
    } else {
      doctor = await Doctor.findOne({ doctorId: doctorId });
    }

    if (!doctor) {
      throw new NotFoundError(`No doctor found with id: ${doctorId}`);
    }

    const updateData = {};
    if (appointmentDuration !== undefined)
      updateData.appointmentDuration = appointmentDuration;
    if (bufferTime !== undefined) updateData.bufferTime = bufferTime;
    if (isBufferTimeEnabled !== undefined)
      updateData.isBufferTimeEnabled = isBufferTimeEnabled;
    if (maxAppointmentsPerDay !== undefined)
      updateData.maxAppointmentsPerDay = maxAppointmentsPerDay;
    if (defaultStartTime !== undefined)
      updateData.defaultStartTime = defaultStartTime;
    if (defaultEndTime !== undefined)
      updateData.defaultEndTime = defaultEndTime;
    if (workingDays !== undefined) updateData.workingDays = workingDays;

    const settings = await AppointmentSettings.findOneAndUpdate(
      { doctorId },
      updateData,
      {
        new: true,
        upsert: true,
        runValidators: true,
      },
    );
    // Delete all future available/blocked slots so they regenerate with new settings.
    // Booked slots are preserved to protect existing appointments.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];
    await TimeSlot.deleteMany({
      doctorId,
      date: { $gte: todayStr },
      status: { $in: ["available", "blocked"] },
    });
    res.status(StatusCodes.OK).json({
      success: true,
      message: "Appointment settings updated successfully",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset appointment settings to defaults
// @route   DELETE /api/availability/settings/:doctorId
// @access  Doctor/Admin
export const resetAppointmentSettings = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    await AppointmentSettings.findOneAndDelete({ doctorId });

    // Create new default settings
    const defaultSettings = await AppointmentSettings.create({ doctorId });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Appointment settings reset to defaults",
      data: defaultSettings,
    });
  } catch (error) {
    next(error);
  }
};
