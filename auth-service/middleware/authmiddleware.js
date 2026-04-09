import { verifyJWT } from "../utils/tokenutils";
import {UnauthenticatedError,UnauthorizedError} from "../errors/costomerrors.js";
export const authenticateUser = (req, res, next) => {
  console.log("authenticating user");
  const { token } = req.cookies;
  if (!token) throw new UnauthenticatedError("authentication Invalid");

  try {
    const { userId, role } = verifyJWT(token);
    req.patient = { userId, role };

    next();
  } catch (error) {
    throw new UnauthenticatedError("authentication Invalid");
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    console.log(roles);
    if (!roles.includes(req.patient.role)) {
      throw new UnauthorizedError("not authorized to access this route");
    }
    next();
  };
};
