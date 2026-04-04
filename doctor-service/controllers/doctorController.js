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
