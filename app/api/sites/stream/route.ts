import { NextRequest, NextResponse } from 'next/server';
import { StreamingSiteGenerator } from '@/lib/agents/streaming-site-generator';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, ...config } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Create generator instance
    const generator = new StreamingSiteGenerator(process.env.HF_TOKEN);

    // Create a TransformStream for SSE
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start generation
    (async () => {
      try {
        for await (const event of generator.generateSite(config)) {
          // Format as SSE event
          const data = `data: ${JSON.stringify(event)}\n\n`;
          await writer.write(encoder.encode(data));
        }
      } catch (error) {
        // Send error event
        const errorEvent = {
          type: 'error',
          payload: {
            message: error instanceof Error ? error.message : 'Generation failed',
            details: error
          }
        };
        const data = `data: ${JSON.stringify(errorEvent)}\n\n`;
        await writer.write(encoder.encode(data));
      } finally {
        await writer.close();
      }
    })();

    // Return SSE stream
    return new NextResponse(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });

  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to start generation',
        details: error instanceof Error ? error.message : error
      },
      { status: 500 }
    );
  }
}