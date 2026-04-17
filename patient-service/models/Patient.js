const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    // Optional fields
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: false,
    },
    medicalHistory: {
      type: String,
      required: false,
      trim: true,
    },
    profilePhoto: {
      type: String,
      required: false,
    },
    profilePhotoPublicId: {
      type: String,
      required: false,
    },
    deletionRequested: {
      type: Boolean,
      default: false,
    },
    deletionRequestedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Patient", patientSchema);
