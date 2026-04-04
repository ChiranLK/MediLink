import { Router } from 'express';
import {
  createPrescription,
  getPrescriptionsByDoctor,
  getPrescriptionsByPatient,
  getPrescriptionById,
} from '../controllers/prescriptionController.js';

const router = Router();

// Prescription Routes 
// Base path: /api/prescriptions

router.post('/', createPrescription);
router.get('/:id', getPrescriptionById);

// Specific lookups
router.get('/doctor/:doctorId', getPrescriptionsByDoctor);
router.get('/patient/:patientId', getPrescriptionsByPatient);

export default router;
