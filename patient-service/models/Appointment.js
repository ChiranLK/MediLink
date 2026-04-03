const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  doctorId: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  doctorName: {
    type: String,
    required: false,
    trim: true
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  appointmentTime: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: false,
    default: 30 // in minutes
  },
  consultationType: {
    type: String,
    required: true,
    enum: ['Online', 'InPerson', 'Hybrid'],
    default: 'Online'
  },
  videoConsultationLink: {
    type: String,
    required: false,
    trim: true
  },
  meetingId: {
    type: String,
    required: false,
    trim: true,
    unique: true,
    sparse: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled', 'Rescheduled'],
    default: 'Scheduled'
  },
  notes: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000
  },
  reason: {
    type: String,
    required: false,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', appointmentSchema);