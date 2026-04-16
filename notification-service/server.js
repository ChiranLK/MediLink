import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";

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

  app.listen(PORT, () => {
    console.log('\n======================================');
    console.log('  Notification Service running on port ' + PORT);
    console.log('======================================\n');
    console.log('Notification Service running');
    console.log('======================================');
    console.log(`Port          : ${PORT}`);
    console.log(`Environment   : ${process.env.NODE_ENV || 'development'}`);
    console.log(`Base URL      : http://localhost:${PORT}/api/notifications`);
    console.log(`Health Check  : http://localhost:${PORT}/health`);
    console.log('======================================\n');
  });
}

startServer();