import express from 'express';
import cors from 'cors';
import paymentRouter from './routes/paymentRoutes.js';
import webhookRouter from './routes/webhookRoutes.js';

const app = express();

// IMPORTANT: Webhook routes must be registered BEFORE express.json()
// This is because Stripe needs the raw request body for signature verification
app.use(cors());
app.use('/webhooks', webhookRouter);

// Now apply global JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/payments', paymentRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Payment Service is running' });
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
