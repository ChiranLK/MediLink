const Patient = require("../models/Patient");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

/**
 * Create a new patient
 * @route POST /api/patients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createPatient = async (req, res) => {
  try {
    const {
      userId,
      name,
      age,
      gender,
      phone,
      address,
      bloodGroup,
      medicalHistory,
    } = req.body;

    // Validate required fields
    if (!userId || !name || !age || !gender || !phone || !address) {
      return res.status(400).json({
        success: false,
        message: "Required fields: userId, name, age, gender, phone, address",
      });
    }

    // Check phone uniqueness
    const phoneExists = await Patient.findOne({
      phone,
      userId: { $ne: userId },
    });
    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already registered with another patient",
      });
    }

    // If patient already exists, update instead of rejecting
    const existingPatient = await Patient.findOne({ userId });
    if (existingPatient) {
      const updatedPatient = await Patient.findByIdAndUpdate(
        existingPatient._id,
        {
          $set: {
            name,
            age,
            gender,
            phone,
            address,
            bloodGroup,
            medicalHistory,
          },
        },
        { new: true, runValidators: true },
      );
      return res.status(200).json({
        success: true,
        message: "Patient profile updated successfully",
        data: updatedPatient,
      });
    }

    const patient = new Patient({
      userId,
      name,
      age,
      gender,
      phone,
      address,
      bloodGroup,
      medicalHistory,
    });

    const savedPatient = await patient.save();

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: savedPatient,
    });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({
      success: false,
      message: "Error creating patient",
      error: error.message,
    });
  }
};

/**
 * Get all patients
 * @route GET /api/patients
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patients",
      error: error.message,
    });
  }
};

/**
 * Get patient by ID
 * @route GET /api/patients/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    let patient = null;

    // Try by MongoDB _id first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await Patient.findById(id);
    }

    // Fall back to userId lookup
    if (!patient) {
      patient = await Patient.findOne({ userId: id });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching patient",
      error: error.message,
    });
  }
};

/**
 * Update patient by ID
 * @route PUT /api/patients/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find patient by _id or userId
    let patient = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      patient = await Patient.findById(id);
    }
    if (!patient) {
      patient = await Patient.findOne({ userId: id });
    }

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Prevent userId modification
    if (updateData.userId && updateData.userId !== patient.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify userId",
      });
    }

    // Check phone uniqueness
    if (updateData.phone) {
      const phoneExists = await Patient.findOne({
        phone: updateData.phone,
        _id: { $ne: patient._id },
      });
      if (phoneExists) {
        return res.status(400).json({
          success: false,
          message:
            "This phone number is already registered with another patient",
        });
      }
    }

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.userId;

    const updatedPatient = await Patient.findByIdAndUpdate(
      patient._id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: updatedPatient,
    });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({
      success: false,
      message: "Error updating patient",
      error: error.message,
    });
  }
};

/**
 * Delete patient by ID
 * @route DELETE /api/patients/:id
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid patient ID format",
      });
    }

    const patient = await Patient.findByIdAndDelete(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: patient,
    });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting patient",
      error: error.message,
    });
  }
};

/**
 * Upload / replace profile photo for a patient
 * @route POST /patients/:id/photo
 */
exports.uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No photo file uploaded" });
    }

    const { id } = req.params;
    let patient = id.match(/^[0-9a-fA-F]{24}$/)
      ? await Patient.findById(id)
      : null;
    if (!patient) patient = await Patient.findOne({ userId: id });
    if (!patient) {
      fs.unlink(req.file.path, () => {});
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    // Delete old Cloudinary photo if exists
    if (patient.profilePhotoPublicId) {
      try {
        await cloudinary.uploader.destroy(patient.profilePhotoPublicId);
      } catch (_) {
        /* non-fatal */
      }
    }

    // Upload new photo to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "medilink/patient-profiles",
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
      ],
    });

    fs.unlink(req.file.path, () => {});

    patient.profilePhoto = result.secure_url;
    patient.profilePhotoPublicId = result.public_id;
    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo updated",
      data: { profilePhoto: result.secure_url },
    });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    console.error("Error uploading profile photo:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to upload photo",
      error: error.message,
    });
  }
};

/**
 * Remove profile photo for a patient
 * @route DELETE /patients/:id/photo
 */
exports.removeProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    let patient = id.match(/^[0-9a-fA-F]{24}$/)
      ? await Patient.findById(id)
      : null;
    if (!patient) patient = await Patient.findOne({ userId: id });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    if (patient.profilePhotoPublicId) {
      try {
        await cloudinary.uploader.destroy(patient.profilePhotoPublicId);
      } catch (_) {
        /* non-fatal */
      }
    }

    patient.profilePhoto = undefined;
    patient.profilePhotoPublicId = undefined;
    await patient.save();

    return res.status(200).json({
      success: true,
      message: "Profile photo removed",
    });
  } catch (error) {
    console.error("Error removing profile photo:", error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to remove photo",
        error: error.message,
      });
  }
};

/**
 * Request profile deletion (patient-initiated; admin takes final action)
 * @route POST /patients/:id/request-delete
 */
exports.requestDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    let patient = id.match(/^[0-9a-fA-F]{24}$/)
      ? await Patient.findById(id)
      : null;
    if (!patient) patient = await Patient.findOne({ userId: id });
    if (!patient) {
      return res
        .status(404)
        .json({ success: false, message: "Patient not found" });
    }

    patient.deletionRequested = true;
    patient.deletionRequestedAt = new Date();
    await patient.save();

    return res.status(200).json({
      success: true,
      message:
        "Account deletion request submitted. An administrator will review and process your request.",
    });
  } catch (error) {
    console.error("Error requesting deletion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit deletion request",
      error: error.message,
    });
  }
};
