import Appointment from "../models/Appointment.js";
import { getAISuggestions } from "../utils/aiSymptomChecker.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";

// 1. Create Appointment (AI integration ekka)
export const bookAppointment = async (req, res) => {
  try {
    const { doctorId, appointmentDate, symptoms } = req.body;
    
    // Auth Middleware eken ena Patient ID eka [cite: 41, 42]
    req.body.patientId = req.user.userId;

    // AI Symptom Checker eka call kireema [cite: 30, 31]
    const aiResponse = await getAISuggestions(symptoms);
    req.body.aiSuggestions = aiResponse;

    const appointment = await Appointment.create(req.body);

    res.status(StatusCodes.CREATED).json({
      msg: "Appointment booked successfully!",
      appointment,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to book appointment",
      error: error.message,
    });
  }
};

// 2. Get All Appointments (Admin roles walata) [cite: 20]
export const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({}).sort("-createdAt");
    res.status(StatusCodes.OK).json({ appointments });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch appointments",
      error: error.message,
    });
  }
};

// 3. Get Patient specific appointments [cite: 16]
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.userId }).sort("-appointmentDate");
    res.status(StatusCodes.OK).json({ appointments });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to fetch your appointments",
      error: error.message,
    });
  }
};

// 4. Update Appointment (Status wenas kireema - Confirm/Cancel) [cite: 22, 23]
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
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
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to update appointment",
      error: error.message,
    });
  }
};

// 5. Delete/Cancel Appointment 
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    res.status(StatusCodes.OK).json({ msg: "Appointment cancelled and deleted" });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      msg: "Failed to cancel appointment",
      error: error.message,
    });
  }
};