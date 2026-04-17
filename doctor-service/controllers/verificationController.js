import Doctor from "../models/Doctor.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import { StatusCodes } from "http-status-codes";
import { NotFoundError, BadRequestError } from "../errors/customErrors.js";

/**
 * @desc    Submit professional verification (SLMC cert + profile photo + details)
 * @route   POST /api/doctors/:id/verification
 * @access  Private (doctor)
 */
export const submitVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { hospital, experience, qualifications } = req.body;

    let doctor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    } else {
      doctor = await Doctor.findOne({ doctorId: id });
    }

    if (!doctor) {
      throw new NotFoundError(`No doctor found with id: ${id}`);
    }

    // Ensure the requesting user owns this profile
    if (
      req.user &&
      doctor.userId !== req.user.userId &&
      req.user.role !== "admin"
    ) {
      throw new BadRequestError(
        "Not authorized to submit verification for this profile",
      );
    }

    if (!req.files || !req.files.slmcCertificate || !req.files.profilePhoto) {
      // Clean up any uploaded files
      if (req.files) {
        Object.values(req.files)
          .flat()
          .forEach((f) => {
            fs.unlink(f.path, () => {});
          });
      }
      throw new BadRequestError(
        "Both SLMC Certificate and Profile Photo are required",
      );
    }

    if (!hospital || !experience || !qualifications) {
      // Clean up uploaded files
      Object.values(req.files)
        .flat()
        .forEach((f) => {
          fs.unlink(f.path, () => {});
        });
      throw new BadRequestError(
        "Hospital, experience, and qualifications are required",
      );
    }

    // Upload SLMC certificate to Cloudinary
    const certResult = await cloudinary.uploader.upload(
      req.files.slmcCertificate[0].path,
      {
        folder: "medilink/verification/certificates",
        resource_type: "auto",
      },
    );

    // Upload profile photo to Cloudinary
    const photoResult = await cloudinary.uploader.upload(
      req.files.profilePhoto[0].path,
      {
        folder: "medilink/verification/photos",
        resource_type: "image",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      },
    );

    // Clean up local files
    Object.values(req.files)
      .flat()
      .forEach((f) => {
        fs.unlink(f.path, (err) => {
          if (err) console.error("Error deleting temp file:", err);
        });
      });

    // Update doctor with verification data (pending admin approval)
    doctor.verification = {
      slmcCertificateUrl: certResult.secure_url,
      profilePhotoUrl: photoResult.secure_url,
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      status: "pending",
    };

    // Store submitted data temporarily — will be applied on approval
    doctor.profileImage = photoResult.secure_url;
    // Store the submitted professional info so admin can review it
    // These get applied to the main profile on approval
    doctor.hospital = hospital;
    doctor.experience = Number(experience);
    doctor.qualifications = qualifications;
    doctor.status = "pending";

    await doctor.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message:
        "Verification documents submitted successfully. Awaiting admin review.",
      data: {
        verificationStatus: doctor.verification.status,
        submittedAt: doctor.verification.submittedAt,
      },
    });
  } catch (error) {
    // Clean up files on error
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((f) => {
          fs.unlink(f.path, () => {});
        });
    }
    next(error);
  }
};

/**
 * @desc    Get verification status for a doctor
 * @route   GET /api/doctors/:id/verification
 * @access  Private (doctor/admin)
 */
export const getVerificationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    let doctor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    } else {
      doctor = await Doctor.findOne({ doctorId: id });
    }

    if (!doctor) {
      throw new NotFoundError(`No doctor found with id: ${id}`);
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: {
        isVerified: doctor.isVerified,
        verification: doctor.verification || { status: "not_submitted" },
        hospital: doctor.hospital,
        experience: doctor.experience,
        qualifications: doctor.qualifications,
        profileImage: doctor.profileImage,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin approves doctor verification
 * @route   PATCH /api/doctors/:id/verification/approve
 * @access  Private (admin only)
 */
export const approveVerification = async (req, res, next) => {
  try {
    const { id } = req.params;

    let doctor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    } else {
      doctor = await Doctor.findOne({ doctorId: id });
    }

    if (!doctor) {
      throw new NotFoundError(`No doctor found with id: ${id}`);
    }

    if (!doctor.verification || doctor.verification.status !== "pending") {
      throw new BadRequestError(
        "No pending verification request for this doctor",
      );
    }

    // Approve: update verification status and doctor profile
    doctor.verification.status = "approved";
    doctor.verification.reviewedAt = new Date();
    doctor.verification.reviewedBy = req.user?.userId || "admin";
    doctor.verification.rejectionReason = null;
    doctor.isVerified = true;
    doctor.status = "active";

    // Profile photo already set during submission, keep it
    // Hospital, experience, qualifications already set during submission

    await doctor.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Doctor verification approved successfully.",
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Admin rejects doctor verification
 * @route   PATCH /api/doctors/:id/verification/reject
 * @access  Private (admin only)
 */
export const rejectVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      throw new BadRequestError("Rejection reason is required");
    }

    let doctor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    } else {
      doctor = await Doctor.findOne({ doctorId: id });
    }

    if (!doctor) {
      throw new NotFoundError(`No doctor found with id: ${id}`);
    }

    if (!doctor.verification || doctor.verification.status !== "pending") {
      throw new BadRequestError(
        "No pending verification request for this doctor",
      );
    }

    doctor.verification.status = "rejected";
    doctor.verification.reviewedAt = new Date();
    doctor.verification.reviewedBy = req.user?.userId || "admin";
    doctor.verification.rejectionReason = reason.trim();
    doctor.isVerified = false;
    // Keep status as pending so doctor can resubmit

    await doctor.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: "Doctor verification rejected.",
      data: {
        verificationStatus: doctor.verification.status,
        rejectionReason: doctor.verification.rejectionReason,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all doctors with pending verification (admin)
 * @route   GET /api/doctors/verification/pending
 * @access  Private (admin only)
 */
export const getPendingVerifications = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({
      "verification.status": "pending",
    }).sort({ "verification.submittedAt": -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};
