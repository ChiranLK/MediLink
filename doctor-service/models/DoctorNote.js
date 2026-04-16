import mongoose from 'mongoose';

/**
 * DoctorNote Model — doctor-service
 *
 * Stores lightweight personal clinical sticky notes per doctor.
 */
const DoctorNoteSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, 'Doctor ID is required for a note'],
      trim: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      default: 'New clinical note',
    },
    content: {
      type: String,
      trim: true,
      maxlength: [2000, 'Content cannot exceed 2000 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

DoctorNoteSchema.index({ doctorId: 1, updatedAt: -1 });

export default mongoose.model('DoctorNote', DoctorNoteSchema);
