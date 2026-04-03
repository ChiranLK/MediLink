const MedicalHistory = require('../models/MedicalHistory');
const Patient = require('../models/Patient');

/**
 * Add a new medical history record
 * @route POST /history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addMedicalHistory = async (req, res) => {
  try {
    const { patientId, diagnosis, treatment, doctorNotes, date } = req.body;

    // Validate required fields
    if (!patientId || !diagnosis || !treatment) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Required fields: patientId, diagnosis, treatment'
      });
    }

    // Validate patientId format
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid patient ID format'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Patient not found'
      });
    }

    // Validate date if provided
    if (date) {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Invalid date format'
        });
      }
    }

    // Create new medical history
    const medicalHistory = new MedicalHistory({
      patientId,
      diagnosis,
      treatment,
      doctorNotes: doctorNotes || '',
      date: date || Date.now()
    });

    const savedHistory = await medicalHistory.save();
    const populatedHistory = await savedHistory.populate('patientId');

    res.status(201).json({
      success: true,
      data: populatedHistory,
      message: 'Medical history record created successfully'
    });
  } catch (error) {
    console.error('Error adding medical history:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error adding medical history',
      error: error.message
    });
  }
};

/**
 * Get all medical history records for a patient
 * @route GET /history/:patientId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getMedicalHistoryByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Validate patientId format
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid patient ID format'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Patient not found'
      });
    }

    // Fetch all medical history records for the patient
    const histories = await MedicalHistory.find({ patientId })
      .sort({ date: -1 })
      .populate('patientId');

    res.status(200).json({
      success: true,
      data: histories,
      message: 'Medical history records retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching medical history:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error fetching medical history',
      error: error.message
    });
  }
};

/**
 * Update a medical history record by ID
 * @route PUT /history/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid medical history ID format'
      });
    }

    // Check if medical history exists
    const medicalHistory = await MedicalHistory.findById(id);
    if (!medicalHistory) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Medical history record not found'
      });
    }

    // Prevent patientId modification
    if (updateData.patientId && updateData.patientId !== medicalHistory.patientId.toString()) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Cannot modify patient ID'
      });
    }

    // Validate date if provided
    if (updateData.date) {
      const dateObj = new Date(updateData.date);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'Invalid date format'
        });
      }
    }

    // Update medical history
    const updatedHistory = await MedicalHistory.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('patientId');

    res.status(200).json({
      success: true,
      data: updatedHistory,
      message: 'Medical history updated successfully'
    });
  } catch (error) {
    console.error('Error updating medical history:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error updating medical history',
      error: error.message
    });
  }
};

/**
 * Delete a medical history record by ID
 * @route DELETE /history/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        data: null,
        message: 'Invalid medical history ID format'
      });
    }

    // Delete medical history
    const deletedHistory = await MedicalHistory.findByIdAndDelete(id);

    if (!deletedHistory) {
      return res.status(404).json({
        success: false,
        data: null,
        message: 'Medical history record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: deletedHistory,
      message: 'Medical history deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting medical history:', error);
    res.status(500).json({
      success: false,
      data: null,
      message: 'Error deleting medical history',
      error: error.message
    });
  }
};