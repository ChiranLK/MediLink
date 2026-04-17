import { Router } from "express";
import {
  createReview,
  getDoctorReviews,
  checkReviewExists,
  getDoctorRatingSummary,
} from "../controllers/reviewController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";

const router = Router();

/**
 * Review Routes — mounted at /api/doctors in app.js
 *
 * Only video consultations can be rated. One review per appointment.
 */

// ── POST /api/doctors/reviews ─────────────────────────────────────
// Patient submits a rating after completed video consultation
router.post("/reviews", authenticateUser, asyncHandler(createReview));

// ── GET /api/doctors/reviews/check/:appointmentId ─────────────────
// Check if a review already exists for this appointment
router.get(
  "/reviews/check/:appointmentId",
  authenticateUser,
  asyncHandler(checkReviewExists),
);

// ── GET /api/doctors/:doctorId/reviews ────────────────────────────
// Get all reviews for a specific doctor (public)
router.get("/:doctorId/reviews", asyncHandler(getDoctorReviews));

// ── GET /api/doctors/:doctorId/rating-summary ─────────────────────
// Get rating distribution for doctor dashboard
router.get("/:doctorId/rating-summary", asyncHandler(getDoctorRatingSummary));

export default router;
