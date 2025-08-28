/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { InferenceClient } from "@huggingface/inference";

import { MODELS, PROVIDERS } from "@/lib/providers";
import {
  DIVIDER,
  FOLLOW_UP_SYSTEM_PROMPT,
  INITIAL_SYSTEM_PROMPT,
  MAX_REQUESTS_PER_IP,
  REPLACE_END,
  SEARCH_START,
} from "@/lib/prompts";
import MY_TOKEN_KEY from "@/lib/get-cookie-name";
import { generateWithFallback } from "@/lib/fallback-ai";

const ipAddresses = new Map();

export async function POST(request: NextRequest) {
  const authHeaders = await headers();
  const userToken = request.cookies.get(MY_TOKEN_KEY())?.value;

  const body = await request.json();
  const { prompt, provider, model, redesignMarkdown, html, businessId, stream = true } = body;

  if (!model || (!prompt && !redesignMarkdown)) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const selectedModel = MODELS.find(
    (m) => m.value === model || m.label === model
  );
  if (!selectedModel) {
    return NextResponse.json(
      { ok: false, error: "Invalid model selected" },
      { status: 400 }
    );
  }

  if (!selectedModel.providers.includes(provider) && provider !== "auto") {
    return NextResponse.json(
      {
        ok: false,
        error: `The selected model does not support the ${provider} provider.`,
        openSelectProvider: true,
      },
      { status: 400 }
    );
  }

  let token = userToken;
  let billTo: string | null = null;

  /**
   * Handle local usage token, this bypass the need for a user token
   * and allows local testing without authentication.
   * This is useful for development and testing purposes.
   */
  if (process.env.HF_TOKEN && process.env.HF_TOKEN.length > 0) {
    token = process.env.HF_TOKEN;
  }

  const ip = authHeaders.get("x-forwarded-for")?.includes(",")
    ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
    : authHeaders.get("x-forwarded-for");

  if (!token) {
    ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
    if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
      return NextResponse.json(
        {
          ok: false,
          openLogin: true,
          message: "Log In to continue using the service",
        },
        { status: 429 }
      );
    }

    token = process.env.DEFAULT_HF_TOKEN as string;
    billTo = "huggingface";
  }

  const DEFAULT_PROVIDER = PROVIDERS.novita;
  
  // Si le provider est "auto", essayer d'utiliser le provider recommandé du modèle
  let selectedProvider;
  if (provider === "auto") {
    // Utiliser le provider recommandé du modèle
    selectedProvider = PROVIDERS[selectedModel.autoProvider as keyof typeof PROVIDERS];
    
    // Si le provider recommandé n'existe pas, utiliser le premier provider disponible
    if (!selectedProvider && selectedModel.providers.length > 0) {
      const firstProvider = selectedModel.providers[0];
      selectedProvider = PROVIDERS[firstProvider as keyof typeof PROVIDERS];
    }
  } else {
    selectedProvider = PROVIDERS[provider as keyof typeof PROVIDERS];
  }
  
  // Fallback au provider par défaut si aucun provider n'est trouvé
  if (!selectedProvider) {
    selectedProvider = DEFAULT_PROVIDER;
  }

  try {
    // Log pour debug
    console.log("AI Request - Provider:", selectedProvider.id, "Model:", selectedModel.value);
    console.log("Token available:", !!token, "BillTo:", billTo);
    
        // Handle non-streaming mode for website generation
    if (!stream) {
      console.log("AI Request - Non-streaming mode");
      
      try {
        const client = new InferenceClient(token);
        const chatCompletion = await client.chatCompletion(
          {
            model: selectedModel.value,
            provider: selectedProvider.id as any,
            messages: [
              {
                role: "system",
                content: businessId ? 
                  `${INITIAL_SYSTEM_PROMPT}\n\nIMPORTANT: Tu dois créer un site web professionnel en français.\nUtilise des couleurs et un design adaptés à l'industrie mentionnée.\nLe site doit inclure: header avec navigation, hero section, services, à propos, contact, footer.\nLe contenu doit être pertinent et personnalisé selon les informations du business fournies.` :
                  INITIAL_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: businessId
                  ? `Génère un site web professionnel en français basé sur ces informations:\n\n${prompt}\n\nCrée un site moderne et responsive qui correspond parfaitement au business décrit.`
                  : prompt,
              },
            ],
            max_tokens: selectedProvider.max_tokens,
          },
          billTo ? { billTo } : {}
        );
        
        const responseContent = chatCompletion.choices[0]?.message?.content;
        
        if (!responseContent) {
          return NextResponse.json(
            { ok: false, message: "No content returned from the model" },
            { status: 400 }
          );
        }
        
        console.log("AI Response length:", responseContent.length);
        
        return NextResponse.json({
          ok: true,
          content: responseContent,
          model: selectedModel.value,
          provider: selectedProvider.id
        });
        
      } catch (error: any) {
        console.error("AI non-streaming error:", error);
        
        if (error.message?.includes("exceeded your monthly included credits")) {
          return NextResponse.json(
            {
              ok: false,
              openProModal: true,
              message: error.message,
            },
            { status: 402 }
          );
        }
        
        // Try fallback for non-streaming mode
        if (error.message?.includes("Failed to perform inference") || error.message?.includes("HTTP error")) {
          console.log("Trying fallback in non-streaming mode");
          try {
            const fallbackResponse = await generateWithFallback(
              token,
              businessId
                ? `Génère un site web professionnel en français basé sur ces informations:\n\n${prompt}\n\nCrée un site moderne et responsive qui correspond parfaitement au business décrit.`
                : prompt,
              INITIAL_SYSTEM_PROMPT
            );
            
            return NextResponse.json({
              ok: true,
              content: fallbackResponse,
              model: "fallback",
              provider: "huggingface"
            });
          } catch (fallbackError) {
            console.error("Fallback also failed:", fallbackError);
          }
        }
        
        return NextResponse.json(
          {
            ok: false,
            message: error.message || "An error occurred while processing your request.",
          },
          { status: 500 }
        );
      }
    }
    
    // Create a stream response
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
      let completeResponse = "";
      try {
        const client = new InferenceClient(token);
        const chatCompletion = client.chatCompletionStream(
          {
            model: selectedModel.value,
            provider: selectedProvider.id as any,
            messages: [
              {
                role: "system",
                content: businessId ? 
                  `${INITIAL_SYSTEM_PROMPT}\n\nIMPORTANT: Tu dois créer un site web professionnel en français.\nUtilise des couleurs et un design adaptés à l'industrie mentionnée.\nLe site doit inclure: header avec navigation, hero section, services, à propos, contact, footer.\nLe contenu doit être pertinent et personnalisé selon les informations du business fournies.` :
                  INITIAL_SYSTEM_PROMPT,
              },
              {
                role: "user",
                content: redesignMarkdown
                  ? `Here is my current design as a markdown:\n\n${redesignMarkdown}\n\nNow, please create a new design based on this markdown.`
                  : html
                  ? `Here is my current HTML code:\n\n\`\`\`html\n${html}\n\`\`\`\n\nNow, please create a new design based on this HTML.`
                  : businessId
                  ? `Génère un site web professionnel en français basé sur ces informations:\n\n${prompt}\n\nCrée un site moderne et responsive qui correspond parfaitement au business décrit.`
                  : prompt,
              },
            ],
            max_tokens: selectedProvider.max_tokens,
          },
          billTo ? { billTo } : {}
        );

        while (true) {
          const { done, value } = await chatCompletion.next();
          if (done) {
            break;
          }

          const chunk = value.choices[0]?.delta?.content;
          if (chunk) {
            let newChunk = chunk;
            if (!selectedModel?.isThinker) {
              if (provider !== "sambanova") {
                await writer.write(encoder.encode(chunk));
                completeResponse += chunk;

                if (completeResponse.includes("</html>")) {
                  break;
                }
              } else {
                if (chunk.includes("</html>")) {
                  newChunk = newChunk.replace(/<\/html>[\s\S]*/, "</html>");
                }
                completeResponse += newChunk;
                await writer.write(encoder.encode(newChunk));
                if (newChunk.includes("</html>")) {
                  break;
                }
              }
            } else {
              const lastThinkTagIndex =
                completeResponse.lastIndexOf("</think>");
              completeResponse += newChunk;
              await writer.write(encoder.encode(newChunk));
              if (lastThinkTagIndex !== -1) {
                const afterLastThinkTag = completeResponse.slice(
                  lastThinkTagIndex + "</think>".length
                );
                if (afterLastThinkTag.includes("</html>")) {
                  break;
                }
              }
            }
          }
        }
      } catch (error: any) {
        console.error("AI inference error:", error);
        if (error.message?.includes("exceeded your monthly included credits")) {
          await writer.write(
            encoder.encode(
              JSON.stringify({
                ok: false,
                openProModal: true,
                message: error.message,
              })
            )
          );
        } else if (error.message?.includes("Failed to perform inference") || error.message?.includes("HTTP error")) {
          // Erreur d'inférence, essayer avec le modèle de fallback
          console.log("Trying fallback model due to provider error");
          try {
            const fallbackHtml = await generateWithFallback(
              token,
              redesignMarkdown
                ? `Create a new design based on this markdown:\n\n${redesignMarkdown}`
                : html
                ? `Create a new design based on this HTML:\n\n${html}`
                : prompt,
              INITIAL_SYSTEM_PROMPT
            );
            
            await writer.write(encoder.encode(fallbackHtml));
            completeResponse = fallbackHtml;
          } catch (fallbackError: any) {
            console.error("Fallback also failed:", fallbackError);
            await writer.write(
              encoder.encode(
                JSON.stringify({
                  ok: false,
                  openSelectProvider: true,
                  message: "Le service AI n'est pas disponible. Veuillez vous connecter ou réessayer plus tard.",
                })
              )
            );
          }
        } else {
          await writer.write(
            encoder.encode(
              JSON.stringify({
                ok: false,
                message:
                  error.message ||
                  "An error occurred while processing your request.",
              })
            )
          );
        }
      } finally {
        try {
          await writer?.close();
        } catch (e) {
          // Ignorer si déjà fermé
          console.log('Stream already closed');
        }
      }
    })();

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        openSelectProvider: true,
        message:
          error?.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const authHeaders = await headers();
  const userToken = request.cookies.get(MY_TOKEN_KEY())?.value;

  const body = await request.json();
  const { prompt, html, previousPrompt, provider, selectedElementHtml, model, businessId } =
    body;

  if (!prompt || !html) {
    return NextResponse.json(
      { ok: false, error: "Missing required fields" },
      { status: 400 }
    );
  }

  const selectedModel = MODELS.find(
    (m) => m.value === model || m.label === model
  );
  if (!selectedModel) {
    return NextResponse.json(
      { ok: false, error: "Invalid model selected" },
      { status: 400 }
    );
  }

  let token = userToken;
  let billTo: string | null = null;

  /**
   * Handle local usage token, this bypass the need for a user token
   * and allows local testing without authentication.
   * This is useful for development and testing purposes.
   */
  if (process.env.HF_TOKEN && process.env.HF_TOKEN.length > 0) {
    token = process.env.HF_TOKEN;
  }

  const ip = authHeaders.get("x-forwarded-for")?.includes(",")
    ? authHeaders.get("x-forwarded-for")?.split(",")[1].trim()
    : authHeaders.get("x-forwarded-for");

  if (!token) {
    ipAddresses.set(ip, (ipAddresses.get(ip) || 0) + 1);
    if (ipAddresses.get(ip) > MAX_REQUESTS_PER_IP) {
      return NextResponse.json(
        {
          ok: false,
          openLogin: true,
          message: "Log In to continue using the service",
        },
        { status: 429 }
      );
    }

    token = process.env.DEFAULT_HF_TOKEN as string;
    billTo = "huggingface";
  }

  const client = new InferenceClient(token);

  const DEFAULT_PROVIDER = PROVIDERS.novita;
  
  // Si le provider est "auto", essayer d'utiliser le provider recommandé du modèle
  let selectedProvider;
  if (provider === "auto") {
    // Utiliser le provider recommandé du modèle
    selectedProvider = PROVIDERS[selectedModel.autoProvider as keyof typeof PROVIDERS];
    
    // Si le provider recommandé n'existe pas, utiliser le premier provider disponible
    if (!selectedProvider && selectedModel.providers.length > 0) {
      const firstProvider = selectedModel.providers[0];
      selectedProvider = PROVIDERS[firstProvider as keyof typeof PROVIDERS];
    }
  } else {
    selectedProvider = PROVIDERS[provider as keyof typeof PROVIDERS];
  }
  
  // Fallback au provider par défaut si aucun provider n'est trouvé
  if (!selectedProvider) {
    selectedProvider = DEFAULT_PROVIDER;
  }

  try {
    const response = await client.chatCompletion(
      {
        model: selectedModel.value,
        provider: selectedProvider.id as any,
        messages: [
          {
            role: "system",
            content: businessId ? 
              `${FOLLOW_UP_SYSTEM_PROMPT}\n\nIMPORTANT: Les modifications doivent être en français et garder la cohérence avec le site existant.` :
              FOLLOW_UP_SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: previousPrompt
              ? previousPrompt
              : "You are modifying the HTML file based on the user's request.",
          },
          {
            role: "assistant",

            content: `The current code is: \n\`\`\`html\n${html}\n\`\`\` ${
              selectedElementHtml
                ? `\n\nYou have to update ONLY the following element, NOTHING ELSE: \n\n\`\`\`html\n${selectedElementHtml}\n\`\`\``
                : ""
            }`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        ...(selectedProvider.id !== "sambanova"
          ? {
              max_tokens: selectedProvider.max_tokens,
            }
          : {}),
      },
      billTo ? { billTo } : {}
    );

    const chunk = response.choices[0]?.message?.content;
    if (!chunk) {
      return NextResponse.json(
        { ok: false, message: "No content returned from the model" },
        { status: 400 }
      );
    }

    if (chunk) {
      const updatedLines: number[][] = [];
      let newHtml = html;
      let position = 0;
      let moreBlocks = true;

      while (moreBlocks) {
        const searchStartIndex = chunk.indexOf(SEARCH_START, position);
        if (searchStartIndex === -1) {
          moreBlocks = false;
          continue;
        }

        const dividerIndex = chunk.indexOf(DIVIDER, searchStartIndex);
        if (dividerIndex === -1) {
          moreBlocks = false;
          continue;
        }

        const replaceEndIndex = chunk.indexOf(REPLACE_END, dividerIndex);
        if (replaceEndIndex === -1) {
          moreBlocks = false;
          continue;
        }

        const searchBlock = chunk.substring(
          searchStartIndex + SEARCH_START.length,
          dividerIndex
        );
        const replaceBlock = chunk.substring(
          dividerIndex + DIVIDER.length,
          replaceEndIndex
        );

        if (searchBlock.trim() === "") {
          newHtml = `${replaceBlock}\n${newHtml}`;
          updatedLines.push([1, replaceBlock.split("\n").length]);
        } else {
          const blockPosition = newHtml.indexOf(searchBlock);
          if (blockPosition !== -1) {
            const beforeText = newHtml.substring(0, blockPosition);
            const startLineNumber = beforeText.split("\n").length;
            const replaceLines = replaceBlock.split("\n").length;
            const endLineNumber = startLineNumber + replaceLines - 1;

            updatedLines.push([startLineNumber, endLineNumber]);
            newHtml = newHtml.replace(searchBlock, replaceBlock);
          }
        }

        position = replaceEndIndex + REPLACE_END.length;
      }

      return NextResponse.json({
        ok: true,
        html: newHtml,
        updatedLines,
      });
    } else {
      return NextResponse.json(
        { ok: false, message: "No content returned from the model" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    if (error.message?.includes("exceeded your monthly included credits")) {
      return NextResponse.json(
        {
          ok: false,
          openProModal: true,
          message: error.message,
        },
        { status: 402 }
      );
    }
    return NextResponse.json(
      {
        ok: false,
        openSelectProvider: true,
        message:
          error.message || "An error occurred while processing your request.",
      },
      { status: 500 }
    );
  }
}
