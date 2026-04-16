import express from "express";
import cors from "cors";
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// Global middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// Health check route
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "Notification service is running" });
});

app.use("/notifications", notificationRoutes);

// Centralized fallback error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

export default app;
