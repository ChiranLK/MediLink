import mongoose from "mongoose";

const specializations = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Endocrinology",
  "Gastroenterology",
  "Pulmonology",
  "Nephrology",
  "Rheumatology",
  "Hematology",
  "Infectious Disease",
];

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    patientName: {
      type: String,
      required: true,
    },

    contactPhone: {
      type: String,
      required: [true, "Please provide contact phone number"],
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },

    patientEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    specialization: {
      type: String,
    },

    // doctorId stored as String to support both MongoDB ObjectIds and
    // custom string IDs (e.g. "DOC-1234567890") from doctor-service
    doctorId: {
      type: String,
      required: true,
      index: true,
    },

    /** Resolved from doctor-service for patient-facing lists (optional for legacy rows) */
    doctorName: {
      type: String,
      trim: true,
      default: "",
    },

    appointmentDate: {
      type: Date,
      required: true,
    },
    symptoms: {
      type: String,
      required: true,
    },
    aiSuggestions: {
      type: String,
      default: "No suggestions available",
    },
    preMedicationSteps: {
      type: [String],
      default: [],
    },
    recommendedSpecialty: {
      type: String,
      default: "General Medicine",
    },
    urgencyLevel: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Cancelled", "Completed"],
      default: "Pending",
    },
    // Notes added by the doctor when accepting/completing
    doctorNotes: {
      type: String,
      trim: true,
      default: "",
    },
    // Reason provided when cancelling/rejecting
    cancellationReason: {
      type: String,
      trim: true,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Appointment", appointmentSchema);
