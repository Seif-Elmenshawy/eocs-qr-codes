import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URL as string;

if (!MONGODB_URI) {
  throw new Error("Missing MongoDB connection string. Set MONGODB_URI (or MONGODB_URL) in your environment file.");
}

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("DB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}
