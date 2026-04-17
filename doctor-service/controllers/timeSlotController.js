import TimeSlot from "../models/TimeSlot.js";
import AppointmentSettings from "../models/AppointmentSettings.js";
import BlockedDay from "../models/BlockedDay.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";
import Doctor from "../models/Doctor.js";

// Helper: Convert time string to minutes
const timeToMinutes = (timeStr) => {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (period === "PM" && hours !== 12) totalMinutes += 12 * 60;
  if (period === "AM" && hours === 12) totalMinutes -= 12 * 60;
  return totalMinutes;
};

// Helper: Convert minutes to time string
const minutesToTime = (minutes) => {
  let hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? "PM" : "AM";
  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")} ${period}`;
};

// Helper: Get day name from date
const getDayName = (date) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[date.getDay()];
};

// Helper: Format date to YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split("T")[0];
};

// @desc    Get time slots for a specific date
// @route   GET /api/availability/slots/:doctorId/:date
// @access  Public
export const getTimeSlotsByDate = async (req, res, next) => {
  try {
    const { doctorId, date } = req.params;

    const slots = await TimeSlot.find({ doctorId, date }).sort({
      startTime: 1,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      count: slots.length,
      data: slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get week view with time slots
// @route   GET /api/availability/week/:doctorId
// @access  Public
export const getWeekView = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { startDate } = req.query; // Optional: specific week start date

    // Get appointment settings
    let settings = await AppointmentSettings.findOne({ doctorId });
    if (!settings) {
      settings = await AppointmentSettings.create({ doctorId });
    }

    // Calculate week range (Monday to Sunday)
    let weekStart;
    if (startDate) {
      weekStart = new Date(startDate);
    } else {
      weekStart = new Date();
    }
    // Adjust to Monday
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart = new Date(weekStart.setDate(diff));
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Get blocked days in this week
    const blockedDays = await BlockedDay.find({
      doctorId,
      isActive: true,
      $or: [{ startDate: { $lte: weekEnd }, endDate: { $gte: weekStart } }],
    });

    // Generate week data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekData = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateStr = formatDate(currentDate);
      const dayName = getDayName(currentDate);

      // Check if this date is in the past
      const isPast = currentDate < today;

      // Check if day is blocked
      const isBlocked = blockedDays.some((block) => {
        const blockStart = new Date(block.startDate);
        const blockEnd = new Date(block.endDate);
        return currentDate >= blockStart && currentDate <= blockEnd;
      });

      // Get slots for this day
      let slots = [];
      if (!isBlocked && !isPast) {
        slots = await TimeSlot.find({ doctorId, date: dateStr }).sort({
          startTime: 1,
        });

        // If no slots exist, generate them based on settings
        if (
          slots.length === 0 &&
          settings.workingDays.includes(currentDate.getDay())
        ) {
          slots = await generateTimeSlots(doctorId, dateStr, dayName, settings);
        }

        // For today, filter out time slots that have already passed
        const isToday = currentDate.getTime() === today.getTime();
        if (isToday && slots.length > 0) {
          const now = new Date();
          const currentMinutes = now.getHours() * 60 + now.getMinutes();
          slots = slots.filter((slot) => {
            const slotMinutes = timeToMinutes(slot.startTime);
            return slotMinutes > currentMinutes;
          });
        }
      } else if (isPast) {
        // For past dates, only return booked slots (for history), not available ones
        slots = await TimeSlot.find({
          doctorId,
          date: dateStr,
          status: "booked",
        }).sort({ startTime: 1 });
      }

      weekData.push({
        date: dateStr,
        day: dayName,
        dayNumber: currentDate.getDate(),
        isBlocked,
        isPast,
        isWorkingDay: settings.workingDays.includes(currentDate.getDay()),
        slots,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      weekRange: {
        start: formatDate(weekStart),
        end: formatDate(weekEnd),
      },
      settings: {
        appointmentDuration: settings.appointmentDuration,
        bufferTime: settings.bufferTime,
        isBufferTimeEnabled: settings.isBufferTimeEnabled,
        maxAppointmentsPerDay: settings.maxAppointmentsPerDay,
        defaultStartTime: settings.defaultStartTime,
        defaultEndTime: settings.defaultEndTime,
      },
      data: weekData,
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Generate time slots for a day
const generateTimeSlots = async (doctorId, date, day, settings) => {
  const slots = [];
  const startMinutes = timeToMinutes(settings.defaultStartTime);
  const endMinutes = timeToMinutes(settings.defaultEndTime);
  const slotDuration = settings.appointmentDuration;
  const bufferDuration = settings.isBufferTimeEnabled ? settings.bufferTime : 0;
  const totalSlotTime = slotDuration + bufferDuration;

  let currentTime = startMinutes;
  let slotCount = 0;

  while (
    currentTime + slotDuration <= endMinutes &&
    slotCount < settings.maxAppointmentsPerDay
  ) {
    const startTimeStr = minutesToTime(currentTime);
    const endTimeStr = minutesToTime(currentTime + slotDuration);

    const slot = await TimeSlot.create({
      doctorId,
      date,
      day,
      startTime: startTimeStr,
      endTime: endTimeStr,
      status: "available",
    });

    slots.push(slot);
    slotCount++;
    currentTime += totalSlotTime;
  }

  return slots;
};

// @desc    Create a custom time slot
// @route   POST /api/availability/slots
// @access  Doctor/Admin
export const createTimeSlot = async (req, res, next) => {
  try {
    const {
      doctorId,
      date,
      startTime,
      endTime,
      status = "available",
      notes,
    } = req.body;

    if (!doctorId || !date || !startTime || !endTime) {
      throw new BadRequestError(
        "Required fields: doctorId, date, startTime, endTime",
      );
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

    const dateObj = new Date(date);
    const dayName = getDayName(dateObj);

    // Check for overlapping slots
    const existingSlot = await TimeSlot.findOne({
      doctorId,
      date,
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });

    if (existingSlot) {
      throw new BadRequestError("Time slot overlaps with existing slot");
    }

    const slot = await TimeSlot.create({
      doctorId,
      date,
      day: dayName,
      startTime,
      endTime,
      status,
      notes,
    });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Time slot created successfully",
      data: slot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a time slot status
// @route   PUT /api/availability/slots/:id
// @access  Doctor/Admin
export const updateTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      notes,
      appointmentId,
      patientId,
      patientName,
      appointmentType,
    } = req.body;

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      throw new NotFoundError(`No time slot found with id: ${id}`);
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    if (appointmentId !== undefined) updateData.appointmentId = appointmentId;
    if (patientId !== undefined) updateData.patientId = patientId;
    if (patientName !== undefined) updateData.patientName = patientName;
    if (appointmentType !== undefined)
      updateData.appointmentType = appointmentType;

    const updatedSlot = await TimeSlot.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Time slot updated successfully",
      data: updatedSlot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a time slot
// @route   DELETE /api/availability/slots/:id
// @access  Doctor/Admin
export const deleteTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      throw new NotFoundError(`No time slot found with id: ${id}`);
    }

    // Don't allow deletion of booked slots
    if (slot.status === "booked") {
      throw new BadRequestError(
        "Cannot delete a booked time slot. Cancel the appointment first.",
      );
    }

    await TimeSlot.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Time slot deleted successfully",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Book a time slot
// @route   POST /api/availability/slots/:id/book
// @access  Public/Patient
export const bookTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appointmentId, patientId, patientName, appointmentType } = req.body;

    if (!appointmentId || !patientId || !patientName) {
      throw new BadRequestError(
        "Required fields: appointmentId, patientId, patientName",
      );
    }

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      throw new NotFoundError(`No time slot found with id: ${id}`);
    }

    if (slot.status !== "available") {
      throw new BadRequestError(
        `Time slot is ${slot.status}, cannot be booked`,
      );
    }

    const updatedSlot = await TimeSlot.findByIdAndUpdate(
      id,
      {
        status: "booked",
        appointmentId,
        patientId,
        patientName,
        appointmentType: appointmentType || "General Consultation",
      },
      { new: true, runValidators: true },
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Time slot booked successfully",
      data: updatedSlot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking and free up time slot
// @route   POST /api/availability/slots/:id/cancel
// @access  Doctor/Admin/Patient
export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      throw new NotFoundError(`No time slot found with id: ${id}`);
    }

    if (slot.status !== "booked") {
      throw new BadRequestError("Time slot is not booked");
    }

    const updatedSlot = await TimeSlot.findByIdAndUpdate(
      id,
      {
        status: "available",
        appointmentId: null,
        patientId: null,
        patientName: null,
        appointmentType: null,
      },
      { new: true, runValidators: true },
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Booking cancelled successfully",
      data: updatedSlot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block a time slot
// @route   POST /api/availability/slots/:id/block
// @access  Doctor/Admin
export const blockTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      throw new NotFoundError(`No time slot found with id: ${id}`);
    }

    if (slot.status === "booked") {
      throw new BadRequestError(
        "Cannot block a booked time slot. Cancel the appointment first.",
      );
    }

    const updatedSlot = await TimeSlot.findByIdAndUpdate(
      id,
      {
        status: "blocked",
        notes: notes || "Blocked by doctor",
      },
      { new: true, runValidators: true },
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Time slot blocked successfully",
      data: updatedSlot,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unblock a time slot
// @route   POST /api/availability/slots/:id/unblock
// @access  Doctor/Admin
export const unblockTimeSlot = async (req, res, next) => {
  try {
    const { id } = req.params;

    const slot = await TimeSlot.findById(id);
    if (!slot) {
      throw new NotFoundError(`No time slot found with id: ${id}`);
    }

    if (slot.status !== "blocked") {
      throw new BadRequestError("Time slot is not blocked");
    }

    const updatedSlot = await TimeSlot.findByIdAndUpdate(
      id,
      {
        status: "available",
        notes: null,
      },
      { new: true, runValidators: true },
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Time slot unblocked successfully",
      data: updatedSlot,
    });
  } catch (error) {
    next(error);
  }
};
