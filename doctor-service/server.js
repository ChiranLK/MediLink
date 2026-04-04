import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST — before any other imports that may use them
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 3003;

const startServer = async () => {
  try {
    // Connect to the doctor-service database on the shared Atlas cluster
    await connectDB();

    // Only start listening after a successful DB connection
    app.listen(PORT, () => {
      console.log(`🚀 Doctor Service running on port ${PORT}`);
      console.log(`📋 Environment : ${process.env.NODE_ENV}`);
      console.log(`🔗 Base URL     : http://localhost:${PORT}/api/doctors`);
      console.log(`❤️  Health check : http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start Doctor Service:', error.message);
    process.exit(1);
  }
};

startServer();
