import { NextResponse } from 'next/server';
import { initializeStorage } from '@/lib/startup/sync-storage';

// Initialiser le stockage au premier appel
let initialized = false;

export async function GET() {
  if (!initialized) {
    await initializeStorage();
    initialized = true;
  }
  
  return NextResponse.json({ initialized: true });
}