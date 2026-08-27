import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nuva_fresh_db');
    console.log(`[MongoDB Connected]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to local Mongo DB (${error.message}). Running in mock-fallback memory mode if needed.`);
  }
};
