import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST — before any other imports that may use them
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app.js';
import connectDB from './config/config.js';

const PORT = process.env.PORT || 3002;

const startServer = async () => {
  try {
    // Connect to the appointment-service database on the shared Atlas cluster
    await connectDB();

    // Only start listening after a successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Appointment Service running on port ${PORT}`);
      console.log(`📋 Environment : ${process.env.NODE_ENV}`);
      console.log(`🔗 Base URL     : http://localhost:${PORT}/api/appointments`);
      console.log(`❤️  Health check : http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start Appointment Service:', error.message);
    process.exit(1);
  }
};

startServer();
