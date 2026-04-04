import mongoose from 'mongoose';

const AvailabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      required: [true, 'Please provide doctorId'],
      trim: true,
      // Ref can be added if using strict ObjectIds, but our doctorId is a custom String (e.g. DOC-123) or ObjectId
    },
    day: {
      type: String,
      required: [true, 'Please provide day of the week'],
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (e.g. 09:00 AM)'],
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'Please provide end time (e.g. 05:00 PM)'],
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Availability', AvailabilitySchema);
