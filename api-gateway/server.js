import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

// Load environment variables FIRST before importing routes
dotenv.config();

import verifyToken from "./middleware/authMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(morgan("combined"));

// Dynamically import routes after env config is loaded
async function setupRoutes() {
  const authRoutes = await import("./routes/auth.routes.js").then(m => m.default);
  const userRoutes = await import("./routes/users.routes.js").then(m => m.default);
  const rootUserRoutes = await import("./routes/root-users.routes.js").then(m => m.default);
  const patientRoutes = await import("./routes/patient.routes.js").then(m => m.default);
  const doctorRoutes = await import("./routes/doctor.routes.js").then(m => m.default);
  const appointmentRoutes = await import("./routes/appointment.routes.js").then(m => m.default);
  const paymentRoutes = await import("./routes/payment.routes.js").then(m => m.default);
  const aiRoutes = await import("./routes/ai.routes.js").then(m => m.default);
  const notificationRoutes = await import("./routes/notification.routes.js").then(m => m.default);
  const telemedicineRoutes = await import("./routes/telemedicine.routes.js").then(m => m.default);

  // Root level user endpoint (for /users/current-user calls)
  app.use("/users", verifyToken, rootUserRoutes);

  app.use("/api/auth", authRoutes);
  app.use("/api/users", verifyToken, userRoutes);
  app.use("/api/notification", notificationRoutes);

  app.use("/api/patient", verifyToken, patientRoutes);
  app.use("/api/doctor", verifyToken, doctorRoutes);
  app.use("/api/appointment", verifyToken, appointmentRoutes);
  app.use("/api/appointments", verifyToken, appointmentRoutes); // Support both singular and plural
  app.use("/api/payment", verifyToken, paymentRoutes);
  app.use("/api/ai", verifyToken, aiRoutes);
  app.use("/api/telemedicine", verifyToken, telemedicineRoutes);
  
  app.get("/health", (req, res) => {
    res.status(200).json({ success: true, message: "API Gateway running" });
  });

  app.listen(PORT, () => {
    console.log("\n======================================");
    console.log("  API Gateway listening on port " + PORT);
    console.log("======================================\n");
  });
}

setupRoutes().catch(err => {
  console.error("Failed to setup routes:", err);
  process.exit(1);
});
