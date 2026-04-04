/**
 * config/db.js — MongoDB connection for Doctor Service
 *
 * MICROSERVICE PATTERN:
 *   Each microservice connects to the SAME MongoDB Atlas cluster but uses its
 *   OWN database (e.g. /doctor-service). This keeps collections isolated per
 *   service while sharing infrastructure and credentials.
 *
 *   The database name is embedded in MONGO_URI inside .env — never hardcoded here.
 */

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    const { host, port, name } = conn.connection;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ MongoDB Connected`);
    console.log(`   Host     : ${host}`);
    console.log(`   Database : ${name}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error) {
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error(`❌ MongoDB Connection Failed`);
    console.error(`   Reason : ${error.message}`);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }
};

export default connectDB;
