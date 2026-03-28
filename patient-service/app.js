const express = require('express');
const app = express();

// Middleware
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Patient service is running' });
});

module.exports = app;