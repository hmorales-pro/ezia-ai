import { NextResponse } from 'next/server';
import { syncFileWithMemory } from '@/lib/file-storage';

export async function GET() {
  try {
    // Synchroniser les données en mémoire avec les fichiers
    await syncFileWithMemory();
    
    return NextResponse.json({ 
      success: true,
      message: 'Stockage synchronisé',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erreur de synchronisation:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Erreur lors de la synchronisation'
    }, { status: 500 });
  }
}