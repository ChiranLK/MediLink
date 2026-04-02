const PatientReport = require('../models/PatientReport');
const Patient = require('../models/Patient');

/**
 * Create a new patient report
 * @route POST /api/reports
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createReport = async (req, res) => {
  try {
    const { patientId, fileUrl, description, reportType, fileSize } = req.body;

    // Validate required fields
    if (!patientId || !fileUrl || !description) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: patientId, fileUrl, description'
      });
    }

    // Validate patientId format
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Create new report
    const report = new PatientReport({
      patientId,
      fileUrl,
      description,
      reportType: reportType || 'Other',
      fileSize: fileSize || 0
    });

    const savedReport = await report.save();

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: savedReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

/**
 * Get report by ID
 * @route GET /api/reports/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    const report = await PatientReport.findById(id).populate('patientId');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report retrieved successfully',
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

/**
 * Get all reports for a patient
 * @route GET /api/reports/patient/:patientId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReportsByPatientId = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Validate if patientId is a valid MongoDB ObjectId
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    const reports = await PatientReport.find({ patientId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

/**
 * Update report by ID
 * @route PUT /api/reports/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Validate if id is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    // Check if report exists
    const report = await PatientReport.findById(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Prevent patientId modification
    if (updateData.patientId && updateData.patientId !== report.patientId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify patient ID'
      });
    }

    const updatedReport = await PatientReport.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('patientId');

    res.status(200).json({
      success: true,
      message: 'Report updated successfully',
      data: updatedReport
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating report',
      error: error.message
    });
  }
};

/**
 * Delete report by ID
 * @route DELETE /api/reports/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    const report = await PatientReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
      data: report
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};