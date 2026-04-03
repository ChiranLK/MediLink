const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
    index: true
  },
  diagnosis: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  treatment: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  doctorNotes: {
    type: String,
    required: false,
    trim: true,
    maxlength: 1000
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalHistory', medicalHistorySchema);