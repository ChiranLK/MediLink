const express = require('express');
const app = express();
const patientRoutes = require('./routes/patientRoutes');

// Middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Patient service is running' });
});

// Use patient routes - this makes all routes available under /api
app.use('/api', patientRoutes);

module.exports = app;