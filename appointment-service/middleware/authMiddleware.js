import { UnauthenticatedError, ForbiddenError } from "../errors/customErrors.js";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

// Auth Service URL - Use environment variable or default to localhost
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || "http://localhost:5000";

// Async error wrapper for Express middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const authenticateUser = asyncHandler(async (req, res, next) => {
  // 1. Request Header එකෙන් Token එක ලබාගැනීම
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    throw new UnauthenticatedError("No Authorization header provided. Use: Authorization: Bearer <token>");
  }
  
  if (!authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Invalid Authorization format. Expected: Bearer <token>");
  }

  const token = authHeader.split(" ")[1];
  
  if (!token) {
    throw new UnauthenticatedError("Token is missing after Bearer");
  }

  try {
    // 2. Auth Service එකට Synchronous Call - Patient verify කර userId සහ role යවනු ලබයි
    const response = await axios.post(
      `${AUTH_SERVICE_URL}/api/auth/verify`, 
      { token } // Auth-service expects token in request body
    );

    // 3. Auth Service එකෙන් ලැබෙන Patient දත්ත Request එකට ඇතුළත් කිරීම 
    req.user = {
      userId: response.data.userId,
      role: response.data.role,
    };

    next();
  } catch (error) {
    if (error.response?.status === 401) {
      throw new UnauthenticatedError("Invalid or expired token - auth-service rejected it");
    }
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new UnauthenticatedError(`Cannot connect to auth-service at ${AUTH_SERVICE_URL}. Make sure auth-service is running on port 5000`);
    }
    throw new UnauthenticatedError(`Authentication failed: ${error.message}`);
  }
});

// 4. Role-based Access Control (උදා: Patient ට පමණක් අවසර දීම) 
export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Unauthorized to access this route");
    }
    next();
  };
};