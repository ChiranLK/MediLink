import { verifyJWT } from '../utils/tokenUtils.js';
import { UnauthenticatedError, UnauthorizedError } from '../errors/customErrors.js';

export const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthenticatedError('Authentication Invalid — no token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const { userId, role } = verifyJWT(token);
    req.user = { userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication Invalid — token expired or invalid');
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Not authorized to access this route');
    }
    next();
  };
};
