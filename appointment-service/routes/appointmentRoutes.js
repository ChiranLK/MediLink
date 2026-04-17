import express from "express";
import {
  bookAppointment,
  getAllAppointments,
  getMyAppointments,
  updateAppointment,
  updateMyAppointment,
  deleteAppointment,
  getAppointmentsByDoctorId,
} from "../controllers/appointmentController.js";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Book Appointment - Patient only
router.post(
  "/",
  authenticateUser,
  authorizePermissions("patient"),
  bookAppointment,
);

// 2. Get My Appointments - Authenticated users
router.get("/my-appointments", authenticateUser, getMyAppointments);

// 3. Get All Appointments - Admin only
router.get(
  "/",
  authenticateUser,
  authorizePermissions("admin"),
  getAllAppointments,
);

// 4. Get Appointments for a specific Doctor (called by doctor-service or doctor dashboard)
router.get(
  "/doctor/:doctorId",
  authenticateUser,
  authorizePermissions("doctor", "admin"),
  getAppointmentsByDoctorId,
);

// 5. Update Appointment - Admin or Doctor (confirm / cancel / complete)
router.put(
  "/:id",
  authenticateUser,
  authorizePermissions("admin", "doctor"),
  updateAppointment,
);
// 5b. Patient edits their own pending appointment
router.patch(
  "/:id/my",
  authenticateUser,
  authorizePermissions("patient"),
  updateMyAppointment,
);
// 6. Delete/Cancel Appointment - Authenticated users
router.delete("/:id", authenticateUser, deleteAppointment);

export default router;
