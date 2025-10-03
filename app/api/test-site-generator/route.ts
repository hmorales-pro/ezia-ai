import { NextRequest, NextResponse } from 'next/server';
import { StreamingSiteGenerator } from '@/lib/agents/streaming-site-generator';
import { siteRenderer } from '@/lib/renderer/site-renderer';

export async function POST(request: NextRequest) {
  try {
    const { prompt, businessInfo } = await request.json();

    if (!prompt) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Prompt requis' 
      }, { status: 400 });
    }

    console.log('Testing site generator for:', prompt);

    // Créer le générateur
    const generator = new StreamingSiteGenerator();
    
    // Configuration de test
    const config = {
      prompt: prompt,
      industry: businessInfo?.industry || 'General',
      tone: businessInfo?.tone || 'Professional',
      pages: ['home'],
      keywords: businessInfo?.keywords || [],
      colors: businessInfo?.colors || {},
      fonts: businessInfo?.fonts || {},
      locale: 'fr'
    };

    // Collecter tous les événements
    const events = [];
    let siteStructure = null;

    for await (const event of generator.generateSite(config)) {
      events.push(event);
      console.log('Event:', event.type);
      
      if (event.type === 'complete') {
        siteStructure = generator.getSiteStructure();
      }
    }

    if (!siteStructure) {
      throw new Error('Site generation failed');
    }

    // Générer le HTML final
    const html = siteRenderer.renderSite(siteStructure);

    return NextResponse.json({
      ok: true,
      site: {
        id: siteStructure.id,
        title: siteStructure.title,
        description: siteStructure.description,
        pages: siteStructure.pages.length,
        theme: siteStructure.theme.name
      },
      html: html,
      events: events.map(e => ({
        type: e.type,
        timestamp: e.timestamp,
        payload: e.type === 'theme' ? { name: e.payload.name } : e.payload
      })),
      generationTime: events.length > 0 && events[events.length - 1].timestamp && events[0].timestamp ? 
        new Date(events[events.length - 1].timestamp).getTime() - 
        new Date(events[0].timestamp).getTime() : 0
    });

  } catch (error: any) {
    console.error('Error in test-site-generator:', error);
    
    return NextResponse.json({ 
      ok: false, 
      error: 'Erreur lors du test',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
