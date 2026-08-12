import mongoose from "mongoose";

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URL;
  if (!uri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGODB_URI (or MONGODB_URL) in your environment."
    );
  }
  return uri;
};

const globalForMongoose = globalThis as unknown as {
  conn?: Promise<typeof mongoose> | null;
};

export async function connectDB() {
  if (!globalForMongoose.conn) {
    globalForMongoose.conn = mongoose.connect(getMongoUri());
  }

  try {
    await globalForMongoose.conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    globalForMongoose.conn = null;
    throw new Error("Failed to connect to MongoDB");
  }

  return globalForMongoose.conn;
}
