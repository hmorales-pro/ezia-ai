import { NextResponse } from 'next/server';
import { getDB } from '@/lib/database';
import dbConnect from '@/lib/mongodb';

export async function GET() {
  try {
    const db = getDB();
    
    // Initialize to check connection
    await db.initialize();
    
    const isMemory = db.isUsingMemory();
    
    if (isMemory) {
      return NextResponse.json({
        connected: false,
        type: 'memory',
        message: 'Using in-memory database - MongoDB connection failed',
        details: {
          mongoUri: process.env.MONGODB_URI ? 'Configured' : 'Not configured',
          uriLength: process.env.MONGODB_URI?.length || 0,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }
    
    // Try to get more details about MongoDB connection
    let mongoDetails = {};
    try {
      await dbConnect();
      const mongoose = await import('mongoose');
      mongoDetails = {
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        connected: mongoose.connection.readyState === 1
      };
    } catch (error: any) {
      mongoDetails = {
        error: error.message,
        code: error.code
      };
    }
    
    return NextResponse.json({
      connected: true,
      type: 'mongodb',
      message: 'Successfully connected to MongoDB',
      details: mongoDetails
    });
    
  } catch (error: any) {
    return NextResponse.json({
      connected: false,
      type: null,
      message: 'Error checking database status',
      details: {
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    }, { status: 500 });
  }
}