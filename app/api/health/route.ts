import { NextRequest, NextResponse } from 'next/server';
import { checkMongoDBAvailability } from "@/lib/db-utils";

export async function GET(request: NextRequest) {
  try {
    // Vérifier MongoDB
    const mongoAvailable = await checkMongoDBAvailability();
    
    // Collecter les informations de santé
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        mongodb: mongoAvailable ? 'connected' : 'fallback_memory',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      },
      features: {
        huggingface: !!process.env.HF_TOKEN,
        mistral: !!process.env.MISTRAL_API_KEY,
        email: !!process.env.BREVO_API_KEY,
        analytics: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
      },
      deployment: {
        platform: process.env.HUGGINGFACE_SPACES ? 'huggingface_spaces' : 
                  process.env.DOKPLOY ? 'dokploy' : 'standard',
        isDocker: !!process.env.HOSTNAME
      }
    };

    return NextResponse.json(health);
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}