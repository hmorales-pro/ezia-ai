import { NextResponse } from "next/server";
import { isUsingMemoryDB } from "@/lib/memory-db";
import dbConnect from "@/lib/mongodb";

// Health check endpoint pour diagnostiquer les problèmes
export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === "production",
      usingMemoryDB: isUsingMemoryDB(),
      mongodbConfigured: !!process.env.MONGODB_URI,
      mongodbUriLength: process.env.MONGODB_URI?.length || 0
    },
    database: {
      type: isUsingMemoryDB() ? "memory" : "mongodb",
      status: "unknown",
      error: undefined as string | undefined
    }
  };

  // Test database connection
  if (!isUsingMemoryDB() && process.env.MONGODB_URI) {
    try {
      await dbConnect();
      health.database.status = "connected";
    } catch (error) {
      health.database.status = "error";
      health.database.error = error instanceof Error ? error.message : "Unknown error";
    }
  } else if (isUsingMemoryDB()) {
    health.database.status = "memory-db-active";
  }

  return NextResponse.json(health);
}