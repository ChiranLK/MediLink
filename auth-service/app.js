import express from "express";
import cors from "cors";
import authRouter from "./routes/authrouter.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", 
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);

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
