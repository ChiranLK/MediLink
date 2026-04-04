import { Router } from 'express';
import {
  registerDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctorProfile,
  deleteDoctorProfile,
} from '../controllers/doctorController.js';

// If you want to enforce authentication for specific routes, uncomment these:
// import { authenticateUser, authorizePermissions } from '../middleware/authMiddleware.js';

const router = Router();

// Public / General routes
router.post('/register', registerDoctor);
router.get('/', getAllDoctors);
router.get('/:id', getDoctorById);

// Update/Delete routes (Typically protected by authMiddleware in production)
// Example with auth: router.put('/:id', authenticateUser, authorizePermissions('doctor', 'admin'), updateDoctorProfile);
router.put('/:id', updateDoctorProfile);
router.delete('/:id', deleteDoctorProfile);

export default router;
