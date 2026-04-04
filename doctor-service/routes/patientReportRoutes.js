import { Router } from 'express';
import { getPatientReports } from '../controllers/patientReportController.js';

const router = Router();

// ------------------------------------------------------------------
// Patient Report Integration Routes
// These routes are typically mounted at /api/doctors in app.js
// ------------------------------------------------------------------

// GET /api/doctors/patient/:patientId/reports
router.get('/patient/:patientId/reports', getPatientReports);

export default router;
