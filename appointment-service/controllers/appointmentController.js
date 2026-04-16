import Appointment from "../models/Appointment.js";
import { fetchAISuggestions } from "../services/aiSymptomClient.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";


// Error handler wrapper for async functions
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 1. Create Appointment (AI integration ekka)
export const bookAppointment = asyncHandler(async (req, res) => {
  const { doctorId, appointmentDate, symptoms } = req.body;
  
  // Validate required fields
  if (!doctorId || !appointmentDate || !symptoms) {
    throw new BadRequestError("Please provide all required fields");
  }
  
  
  req.body.patientId = req.user.userId;

  try {
    // AI Symptom Checker (external microservice)
    const aiResponse = await fetchAISuggestions(symptoms);
    
    // Extract data from AI response
    if (aiResponse && typeof aiResponse === 'object') {
      req.body.aiSuggestions = aiResponse.suggestion || aiResponse.suggestion;
      req.body.preMedicationSteps = aiResponse.preMedicationSteps || [];
      req.body.recommendedSpecialty = aiResponse.recommendedSpecialty || "General Medicine";
      req.body.urgencyLevel = aiResponse.urgency || "medium";
      
      console.log("✅ AI Suggestions and Pre-medication Steps Generated");
    } else {
      // Fallback if response is a string
      req.body.aiSuggestions = aiResponse;
      req.body.preMedicationSteps = [];
    }
  } catch (aiError) {
    console.error("AI Suggestion Error:", aiError.message);
    // Continue with appointment creation even if AI fails
    req.body.aiSuggestions = "AI suggestions temporarily unavailable";
    req.body.preMedicationSteps = [];
  }

  try {
    const appointment = await Appointment.create(req.body);

    res.status(StatusCodes.CREATED).json({
      msg: "Appointment booked successfully!",
      appointment,
    });
  } catch (mongoError) {
    // Handle Mongoose validation errors
    if (mongoError.name === "ValidationError") {
      const messages = Object.values(mongoError.errors)
        .map((err) => err.message)
        .join(", ");
      throw new BadRequestError(messages);
    }
    // Handle Mongoose duplicate key error
    if (mongoError.code === 11000) {
      throw new BadRequestError("Appointment already exists");
    }
    throw mongoError;
  }
});

// 2. Get All Appointments (Admin roles walata) [cite: 20]
export const getAllAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({}).sort("-createdAt");
  res.status(StatusCodes.OK).json({ appointments });
});

// 3. Get Patient specific appointments [cite: 16]
export const getMyAppointments = asyncHandler(async (req, res) => {
  const appointments = await Appointment.find({ patientId: req.user.userId })
    .sort("-appointmentDate")
    .lean();
  
  res.status(StatusCodes.OK).json({ 
    appointments,
    count: appointments.length 
  });
});

// 4. Update Appointment (Status wenas kireema - Confirm/Cancel) [cite: 22, 23]
export const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    throw new BadRequestError("Appointment ID is required");
  }

  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedAppointment) {
      throw new NotFoundError("Appointment not found");
    }

    res.status(StatusCodes.OK).json({
      msg: "Appointment updated successfully",
      appointment: updatedAppointment,
    });
  } catch (mongoError) {
    if (mongoError.name === "ValidationError") {
      const messages = Object.values(mongoError.errors)
        .map((err) => err.message)
        .join(", ");
      throw new BadRequestError(messages);
    }
    throw mongoError;
  }
});

// 5. Delete/Cancel Appointment 
export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    throw new BadRequestError("Appointment ID is required");
  }

  const appointment = await Appointment.findByIdAndDelete(id);

  if (!appointment) {
    throw new NotFoundError("Appointment not found");
  }

  res.status(StatusCodes.OK).json({ msg: "Appointment cancelled and deleted" });
});

// 6. Get appointments for a specific doctor (called by doctor-service)
export const getAppointmentsByDoctorId = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const filter = { doctorId };
  if (status) filter.status = status;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Appointment.countDocuments(filter),
  ]);

  res.status(StatusCodes.OK).json({
    success: true,
    count: appointments.length,
    total,
    appointments,
  });
});
