const express = require('express');
const router = express.Router();
const upload = require('../middleware/multerConfig');
const reportController = require('../controllers/reportController');

/**
 * Report routes
 */

// Create report after file upload (e.g. Cloudinary) — JSON body
router.post('/', reportController.createReport);

// Upload file and create report for a patient
router.post('/upload/:patientId', upload.single('file'), reportController.uploadAndCreateReport);

// Get all reports for a patient
router.get('/patient/:patientId', reportController.getPatientReports);

// Get report by ID
router.get('/:id', reportController.getReportById);

// Delete report and associated file
router.delete('/:id', reportController.deleteReportWithFile);

// Update report
router.put('/:id', reportController.updateReport);

module.exports = router;