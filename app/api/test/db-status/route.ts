import { NextResponse } from "next/server";
import { isUsingMemoryDB } from "@/lib/memory-db";

export async function GET() {
  return NextResponse.json({
    usingMemoryDB: isUsingMemoryDB(),
    mongodbUri: process.env.MONGODB_URI ? "configured" : "not configured",
    mongodbUriLength: process.env.MONGODB_URI?.length || 0,
    nodeEnv: process.env.NODE_ENV
  });
}