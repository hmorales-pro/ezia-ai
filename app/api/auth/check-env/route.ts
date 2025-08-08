import { NextResponse } from 'next/server';

export async function GET() {
  const mongoUri = process.env.MONGODB_URI;
  
  return NextResponse.json({
    MONGODB_URI_exists: !!mongoUri,
    MONGODB_URI_starts_with: mongoUri ? mongoUri.substring(0, 30) + '...' : 'undefined',
    NODE_ENV: process.env.NODE_ENV,
    HF_TOKEN_exists: !!process.env.HF_TOKEN,
    MISTRAL_API_KEY_exists: !!process.env.MISTRAL_API_KEY,
    JWT_SECRET_exists: !!process.env.JWT_SECRET,
  });
}