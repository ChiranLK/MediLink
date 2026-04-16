import { Router } from 'express';
import {
  getDoctorNotes,
  createDoctorNote,
  updateDoctorNote,
  deleteDoctorNote,
} from '../controllers/doctorNotesController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateUser, authorizePermissions } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * Doctor personal clinical notes routes
 * Mounted at /api/doctors in app.js
 */

// GET  /api/doctors/:doctorId/notes        — list all notes for a doctor
router.get(
  '/:doctorId/notes',
  authenticateUser,
  authorizePermissions('doctor', 'admin'),
  asyncHandler(getDoctorNotes)
);

// POST /api/doctors/:doctorId/notes        — create a new note
router.post(
  '/:doctorId/notes',
  authenticateUser,
  authorizePermissions('doctor', 'admin'),
  asyncHandler(createDoctorNote)
);

// PUT  /api/doctors/:doctorId/notes/:noteId — update an existing note
router.put(
  '/:doctorId/notes/:noteId',
  authenticateUser,
  authorizePermissions('doctor', 'admin'),
  asyncHandler(updateDoctorNote)
);

// DELETE /api/doctors/:doctorId/notes/:noteId — delete a note
router.delete(
  '/:doctorId/notes/:noteId',
  authenticateUser,
  authorizePermissions('doctor', 'admin'),
  asyncHandler(deleteDoctorNote)
);

export default router;
