import { Router } from "express";
const router = Router();

import {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updateProfile,
  verifyToken,
  getAllUsers,
  getAdminStats,
  updateUserRole,
  deleteUser,
} from "../controllers/authcontroller.js";
import {
  validateRegisterInput,
  validateLoginInput,
} from "../middleware/validatormiddleware.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authmiddleware.js";

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.post("/logout", logout);
router.post("/verify", verifyToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/profile", authenticateUser, updateProfile);

// Admin routes
router.get(
  "/admin/users",
  authenticateUser,
  authorizePermissions("admin"),
  getAllUsers,
);
router.get(
  "/admin/stats",
  authenticateUser,
  authorizePermissions("admin"),
  getAdminStats,
);
router.put(
  "/admin/users/:id/role",
  authenticateUser,
  authorizePermissions("admin"),
  updateUserRole,
);
router.delete(
  "/admin/users/:id",
  authenticateUser,
  authorizePermissions("admin"),
  deleteUser,
);

export default router;
