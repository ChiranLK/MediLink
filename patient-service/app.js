const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const patientRoutes = require('./routes/patientRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reportRoutes = require('./routes/reportRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const videoConsultationRoutes = require('./routes/videoConsultationRoutes');
const medicalHistoryRoutes = require('./routes/medicalHistoryRoutes');

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server), or configured origins
    const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(s => s.trim());
    if (!origin || allowed.includes(origin) || origin === 'http://localhost:5001') {
      callback(null, true);
    } else {
      callback(null, true); // allow all for now — tighten in production
    }
  },
  credentials: true,
}));
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Patient service is running' });
});

// Use patient routes (router already defines /patients/* paths)
app.use('/', patientRoutes);

// Use upload routes
app.use('/upload', uploadRoutes);

// Use report routes
app.use('/reports', reportRoutes);

// Use prescription routes
app.use('/prescriptions', prescriptionRoutes);

// Use video consultation routes
app.use('/video-consultation', videoConsultationRoutes);

// Use medical history routes
app.use('/', medicalHistoryRoutes);

// Global error-handling middleware — must be LAST and must have 4 params
app.use((error, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[patient-service] unhandled error:', error.message || error);

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File size exceeds maximum limit of 10MB',
    });
  }

  // Multer errors (name === 'MulterError')
  if (error.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  const statusCode = error.statusCode || error.status || 500;
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
  });
});

module.exports = app;