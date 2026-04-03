const express = require('express');
const router = express.Router();
const videoConsultationController = require('../controllers/videoConsultationController');

/**
 * Video Consultation routes
 */

// Get video consultation link by appointment ID
router.get('/:appointmentId', videoConsultationController.getVideoConsultationLink);

// Get consultation link (user-friendly endpoint)
router.get('/appointment/:appointmentId', videoConsultationController.getConsultationLinkByAppointmentId);

// Update video consultation link
router.put('/:appointmentId', videoConsultationController.updateVideoConsultationLink);

module.exports = router;