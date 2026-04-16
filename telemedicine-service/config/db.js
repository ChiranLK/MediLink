/**
 * config/db.js — MongoDB connection for Telemedicine Service
 *
 * MICROSERVICE PATTERN:
 *   Connects to the same MongoDB Atlas cluster but uses its OWN database
 *   (/telemedicine-service). This keeps consultation data isolated from
 *   other services while sharing infrastructure.
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    const { host, port, name } = conn.connection;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   MongoDB Connected`);
    console.log(`   Host     : ${host}`);
    console.log(`   Database : ${name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`   MongoDB Connection Failed`);
    console.error(`   Reason : ${error.message}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
};

export default connectDB;
