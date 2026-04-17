import { StatusCodes } from "http-status-codes";
import Patient from "../models/patient.js";
import bcrypt from "bcryptjs";
import { hashPassword } from "../utils/passwordutils.js";
import {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} from "../errors/costomerrors.js";
import { verifyJWT } from "../utils/tokenutils.js";
import { createJWT } from "../utils/tokenutils.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const register = async (req, res, next) => {
  try {
    const isFirstAccount = (await Patient.countDocuments()) === 0;

    if (isFirstAccount) {
      req.body.role = "admin";
    } else {
      // Allow frontend to specify 'doctor', default to 'patient' otherwise
      if (req.body.role !== "doctor" && req.body.role !== "patient") {
        req.body.role = "patient";
      }
    }

    // Handle doctor specialization
    if (req.body.role === "doctor" && req.body.specialization) {
      req.body.doctorProfile = {
        specializations: [req.body.specialization],
      };
    }

    const hashedPassword = await hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const user = await Patient.create(req.body);
    res.status(StatusCodes.CREATED).json({ msg: "User Created Successfully" });
  } catch (error) {
    next(error);
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    throw new UnauthenticatedError("no token provided");
  }

  try {
    const { userId } = verifyJWT(token);
    const user = await Patient.findById(userId).select("-password");

    if (!user) {
      throw new NotFoundError("user not found");
    }

    res.status(StatusCodes.OK).json({
      userId: user._id,
      role: user.role,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    throw new UnauthenticatedError("invalid token");
  }
};

/*............................................................................................................................................ */

export const login = async (req, res) => {
  console.log(`[AUTH] Login attempt received for: ${req.body.email}`);
  const patient = await Patient.findOne({ email: req.body.email });
  const isValidUser =
    patient && (await bcrypt.compare(req.body.password, patient.password));

  if (!isValidUser) throw new UnauthenticatedError("Invalid credentials");

  const oneday = 24 * 60 * 60 * 1000;

  const token = createJWT({ userId: patient._id, role: patient.role });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneday),
    secure: process.env.NODE_ENV === "production",
  });

  res.status(StatusCodes.OK).json({
    msg: "Patient logged in successfully",
    token: token,
    patient: {
      userId: patient._id,
      role: patient.role,
      name: patient.fullName,
      email: patient.email,
    },
  });
};

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "Patient logged out" });
};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hansfwilli@gmail.com",
    pass: "ozus epfw uqwp vbel",
  },
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new BadRequestError("Please provide email");
    }

    // Log environment variables for debugging (remove in production)
    console.log("Email config:", {
      user: process.env.EMAIL_USER ? "Email user exists" : "Email user missing",
      pass: process.env.EMAIL_PASSWORD ? "Password exists" : "Password missing",
      frontend: process.env.FRONTEND_URL,
    });

    // Find patient by email
    const patient = await Patient.findOne({ email });
    if (!patient) {
      throw new NotFoundError("No patient found with this email");
    }

    // Generate reset token and set expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token and expiry to patient document
    patient.resetPasswordToken = resetToken;
    patient.resetPasswordExpiry = resetTokenExpiry;
    await patient.save();

    // Create reset URL (frontend route)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: patient.email,
      subject: "Password Reset Request",
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset for your EventPro account.</p>
        <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #0066cc; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(StatusCodes.OK).json({
      msg: "Password reset link sent to your email",
    });
  } catch (error) {
    if (error.name === "NotFoundError" || error.name === "BadRequestError") {
      throw error;
    }
    console.error("Forgot password error:", error);
    throw new BadRequestError(
      "Failed to send reset email. Please try again later.",
    );
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new BadRequestError("Please provide token and new password");
    }

    // Find user with valid token and not expired
    const user = await Patient.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError("Invalid or expired token");
    }

    // Update password and clear reset token fields
    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    res.status(StatusCodes.OK).json({
      msg: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    throw new BadRequestError("Failed to reset password");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { email, phoneNumber, password } = req.body;
    const userId = req.patient?.userId;

    if (!userId) {
      throw new UnauthenticatedError("Not authorized");
    }

    const user = await Patient.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if email is changing and if it's already taken
    if (email && email !== user.email) {
      const existing = await Patient.findOne({ email });
      if (existing) {
        throw new BadRequestError("Email is already in use by another account");
      }
      user.email = email;
    }

    if (phoneNumber) user.phoneNumber = phoneNumber;

    if (password) {
      if (password.length < 6) {
        throw new BadRequestError("Password must be at least 6 characters");
      }
      user.password = await hashPassword(password);
    }

    await user.save();

    res.status(StatusCodes.OK).json({
      msg: "Profile updated successfully",
      patient: {
        userId: user._id,
        role: user.role,
        name: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    if (
      error.name === "NotFoundError" ||
      error.name === "BadRequestError" ||
      error.name === "UnauthenticatedError"
    ) {
      throw error;
    }
    throw new BadRequestError("Failed to update profile settings");
  }
};

// Get current authenticated user from Authorization header
export const getCurrentUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new UnauthenticatedError("No authorization token provided");
    }

    const { userId } = verifyJWT(token);
    const user = await Patient.findById(userId).select("-password");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(StatusCodes.OK).json({
      user: {
        userId: user._id,
        role: user.role,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error) {
    if (
      error.name === "UnauthenticatedError" ||
      error.name === "NotFoundError"
    ) {
      throw error;
    }
    throw new UnauthenticatedError("Invalid token");
  }
};

// ── Admin: Get all users with optional filtering ────────────────────────────
export const getAllUsers = async (req, res) => {
  const { role, search, page = 1, limit = 50 } = req.query;
  const filter = {};
  if (role && ["patient", "doctor", "admin"].includes(role)) filter.role = role;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    Patient.find(filter)
      .select("-password -resetPasswordToken -resetPasswordExpiry")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Patient.countDocuments(filter),
  ]);
  res.status(StatusCodes.OK).json({
    success: true,
    data: users,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
  });
};

// ── Admin: Get platform stats ───────────────────────────────────────────────
export const getAdminStats = async (req, res) => {
  const [totalUsers, patients, doctors, admins, recentUsers] =
    await Promise.all([
      Patient.countDocuments(),
      Patient.countDocuments({ role: "patient" }),
      Patient.countDocuments({ role: "doctor" }),
      Patient.countDocuments({ role: "admin" }),
      Patient.find().select("-password").sort({ createdAt: -1 }).limit(5),
    ]);
  res.status(StatusCodes.OK).json({
    success: true,
    data: { totalUsers, patients, doctors, admins, recentUsers },
  });
};

// ── Admin: Update user role ─────────────────────────────────────────────────
export const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!["patient", "doctor", "admin"].includes(role)) {
    throw new BadRequestError("Invalid role");
  }
  const user = await Patient.findByIdAndUpdate(
    id,
    { role },
    { new: true },
  ).select("-password");
  if (!user) throw new NotFoundError("User not found");
  res.status(StatusCodes.OK).json({ success: true, data: user });
};

// ── Admin: Delete user ──────────────────────────────────────────────────────
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (id === req.patient.userId) {
    throw new BadRequestError("You cannot delete your own account");
  }
  const user = await Patient.findByIdAndDelete(id);
  if (!user) throw new NotFoundError("User not found");
  res.status(StatusCodes.OK).json({ success: true, msg: "User deleted" });
};
