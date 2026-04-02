import express from "express";
import cors from "cors";
import authRouter from "./routes/authrouter.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Auth Service is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
});

export default app;
