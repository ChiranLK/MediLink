import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import * as paymentController from "../controllers/paymentController.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(authMiddleware);

// Admin: platform-wide payment overview
router.get("/admin/overview", paymentController.getAdminPaymentOverview);

// Create checkout session
router.post("/checkout", paymentController.createCheckoutSession);

// Verify checkout session completion
router.post("/verify-checkout", paymentController.verifyCheckoutSession);

// Doctor dashboard: completed payments this month (metadata.doctorId)
router.get("/doctor/summary", paymentController.getDoctorPaymentSummary);

// Get all payments for user
router.get("/", paymentController.getUserPayments);

// Get specific payment
router.get("/:paymentId", paymentController.getPayment);

// Refund a payment
router.post("/:paymentId/refund", paymentController.refundPayment);

export default router;
