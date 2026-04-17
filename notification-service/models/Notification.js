import mongoose from "mongoose";

// Stores delivery history for observability and troubleshooting.
const notificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      required: true,
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    type: {
      type: String,
      enum: [
        "APPOINTMENT_BOOKED",
        "CONSULTATION_COMPLETED",
        "APPOINTMENT_BOOKED_DOCTOR",
        "CONSULTATION_COMPLETED_DOCTOR",
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PARTIAL_SUCCESS"],
      required: true,
    },
    error: {
      type: String,
      default: null,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false },
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
