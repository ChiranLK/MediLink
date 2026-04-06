import { UnauthenticatedError, ForbiddenError } from "../errors/customErrors.js";
import axios from "axios";
import { StatusCodes } from "http-status-codes";

export const authenticateUser = async (req, res, next) => {
  // 1. Request Header එකෙන් Token එක ලබාගැනීම
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthenticatedError("Authentication invalid");
  }

  const token = authHeader.split(" ")[1];

  try {
    // 2. Auth Service එකට REST Call එකක් ලබා දීම (Synchronous Communication) 
    // සටහන: Docker භාවිතා කරන විට 'auth-service' යනු service name එකයි. 
    // Local host එකේදී නම් 'http://localhost:5000/api/v1/auth/verify' වැනි URL එකක් භාවිතා කරන්න.
    const response = await axios.post(
      "http://auth-service:5001/api/v1/auth/verify", 
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // 3. Auth Service එකෙන් ලැබෙන User දත්ත Request එකට ඇතුළත් කිරීම 
    req.user = {
      userId: response.data.user.userId,
      role: response.data.user.role,
    };

    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication failed");
  }
};

// 4. Role-based Access Control (උදා: Patient ට පමණක් අවසර දීම) 
export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Unauthorized to access this route");
    }
    next();
  };
};