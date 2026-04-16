import express from 'express';
import cors from 'cors';
import consultationRouter from './routes/consultationRoutes.js';

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────
// All telemedicine endpoints
app.use('/', consultationRouter);

// ── Health check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Telemedicine Service',
    message: 'Jitsi Meet video consultation service is running',
    port: process.env.PORT || 3004,
  });
});

// ── 404 handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found in Telemedicine Service' });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal Server Error';
  res.status(statusCode).json({ status: 'error', statusCode, message });
});

export default app;
