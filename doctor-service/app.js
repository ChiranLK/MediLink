import express from 'express';
import cors from 'cors';
import doctorRouter from './routes/doctorRoutes.js';
import availabilityRouter from './routes/availabilityRoutes.js';
import prescriptionRouter from './routes/prescriptionRoutes.js';
import appointmentRouter from './routes/appointmentRoutes.js';
import patientReportRouter from './routes/patientReportRoutes.js';
import consultationRouter from './routes/consultationRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/doctors', doctorRouter);
app.use('/api/doctors/consultations', consultationRouter);
app.use('/api/doctors', appointmentRouter);
app.use('/api/doctors', patientReportRouter);
app.use('/api/availability', availabilityRouter);
app.use('/api/prescriptions', prescriptionRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Doctor Service is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
});

export default app;
