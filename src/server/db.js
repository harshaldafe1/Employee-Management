import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️ MONGODB_URI is not set. Please provide a MongoDB connection string in your environment variables/secrets.");
    console.warn("Database functionality will fail until it's configured.");
    return;
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: 'employee_management_scheme'
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
  }
};
