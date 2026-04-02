const mongoose = require('mongoose');

const patientReportSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  fileUrl: {
    type: String,
    required: true,
    match: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  reportType: {
    type: String,
    required: true,
    enum: ['Lab Test', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'ECG', 'Blood Test', 'Other'],
    default: 'Other'
  },
  fileSize: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PatientReport', patientReportSchema);