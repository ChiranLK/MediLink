const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');

/**
 * Generate or fetch video consultation link for an appointment
 * @route GET /api/video-consultation/:appointmentId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getVideoConsultationLink = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Validate if appointmentId is a valid MongoDB ObjectId
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format'
      });
    }

    // Fetch appointment with patient details
    const appointment = await Appointment.findById(appointmentId).populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment is online consultation
    if (appointment.consultationType !== 'Online' && appointment.consultationType !== 'Hybrid') {
      return res.status(400).json({
        success: false,
        message: 'This appointment is not for video consultation'
      });
    }

    // Check appointment status
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has been cancelled'
      });
    }

    // Check if appointment is in the future or currently in progress
    const appointmentDateTime = new Date(appointment.appointmentDate);
    const now = new Date();

    if (appointmentDateTime < now && appointment.status === 'Scheduled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment time has passed'
      });
    }

    // If video consultation link doesn't exist, generate one
    let videoLink = appointment.videoConsultationLink;
    
    if (!videoLink) {
      // Generate a unique meeting ID if not exists
      if (!appointment.meetingId) {
        appointment.meetingId = generateMeetingId();
      }

      // Generate video consultation link (can be replaced with actual video conferencing API)
      videoLink = generateVideoConsultationLink(appointment.meetingId, appointment.patientId._id);
      
      // Save the generated link
      appointment.videoConsultationLink = videoLink;
      await appointment.save();
    }

    // Prepare response with additional details
    const appointmentDateTime_formatted = appointmentDateTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    res.status(200).json({
      success: true,
      message: 'Video consultation link retrieved successfully',
      data: {
        appointmentId: appointment._id,
        patientName: appointment.patientId.name,
        patientId: appointment.patientId._id,
        doctorId: appointment.doctorId,
        doctorName: appointment.doctorName,
        appointmentDate: appointmentDateTime_formatted,
        duration: appointment.duration,
        consultationType: appointment.consultationType,
        status: appointment.status,
        meetingId: appointment.meetingId,
        videoConsultationLink: videoLink,
        notes: appointment.notes
      }
    });
  } catch (error) {
    console.error('Error fetching video consultation link:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video consultation link',
      error: error.message
    });
  }
};

/**
 * Get video consultation link by appointment ID (user facing)
 * @route GET /api/video-consultation/appointment/:appointmentId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getConsultationLinkByAppointmentId = async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Validate if appointmentId is a valid MongoDB ObjectId
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format'
      });
    }

    // Fetch appointment
    const appointment = await Appointment.findById(appointmentId).populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if it's a video consultation appointment
    if (appointment.consultationType === 'InPerson') {
      return res.status(400).json({
        success: false,
        message: 'This is an in-person appointment, no video link available'
      });
    }

    // Check appointment status
    if (appointment.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has been cancelled'
      });
    }

    // Generate link if not exists
    if (!appointment.videoConsultationLink) {
      if (!appointment.meetingId) {
        appointment.meetingId = generateMeetingId();
      }
      appointment.videoConsultationLink = generateVideoConsultationLink(appointment.meetingId, appointment.patientId._id);
      await appointment.save();
    }

    res.status(200).json({
      success: true,
      message: 'Video consultation link retrieved',
      data: {
        appointmentId: appointment._id,
        videoLink: appointment.videoConsultationLink,
        meetingId: appointment.meetingId,
        startTime: appointment.appointmentDate,
        duration: appointment.duration,
        status: appointment.status
      }
    });
  } catch (error) {
    console.error('Error getting consultation link:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting consultation link',
      error: error.message
    });
  }
};

/**
 * Update video consultation link for an appointment
 * @route PUT /api/video-consultation/:appointmentId
 * @param {Object} req - Express request object with videoConsultationLink
 * @param {Object} res - Express response object
 */
exports.updateVideoConsultationLink = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { videoConsultationLink, meetingId } = req.body;

    // Validate if appointmentId is a valid MongoDB ObjectId
    if (!appointmentId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID format'
      });
    }

    // Validate input
    if (!videoConsultationLink) {
      return res.status(400).json({
        success: false,
        message: 'Video consultation link is required'
      });
    }

    // Find and update appointment
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      {
        videoConsultationLink,
        meetingId: meetingId || undefined
      },
      { new: true, runValidators: true }
    ).populate('patientId');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Video consultation link updated successfully',
      data: {
        appointmentId: appointment._id,
        videoConsultationLink: appointment.videoConsultationLink,
        meetingId: appointment.meetingId,
        updatedAt: appointment.updatedAt
      }
    });
  } catch (error) {
    console.error('Error updating video consultation link:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video consultation link',
      error: error.message
    });
  }
};

/**
 * Helper function to generate a unique meeting ID
 */
function generateMeetingId() {
  return `MEET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

/**
 * Helper function to generate video consultation link
 * This can be integrated with actual video conferencing APIs like:
 * - Zoom API
 * - Google Meet API
 * - Jitsi
 * - Daily.co
 */
function generateVideoConsultationLink(meetingId, patientId) {
  // Example format - can be replaced with actual video conferencing API integration
  const baseUrl = process.env.VIDEO_CONSULTATION_BASE_URL || 'https://medilink-conference.example.com';
  return `${baseUrl}/join/${meetingId}?patientId=${patientId}`;
}