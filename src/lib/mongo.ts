import mongoose from "mongoose";
import dns from "node:dns";

const getMongoUri = () => {
  const uri = process.env.MONGODB_URI ?? process.env.MONGODB_URL;
  if (!uri) {
    throw new Error(
      "Missing MongoDB connection string. Set MONGODB_URI (or MONGODB_URL) in your environment."
    );
  }
  return uri;
};

async function ensureDnsResolution(uri: string) {
  const host = new URL(uri).hostname;
  try {
    await dns.promises.resolveSrv(`_mongodb._tcp.${host}`);
  } catch {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  }
}

const globalForMongoose = globalThis as unknown as {
  conn?: Promise<typeof mongoose> | null;
};

export async function connectDB() {
  if (!globalForMongoose.conn) {
    await ensureDnsResolution(getMongoUri());
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
