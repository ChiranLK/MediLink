import { Router } from 'express';
import {
  getPatientReports,
  getIncomingPatientReports,
} from '../controllers/patientReportController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticateUser, authorizePermissions } from '../middleware/authMiddleware.js';

const router = Router();

/**
 * Patient Report Routes (doctor-service)
 * Mounted at /api/doctors in app.js
 *
 * Doctors can view reports uploaded by their patients.
 * Proxies the request to patient-service internally.
 */

// GET /incoming-patient-reports/:doctorId — all reports from doctor's patients
router.get(
  '/incoming-patient-reports/:doctorId',
  authenticateUser,
  authorizePermissions('doctor', 'admin'),
  asyncHandler(getIncomingPatientReports)
);

// GET /patient/:patientId/reports
router.get(
  '/patient/:patientId/reports',
  authenticateUser,
  authorizePermissions('doctor', 'admin'),
  asyncHandler(getPatientReports)
);

export default router;
