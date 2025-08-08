/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";
import { INITIAL_SYSTEM_PROMPT, FOLLOW_UP_SYSTEM_PROMPT } from "@/lib/prompts";

// Initialize Mistral client
const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || "",
});

// This is a wrapper that uses Mistral AI directly for Ezia users
// to avoid HF billing issues and the Pro modal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, prompt, redesignMarkdown, html, ...restBody } = body;
    
    // If this request comes from Ezia (has a businessId), use Mistral directly
    if (businessId && process.env.MISTRAL_API_KEY) {
      console.log("[Ezia AI] Using Mistral for businessId:", businessId);
      
      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      // Start the response
      const response = new NextResponse(stream.readable, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });

      (async () => {
        try {
          const messages = [
            {
              role: "system" as const,
              content: INITIAL_SYSTEM_PROMPT,
            },
            {
              role: "user" as const,
              content: redesignMarkdown
                ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
                : html
                ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nNow, please create a new design based on this HTML.`
                : prompt,
            },
          ];

          const mistralStream = mistral.chat.stream({
            model: "mistral-large-latest",
            messages,
            temperature: 0.7,
            maxTokens: 8192,
          });

          let completeResponse = "";
          for await (const chunk of mistralStream) {
            const content = chunk.data.choices[0]?.delta?.content || "";
            if (content) {
              await writer.write(encoder.encode(content));
              completeResponse += content;
              
              // Stop if we have a complete HTML document
              if (completeResponse.includes("</html>")) {
                break;
              }
            }
          }
        } catch (error: any) {
          console.error("Mistral AI error:", error);
          await writer.write(
            encoder.encode(
              JSON.stringify({
                ok: false,
                message: "Erreur avec le service AI. Veuillez réessayer.",
              })
            )
          );
        } finally {
          await writer.close();
        }
      })();

      return response;
    }
    
    // If no businessId or no Mistral key, forward to regular ask-ai route
    const { POST: askAiPost } = await import('../ask-ai/route');
    const newRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify(body)
    });
    
    // For non-Ezia requests, let the regular route handle tokens
    return await askAiPost(newRequest);
  } catch (error: any) {
    console.error("Ezia AI route error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "An error occurred while processing your request."
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, prompt, html, previousPrompt, selectedElementHtml } = body;
    
    // If this request comes from Ezia and we have Mistral, use it directly
    if (businessId && process.env.MISTRAL_API_KEY) {
      console.log("[Ezia AI PUT] Using Mistral for businessId:", businessId);
      
      try {
        const messages = [
          {
            role: "system" as const,
            content: FOLLOW_UP_SYSTEM_PROMPT,
          },
          {
            role: "user" as const,
            content: previousPrompt || "You are modifying the HTML file based on the user's request.",
          },
          {
            role: "assistant" as const,
            content: `The current code is: \n\`\`\`html\n${html}\n\`\`\` ${
              selectedElementHtml
                ? `\n\nYou have to update ONLY the following element, NOTHING ELSE: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\``
                : ""
            }`,
          },
          {
            role: "user" as const,
            content: prompt,
          },
        ];

        const result = await mistral.chat.complete({
          model: "mistral-large-latest",
          messages,
          temperature: 0.7,
          maxTokens: 4096,
        });

        const content = result.choices?.[0]?.message?.content || "";
        
        // Extract HTML from the response
        let newHtml = html;
        const htmlMatch = content.match(/```html\n([\s\S]*?)\n```/);
        if (htmlMatch) {
          newHtml = htmlMatch[1];
        } else if (content.includes("<!DOCTYPE")) {
          newHtml = content;
        }
        
        return NextResponse.json({
          ok: true,
          html: newHtml,
          updatedLines: [],
        });
      } catch (error: any) {
        console.error("Mistral AI PUT error:", error);
        return NextResponse.json(
          {
            ok: false,
            message: "Erreur avec le service AI. Veuillez réessayer.",
          },
          { status: 500 }
        );
      }
    }
    
    // Forward to regular ask-ai route if not from Ezia
    const { PUT: askAiPut } = await import('../ask-ai/route');
    const newRequest = new NextRequest(request.url, {
      method: 'PUT',
      headers: request.headers,
      body: JSON.stringify(body)
    });
    
    return await askAiPut(newRequest);
  } catch (error: any) {
    console.error("Ezia AI PUT route error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "An error occurred while processing your request."
      },
      { status: 500 }
    );
  }
}