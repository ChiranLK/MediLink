import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST — before any other imports
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Connect to the telemedicine-service database on Atlas
    await connectDB();

    app.listen(PORT, () => {
      console.log("\n======================================");
      console.log(` Telemedicine Service running on port ${PORT}`);
      console.log("======================================");
      console.log(`Environment  : ${process.env.NODE_ENV}`);
      console.log(`Base URL     : http://localhost:${PORT}/api/consultations`);
      console.log(`Health check : http://localhost:${PORT}/health`);
      console.log(`Platform     : Jitsi Meet (meet.jit.si) — no API key required`);
    });
  } catch (error) {
    console.error('Failed to start Telemedicine Service:', error.message);
    process.exit(1);
  }
};

startServer();
