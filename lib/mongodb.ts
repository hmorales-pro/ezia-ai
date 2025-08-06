import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
// @ts-expect-error iknown issue with mongoose types
let cached = global.mongoose;

if (!cached) {
  // @ts-expect-error iknown issue with mongoose types
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI as string)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export default dbConnect;
