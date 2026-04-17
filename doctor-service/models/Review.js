import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, "Doctor ID is required"],
      index: true,
    },
    patientId: {
      type: String,
      required: [true, "Patient ID is required"],
      index: true,
    },
    appointmentId: {
      type: String,
      required: [true, "Appointment ID is required"],
      unique: true, // one review per appointment
    },
    consultationType: {
      type: String,
      enum: ["Video"],
      default: "Video",
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
      default: "",
    },
    patientName: {
      type: String,
      trim: true,
      default: "Anonymous",
    },
  },
  { timestamps: true },
);

ReviewSchema.index({ doctorId: 1, createdAt: -1 });

export default mongoose.model("Review", ReviewSchema);
