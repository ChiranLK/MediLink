import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide your name"],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    topic: {
      type: String,
      required: [true, "Please select a topic"],
      enum: [
        "General Inquiry",
        "Book Appointment",
        "Technical Support",
        "Billing & Payments",
        "Partner with Us",
        "Media & Press",
      ],
    },
    message: {
      type: String,
      required: [true, "Please provide a message"],
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ["unread", "read", "replied"],
      default: "unread",
    },
  },
  { timestamps: true },
);

ContactMessageSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model("ContactMessage", ContactMessageSchema);
