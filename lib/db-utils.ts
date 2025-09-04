import dbConnect from "./mongodb";
import { getMemoryDB } from "./memory-db";

let mongoDBAvailable: boolean | null = null;
let lastCheckTime = 0;
const CHECK_INTERVAL = 60000; // Re-check every minute

export async function checkMongoDBAvailability(): Promise<boolean> {
  const now = Date.now();
  
  // Use cached result if recent
  if (mongoDBAvailable !== null && now - lastCheckTime < CHECK_INTERVAL) {
    return mongoDBAvailable;
  }

  if (!process.env.MONGODB_URI) {
    console.log("No MongoDB URI configured, will use memory database");
    mongoDBAvailable = false;
    lastCheckTime = now;
    return false;
  }

  try {
    await dbConnect();
    console.log("MongoDB is available and connected");
    mongoDBAvailable = true;
    lastCheckTime = now;
    return true;
  } catch (error) {
    console.error("MongoDB connection failed, will use memory database:", error);
    mongoDBAvailable = false;
    lastCheckTime = now;
    return false;
  }
}

export async function isUsingMongoDB(): Promise<boolean> {
  return await checkMongoDBAvailability();
}

export function resetMongoDBCache() {
  mongoDBAvailable = null;
  lastCheckTime = 0;
}

// Utility to get the appropriate database
export async function getDatabase() {
  const useMongoDB = await isUsingMongoDB();
  if (useMongoDB) {
    return { type: 'mongodb' as const, db: null };
  }
  return { type: 'memory' as const, db: getMemoryDB() };
}