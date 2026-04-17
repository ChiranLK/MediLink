import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/customErrors.js";
import Review from "../models/Review.js";
import Doctor from "../models/Doctor.js";

/**
 * REVIEW CONTROLLER — Doctor Service
 *
 * Handles patient ratings after video consultations.
 * Only video consultations can be rated (one review per appointment).
 */

// ── Helper: recalculate doctor's average rating ──────────────────────
const recalcDoctorRating = async (doctorId) => {
  const result = await Review.aggregate([
    { $match: { doctorId } },
    {
      $group: {
        _id: "$doctorId",
        average: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  const avg = result.length > 0 ? Math.round(result[0].average * 10) / 10 : 0;
  const count = result.length > 0 ? result[0].count : 0;

  // Update on Doctor model — try both _id and doctorId
  let doctor;
  if (doctorId.match(/^[0-9a-fA-F]{24}$/)) {
    doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { "rating.average": avg, "rating.count": count },
      { new: true },
    );
  }
  if (!doctor) {
    doctor = await Doctor.findOneAndUpdate(
      { doctorId },
      { "rating.average": avg, "rating.count": count },
      { new: true },
    );
  }
  if (!doctor) {
    doctor = await Doctor.findOneAndUpdate(
      { _id: doctorId },
      { "rating.average": avg, "rating.count": count },
      { new: true },
    );
  }

  return { average: avg, count };
};

// ─────────────────────────────────────────────────────────────────
// @desc    Submit a review for a completed video consultation
// @route   POST /api/doctors/reviews
// @access  Patient (Private)
// ─────────────────────────────────────────────────────────────────
export const createReview = async (req, res, next) => {
  try {
    const { doctorId, appointmentId, rating, comment, patientName } = req.body;

    if (!doctorId || !appointmentId || !rating) {
      throw new BadRequestError(
        "Required fields: doctorId, appointmentId, rating",
      );
    }

    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new BadRequestError("Rating must be between 1 and 5");
    }

    // Prevent duplicate reviews for same appointment
    const existing = await Review.findOne({ appointmentId });
    if (existing) {
      throw new BadRequestError(
        "You have already submitted a review for this appointment",
      );
    }

    const patientId = req.user?.userId || "unknown";

    const review = await Review.create({
      doctorId,
      patientId,
      appointmentId,
      rating: ratingNum,
      comment: comment || "",
      patientName: patientName || "Anonymous",
      consultationType: "Video",
    });

    // Recalculate doctor's average rating
    const updatedRating = await recalcDoctorRating(doctorId);

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Review submitted successfully",
      data: { review, doctorRating: updatedRating },
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(
        new BadRequestError(
          "You have already submitted a review for this appointment",
        ),
      );
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get all reviews for a doctor
// @route   GET /api/doctors/:doctorId/reviews
// @access  Public
// ─────────────────────────────────────────────────────────────────
export const getDoctorReviews = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [reviews, total] = await Promise.all([
      Review.find({ doctorId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Review.countDocuments({ doctorId }),
    ]);

    res.status(StatusCodes.OK).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Check if a patient already reviewed this appointment
// @route   GET /api/doctors/reviews/check/:appointmentId
// @access  Patient (Private)
// ─────────────────────────────────────────────────────────────────
export const checkReviewExists = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;
    const review = await Review.findOne({ appointmentId }).lean();

    res.status(StatusCodes.OK).json({
      success: true,
      exists: !!review,
      data: review || null,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────
// @desc    Get rating summary for a doctor (for dashboard)
// @route   GET /api/doctors/:doctorId/rating-summary
// @access  Public
// ─────────────────────────────────────────────────────────────────
export const getDoctorRatingSummary = async (req, res, next) => {
  try {
    const { doctorId } = req.params;

    // Get distribution of ratings (1-5 stars)
    const distribution = await Review.aggregate([
      { $match: { doctorId } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
    ]);

    const total = distribution.reduce((sum, d) => sum + d.count, 0);
    const average =
      total > 0
        ? Math.round(
            (distribution.reduce((sum, d) => sum + d._id * d.count, 0) /
              total) *
              10,
          ) / 10
        : 0;

    // Build star distribution object
    const stars = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      stars[d._id] = d.count;
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: { average, total, stars },
    });
  } catch (error) {
    next(error);
  }
};
