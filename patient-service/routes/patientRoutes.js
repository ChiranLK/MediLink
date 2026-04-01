const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Define routes
router.post('/patients', patientController.createPatient);
router.get('/patients', patientController.getAllPatients);  // Get all patients
router.get('/patients/:id', patientController.getPatientById);
router.put('/patients/:id', patientController.updatePatient);
router.delete('/patients/:id', patientController.deletePatient);

module.exports = router;