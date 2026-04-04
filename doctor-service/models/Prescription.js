import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, 'Please provide doctorId'],
      trim: true,
    },
    patientId: {
      type: String, // Kept as String since patient resides in a separate microservice / database
      required: [true, 'Please provide patientId'],
      trim: true,
    },
    appointmentId: {
      type: String,
      trim: true,
    },
    diagnosis: {
      type: String,
      required: [true, 'Please provide a diagnosis'],
      trim: true,
      maxlength: [500, 'Diagnosis cannot exceed 500 characters'],
    },
    // Array of strings as requested for simplicity
    medicines: [
      {
        type: String,
        trim: true,
      },
    ],
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Prescription', PrescriptionSchema);
