import { Router } from 'express';
import {
  createAvailability,
  getAvailabilityByDoctor,
  updateAvailability,
  deleteAvailability,
} from '../controllers/availabilityController.js';

const router = Router();

// Availability Routes 
// Base path: /api/availability

router.post('/', createAvailability);
router.get('/:doctorId', getAvailabilityByDoctor);
router.put('/:id', updateAvailability);
router.delete('/:id', deleteAvailability);

export default router;
