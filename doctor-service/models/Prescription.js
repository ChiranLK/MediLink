import mongoose from "mongoose";

/**
 * Prescription Model — doctor-service
 *
 * Stores digital prescription issued by a doctor for a patient.
 * Medicines are stored as structured objects for richer clinical data.
 */

// Sub-schema for individual medicine entries
const MedicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    dosage: {
      type: String,
      trim: true,
      default: "",
    },
    frequency: {
      type: String,
      trim: true,
      default: "",
    },
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const PrescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, "Please provide doctorId"],
      trim: true,
      index: true,
    },
    patientId: {
      type: String,
      required: [true, "Please provide patientId"],
      trim: true,
      index: true,
    },
    appointmentId: {
      type: String,
      trim: true,
      index: true,
    },
    doctorName: {
      type: String,
      trim: true,
      default: "",
    },
    diagnosis: {
      type: String,
      required: [true, "Please provide a diagnosis"],
      trim: true,
      maxlength: [500, "Diagnosis cannot exceed 500 characters"],
    },
    // Structured medicine array — each entry has name, dosage, frequency, duration
    medicines: {
      type: [MedicineSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    followUpDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "expired", "cancelled"],
        message: "Status must be active, expired, or cancelled",
      },
      default: "active",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

// Compound index for fast lookups
PrescriptionSchema.index({ doctorId: 1, patientId: 1 });
PrescriptionSchema.index({ doctorId: 1, date: -1 });

export default mongoose.model("Prescription", PrescriptionSchema);
