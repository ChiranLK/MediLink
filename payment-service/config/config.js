import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.warn('The service will continue running, but database operations may fail. Ensure your IP is whitelisted in MongoDB Atlas.');
    // Do not exit, allow the server to start for Stripe testing
  }
};

export default connectDB;
