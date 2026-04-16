const mongoose = require('mongoose');
const PatientReport = require('../models/PatientReport');
const Patient = require('../models/Patient');
const fs = require('fs');
const path = require('path');

/**
 * Resolve Patient from Mongo _id or auth userId (24-char hex).
 */
async function resolvePatient(idParam) {
  if (idParam === undefined || idParam === null || String(idParam).trim() === '') return null;
  const raw = String(idParam).trim();
  if (!mongoose.Types.ObjectId.isValid(raw)) return null;
  let patient = await Patient.findById(raw);
  if (patient) return patient;
  patient = await Patient.findOne({ userId: raw });
  return patient;
}

/**
 * Create a new patient report
 * @route POST /api/reports
 * Accepts patientId as a MongoDB Patient _id OR as the auth-service userId (the lookup
 * tries both). If no patient profile exists yet the report is stored with the raw id
 * so the patient can link it after completing their profile.
 */
exports.createReport = async (req, res) => {
  try {
    const { fileUrl, description, reportType, fileSize } = req.body;
    // Accept patientId from body OR from the gateway-forwarded header
    const patientId =
      req.body.patientId ||
      req.headers['x-user-id'] ||
      null;

    if (!fileUrl || !description) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: fileUrl, description',
      });
    }

    if (!patientId) {
      return res.status(400).json({
        success: false,
        message: 'Required field: patientId (send in body or via Authorization header)',
      });
    }

    // Try to resolve to a Patient document; fall back to raw id so reports
    // are never silently dropped when the patient has not yet completed their profile.
    let resolvedPatientId;
    const patient = await resolvePatient(patientId);
    if (patient) {
      resolvedPatientId = patient._id;
    } else if (mongoose.Types.ObjectId.isValid(String(patientId).trim())) {
      // No profile yet — store with the provided id
      resolvedPatientId = new mongoose.Types.ObjectId(String(patientId).trim());
    } else {
      return res.status(400).json({
        success: false,
        message: 'patientId is not a valid id',
      });
    }

    const { doctorId, doctorName } = req.body;

    const report = new PatientReport({
      patientId: resolvedPatientId,
      doctorId: doctorId || null,
      doctorName: doctorName || null,
      fileUrl,
      description,
      reportType: reportType || 'Other',
      fileSize: fileSize || 0,
    });

    const savedReport = await report.save();

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: savedReport,
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message,
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

/**
 * Upload file and create patient report
 * @route POST /api/reports/upload/:patientId
 * @param {Object} req - Express request object with file
 * @param {Object} res - Express response object
 */
exports.uploadAndCreateReport = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { description, reportType } = req.body;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Validate required fields
    if (!patientId || !description) {
      // Delete file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Required fields: patientId, description'
      });
    }

    // Validate if patientId is a valid MongoDB ObjectId
    if (!patientId.match(/^[0-9a-fA-F]{24}$/)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format'
      });
    }

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Construct file URL
    const fileUrl = `/uploads/${req.file.filename}`;

    // Create new report
    const report = new PatientReport({
      patientId,
      fileUrl,
      description,
      reportType: reportType || 'Other',
      fileSize: req.file.size
    });

    const savedReport = await report.save();

    res.status(201).json({
      success: true,
      message: 'Report uploaded and created successfully',
      data: savedReport
    });
  } catch (error) {
    console.error('Error uploading and creating report:', error);

    // Delete file if database save fails
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading and creating report',
      error: error.message
    });
  }
};

/**
 * Get all reports for a patient (simplified)
 * @route GET /api/reports/patient/:patientId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!patientId || !mongoose.Types.ObjectId.isValid(String(patientId).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid patient ID format',
      });
    }

    const raw = String(patientId).trim();

    // Try to resolve the Patient document to get the canonical _id.
    // If no profile exists yet, query by the raw id directly so reports
    // stored before profile creation are still returned.
    let query;
    const patient = await resolvePatient(raw);
    if (patient) {
      query = { patientId: patient._id };
    } else {
      query = {
        $or: [
          { patientId: new mongoose.Types.ObjectId(raw) },
        ],
      };
    }

    const reports = await PatientReport.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Reports retrieved successfully',
      patientInfo: patient
        ? { patientId: patient._id, name: patient.name, userId: patient.userId }
        : { patientId: raw },
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Error fetching patient reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching patient reports',
      error: error.message,
    });
  }
};

/**
 * Delete report by ID with file cleanup
 * @route DELETE /api/reports/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteReportWithFile = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID format'
      });
    }

    // Find and delete report
    const report = await PatientReport.findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Extract filename from fileUrl and delete the file
    if (report.fileUrl) {
      const filename = report.fileUrl.split('/').pop();
      const filePath = path.join(__dirname, '../uploads', filename);

      // Delete file asynchronously
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error('Error deleting file from storage:', err);
          // Don't return error here as report is already deleted from DB
        } else {
          console.log('File deleted:', filePath);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Report and associated file deleted successfully',
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