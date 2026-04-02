import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import bcrypt from "bcryptjs";
import { hashPassword } from "../utils/passwordutils.js";
import {
  UnauthenticatedError,
  NotFoundError,
  BadRequestError,
} from "../errors/customerrors.js";
import { createJWT } from "../utils/tokenutils.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;
  req.body.role = isFirstAccount ? "admin" : "user";

  const hashedPassword = await hashPassword(req.body.password);
  req.body.password = hashedPassword;

  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "User Created Successfully" });
};

/*............................................................................................................................................ */

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const isValidUser =
    user && (await bcrypt.compare(req.body.password, user.password));

  if (!isValidUser) throw new UnauthenticatedError("Invalid credentials");

  const oneday = 24 * 60 * 60 * 1000;

  const token = createJWT({ userId: user._id, role: user.role });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneday),
    secure: process.env.NODE_ENV === "production",
  });

  res.status(StatusCodes.OK).json({
    msg: "User logged in",
    user: {
      role: user.role,
      name: user.fullName,
      email: user.email,
    },
  });
};

export const logout = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
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

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("No user found with this email");
    }

    // Generate reset token and set expiry
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token and expiry to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiry = resetTokenExpiry;
    await user.save();

    // Create reset URL (frontend route)
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
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
      "Failed to send reset email. Please try again later."
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
    const user = await User.findOne({
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
