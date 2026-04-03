const express = require('express');
const router = express.Router();
const medicalHistoryController = require('../controllers/medicalHistoryController');

/**
 * Medical History routes
 */

// POST /history - Add new medical history record
router.post('/history', medicalHistoryController.addMedicalHistory);

// GET /history/:patientId - Get all medical history for a patient
router.get('/history/:patientId', medicalHistoryController.getMedicalHistoryByPatientId);

// PUT /history/:id - Update medical history record
router.put('/history/:id', medicalHistoryController.updateMedicalHistory);

// DELETE /history/:id - Delete medical history record
router.delete('/history/:id', medicalHistoryController.deleteMedicalHistory);

module.exports = router;