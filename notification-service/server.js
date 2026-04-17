import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { startConsumer } from "./messaging/consumer.js";

dotenv.config();

const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI;

// Bootstraps database connection (optional) and starts the HTTP server.
async function startServer() {
  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI);
      console.log(`MongoDB Connected: ${mongoose.connection.host}`);
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error.message);
      process.exit(1);
    }
  } else {
    console.log("MONGO_URI not provided, notification logging disabled.");
  }

  // Start RabbitMQ consumer (non-blocking — REST still works if RabbitMQ is down)
  if (process.env.RABBITMQ_URL) {
    startConsumer().catch((err) => {
      console.warn("[RabbitMQ] Consumer could not start:", err.message);
      console.warn("[RabbitMQ] REST endpoints remain fully operational.");
    });
  } else {
    console.log("[RabbitMQ] RABBITMQ_URL not set — running in REST-only mode.");
  }

  app.listen(PORT, () => {
    console.log("\n======================================");
    console.log("  Notification Service running on port " + PORT);
    console.log("======================================\n");
    console.log("Notification Service running");
    console.log("======================================");
    console.log(`Port          : ${PORT}`);
    console.log(`Environment   : ${process.env.NODE_ENV || "development"}`);
    console.log(`Base URL      : http://localhost:${PORT}/api/notifications`);
    console.log(`Health Check  : http://localhost:${PORT}/health`);
    console.log(
      `RabbitMQ      : ${process.env.RABBITMQ_URL ? "Enabled" : "Disabled"}`,
    );
    console.log("======================================\n");
  });
}

startServer();
