import { Router } from 'express';
import {
  getDoctorAppointments,
  acceptAppointment,
  rejectAppointment,
} from '../controllers/appointmentController.js';

const router = Router();

// ------------------------------------------------------------------
// Appointment Stub Routes
// These routes are mounted at /api/doctors in app.js
// ------------------------------------------------------------------

// GET /api/doctors/:doctorId/appointments
router.get('/:doctorId/appointments', getDoctorAppointments);

// PUT /api/doctors/appointments/:id/accept
router.put('/appointments/:id/accept', acceptAppointment);

// PUT /api/doctors/appointments/:id/reject
router.put('/appointments/:id/reject', rejectAppointment);

export default router;
