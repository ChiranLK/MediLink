import { Router } from "express";
import upload from "../middleware/multerConfig.js";
import {
  submitVerification,
  getVerificationStatus,
  approveVerification,
  rejectVerification,
  getPendingVerifications,
} from "../controllers/verificationController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";

const router = Router();

// ── Admin: get all pending verifications ───────────────────────────────────
// Must be before /:id routes
router.get(
  "/verification/pending",
  authenticateUser,
  authorizePermissions("admin"),
  asyncHandler(getPendingVerifications),
);

// ── Doctor: submit verification documents ──────────────────────────────────
router.post(
  "/:id/verification",
  authenticateUser,
  authorizePermissions("doctor", "admin"),
  upload.fields([
    { name: "slmcCertificate", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
  ]),
  asyncHandler(submitVerification),
);

// ── Doctor/Admin: get verification status ──────────────────────────────────
router.get(
  "/:id/verification",
  authenticateUser,
  asyncHandler(getVerificationStatus),
);

// ── Admin: approve verification ────────────────────────────────────────────
router.patch(
  "/:id/verification/approve",
  authenticateUser,
  authorizePermissions("admin"),
  asyncHandler(approveVerification),
);

// ── Admin: reject verification ─────────────────────────────────────────────
router.patch(
  "/:id/verification/reject",
  authenticateUser,
  authorizePermissions("admin"),
  asyncHandler(rejectVerification),
);

export default router;
