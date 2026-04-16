import Doctor from '../models/Doctor.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/customErrors.js';

// @desc    Register / Create a new doctor profile
// @route   POST /api/doctors/register
// @access  Private (doctor only generally)
export const registerDoctor = async (req, res, next) => {
  try {
    const { name, email, phone, specialization } = req.body;

    // Validate required fields explicitly
    if (!name || !email || !phone || !specialization) {
      throw new BadRequestError('Required fields missing: name, email, phone, specialization');
    }

    // Check if profile with this email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      throw new BadRequestError('Doctor profile with this email already exists');
    }

    // The doctorId is auto-generated in the pre-save hook in Doctor.js 
    // unless explicitly passed in req.body.
    if (req.body.doctorId) {
      const existingId = await Doctor.findOne({ doctorId: req.body.doctorId });
      if (existingId) {
        throw new BadRequestError('Doctor profile with this doctorId already exists');
      }
    }

    // Usually userId comes from authMiddleware (req.user.userId), but if 
    // we want to allow standalone creation/testing without full auth yet:
    const userId = req.user ? req.user.userId : undefined;

    const profileData = {
      ...req.body,
    };
    if (userId) profileData.userId = userId;

    const doctor = await Doctor.create(profileData);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Doctor profile created successfully',
      data: doctor
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new BadRequestError('Profile with this email or ID already exists'));
    }
    next(error);
  }
};

// @desc    Get all doctors (with optional filtering)
// @route   GET /api/doctors
// @access  Public
export const getAllDoctors = async (req, res, next) => {
  try {
    const { specialization, status } = req.query;
    
    // Build filter object
    const filter = {};
    if (specialization) {
      // Case-insensitive regex search for specialization
      filter.specialization = { $regex: specialization, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    
    res.status(StatusCodes.OK).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctors by specialty (optimized for microservices)
// @route   GET /api/doctors/specialty/:specialty
// @query   ?status=active&page=1&limit=10&sortBy=rating
// @access  Public
export const getDoctorsBySpecialty = async (req, res, next) => {
  try {
    const { specialty } = req.params;
    const { status = 'active', page = 1, limit = 10, sortBy = '-rating' } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Max 50 per page
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {
      specialization: { $regex: specialty, $options: 'i' }, // Case-insensitive search
    };

    // Only include active doctors by default (unless status is explicitly changed)
    if (status) {
      filter.status = status;
    }

    // Support sorting by field name (use '-' prefix for descending)
    let sort = {};
    if (sortBy) {
      const sortField = sortBy.startsWith('-') ? sortBy.slice(1) : sortBy;
      const sortOrder = sortBy.startsWith('-') ? -1 : 1;
      sort[sortField] = sortOrder;
    } else {
      sort = { 'rating.average': -1, sessionCount: -1 }; // Default: highest rated, most experienced
    }

    // Execute query with pagination
    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select('doctorId name specialization hospital experience rating consultationFee languages profileImage')
        .sort(sort)
        .limit(limitNum)
        .skip(skip)
        .lean(), // Use lean() for better performance in microservices
      Doctor.countDocuments(filter),
    ]);

    // Return 200 with paginated results
    return res.status(StatusCodes.OK).json({
      success: true,
      message: `Found ${doctors.length} doctors in ${specialty}`,
      data: doctors,
      pagination: {
        currentPage: pageNum,
        pageSize: limitNum,
        totalRecords: total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single doctor by ID
// @route   GET /api/doctors/:id
// @access  Public
export const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let doctor;
    // Check if it's a MongoDB ObjectId or a custom doctorId (like DOC-123)
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
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Get doctor profile by auth-service userId
// @route   GET /api/doctors/user/:userId?email=doctor@example.com
// @access  Private (doctor/admin)
export const getDoctorByUserId = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { email } = req.query; // optional fallback

    // Primary: find by userId
    let doctor = await Doctor.findOne({ userId });

    // Fallback 1: find by email if provided (handles doctors whose auth email matches)
    if (!doctor && email) {
      doctor = await Doctor.findOne({ email: email.trim().toLowerCase() });
      if (doctor && !doctor.userId) {
        doctor.userId = userId;
        await doctor.save();
      }
    }

    // Fallback 2: find by name if provided (for profiles seeded with different emails)
    const { name } = req.query;
    if (!doctor && name) {
      const nameTrimmed = name.trim();
      doctor = await Doctor.findOne({
        name: { $regex: new RegExp(`^${nameTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      });
      if (doctor && !doctor.userId) {
        doctor.userId = userId;
        await doctor.save();
      }
    }

    if (!doctor) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'No doctor profile found for this user. Please complete your profile.',
        data: null,
      });
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile completely
// @route   PUT /api/doctors/:id
// @access  Private (doctor/admin)
export const updateDoctorProfile = async (req, res, next) => {
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

    // Optional Auth Check: if auth is established, ensure owner or admin
    if (req.user && doctor.userId !== req.user.userId && req.user.role !== 'admin') {
      throw new BadRequestError('Not authorized to update this profile');
    }

    // Prevent critical mapping fields from being updated directly (if they exist)
    const updateData = { ...req.body };
    delete updateData.userId;
    delete updateData.doctorId;
    
    // Only admins should ideally verify, but that's handled by middleware
    // delete updateData.isVerified; 

    // Find and update
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctor._id,
      updateData,
      {
        new: true, // Return the edited document
        runValidators: true, // Enforce mongoose schema validations
      }
    );

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Doctor profile updated successfully',
      data: updatedDoctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor profile
// @route   DELETE /api/doctors/:id
// @access  Private (admin only)
export const deleteDoctorProfile = async (req, res, next) => {
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

    await Doctor.findByIdAndDelete(doctor._id);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Doctor profile deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Doctor requests their own account deletion (soft flag — admin must approve)
// @route   PATCH /api/doctors/:id/request-deletion
// @access  Private (doctor only)
export const requestDoctorDeletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      throw new BadRequestError('Please provide a reason for the deletion request');
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

    if (doctor.status === 'pending_deletion') {
      throw new BadRequestError('A deletion request has already been submitted and is pending admin review');
    }

    // Soft-flag: schema enum now includes 'pending_deletion'
    doctor.status = 'pending_deletion';
    doctor.deletionReason = reason.trim();
    doctor.deletionRequestedAt = new Date();
    await doctor.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Your account deletion request has been submitted. An admin will review it within 24–48 hours.',
      data: {
        status: doctor.status,
        deletionReason: doctor.deletionReason,
        deletionRequestedAt: doctor.deletionRequestedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin rejects a doctor deletion request (restores the account)
// @route   PATCH /api/doctors/:id/reject-deletion
// @access  Private (admin only)
export const rejectDoctorDeletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;

    let doctor;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    } else {
      doctor = await Doctor.findOne({ doctorId: id });
    }

    if (!doctor) {
      throw new NotFoundError(`No doctor found with id: ${id}`);
    }

    if (doctor.status !== 'pending_deletion') {
      throw new BadRequestError('This doctor does not have a pending deletion request');
    }

    // Restore to active and clear deletion request fields
    doctor.status = 'active';
    doctor.deletionReason = null;
    doctor.deletionRequestedAt = null;
    await doctor.save();

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Deletion request rejected. Doctor account has been restored to active.',
      data: { status: doctor.status, adminNote: adminNote || null },
    });
  } catch (error) {
    next(error);
  }
};
