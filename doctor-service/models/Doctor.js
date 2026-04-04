import mongoose from 'mongoose';

/**
 * Doctor Model — doctor-service
 *
 * Stores doctor-specific profile data for this microservice.
 * The `userId` field links back to the User document in auth-service
 * (no hard DB join — cross-service reference by string ID).
 */
const DoctorSchema = new mongoose.Schema(
  {
    // Unique doctor identifier (can be used as a public-facing ID)
    doctorId: {
      type: String,
      unique: true,
      trim: true,
    },

    // Reference to auth-service User._id
    userId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // ─── Basic Info ───────────────────────────────────────────────
    name: {
      type: String,
      required: [true, 'Please provide doctor name'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please provide a valid email address',
      ],
    },

    phone: {
      type: String,
      required: [true, 'Please provide phone number'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },

    // ─── Professional Info ────────────────────────────────────────
    specialization: {
      type: String,
      required: [true, 'Please provide specialization'],
      trim: true,
    },

    hospital: {
      type: String,
      trim: true,
      maxlength: [150, 'Hospital name cannot exceed 150 characters'],
    },

    experience: {
      type: Number,
      min: [0, 'Experience cannot be negative'],
      max: [60, 'Experience cannot exceed 60 years'],
      default: 0,
    },

    // Stored as a plain text summary (e.g. "MBBS, MD - Cardiology")
    qualifications: {
      type: String,
      trim: true,
      maxlength: [500, 'Qualifications cannot exceed 500 characters'],
    },

    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },

    // ─── Consultation ─────────────────────────────────────────────
    consultationFee: {
      type: Number,
      min: [0, 'Consultation fee cannot be negative'],
      default: 0,
    },

    // ─── Media ───────────────────────────────────────────────────
    profileImage: {
      type: String,
      default: 'uploads/default-avatar.png',
    },

    // ─── Status & Verification ────────────────────────────────────
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'pending'],
        message: 'Status must be active, inactive, or pending',
      },
      default: 'pending',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ─── Extended Profile ─────────────────────────────────────────
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    languages: [
      {
        type: String,
        trim: true,
      },
    ],

    location: {
      type: String,
      trim: true,
    },

    sessionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ─── Pre-save Hook: Auto-generate doctorId if not set ─────────────────────────
DoctorSchema.pre('save', function (next) {
  if (!this.doctorId) {
    // Format: DOC-<timestamp>
    this.doctorId = `DOC-${Date.now()}`;
  }
  next();
});

// ─── Clean JSON output ────────────────────────────────────────────────────────
DoctorSchema.methods.toJSON = function () {
  const obj = this.toObject();
  return obj;
};

export default mongoose.model('Doctor', DoctorSchema);
