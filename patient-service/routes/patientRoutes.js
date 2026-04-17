const express = require("express");
const router = express.Router();
const patientController = require("../controllers/patientController");
const { imageUpload } = require("../middleware/multerConfig");

// Define routes
router.post("/patients", patientController.createPatient);
router.get("/patients", patientController.getAllPatients); // Get all patients
router.get("/patients/:id", patientController.getPatientById);
router.put("/patients/:id", patientController.updatePatient);
router.delete("/patients/:id", patientController.deletePatient);

// Profile photo & deletion request
router.post(
  "/patients/:id/photo",
  imageUpload.single("photo"),
  patientController.uploadProfilePhoto,
);
router.post("/patients/:id/request-delete", patientController.requestDeletion);
router.delete("/patients/:id/photo", patientController.removeProfilePhoto);

module.exports = router;
