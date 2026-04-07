import express from 'express';
import { 
  bookAppointment, 
  getAllAppointments, 
  getMyAppointments, 
  updateAppointment, 
  deleteAppointment 
} from '../controllers/appointmentController.js';
import { authenticateUser, authorizePermissions } from '../middleware/authMiddleware.js';

const router = express.Router();

// 1. Book Appointment - Patient only [cite: 42]
router.post(
  '/', 
  authenticateUser, 
  authorizePermissions('patient'), 
  bookAppointment
);

// 2. Get My Appointments - Authenticated users [cite: 16]
router.get(
  '/my-appointments',
  authenticateUser,
  getMyAppointments
);

// 3. Get All Appointments - Admin only [cite: 20]
router.get(
  '/',
  authenticateUser,
  authorizePermissions('admin'),
  getAllAppointments
);

// 4. Update Appointment - Admin or Doctor [cite: 22, 23]
router.put(
  '/:id',
  authenticateUser,
  authorizePermissions('admin', 'doctor'),
  updateAppointment
);

// 5. Delete/Cancel Appointment - Authenticated users
router.delete(
  '/:id',
  authenticateUser,
  deleteAppointment
);

export default router;