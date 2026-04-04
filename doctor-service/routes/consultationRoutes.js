import { Router } from 'express';
import {
  createConsultationSession,
  getConsultationByAppointment,
} from '../controllers/consultationController.js';

const router = Router();

// ------------------------------------------------------------------
// Consultation Routes
// Mounted at /api/doctors/consultations
// ------------------------------------------------------------------

router.post('/create-session', createConsultationSession);
router.get('/:appointmentId', getConsultationByAppointment);

export default router;
