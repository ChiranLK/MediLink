const express = require('express');
const path = require('path');
const app = express();
const patientRoutes = require('./routes/patientRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reportRoutes = require('./routes/reportRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const videoConsultationRoutes = require('./routes/videoConsultationRoutes');
const medicalHistoryRoutes = require('./routes/medicalHistoryRoutes');

// Middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Patient service is running' });
});

// Use patient routes
app.use('/api/patients', patientRoutes);

// Use upload routes
app.use('/api/upload', uploadRoutes);

// Use report routes
app.use('/api/reports', reportRoutes);

// Use prescription routes
app.use('/api/prescriptions', prescriptionRoutes);

// Use video consultation routes
app.use('/api/video-consultation', videoConsultationRoutes);

// Use medical history routes
app.use('/', medicalHistoryRoutes);

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File size exceeds maximum limit of 10MB'
    });
  }
  if (error instanceof MulterError) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  if (error.message) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
});

module.exports = app;