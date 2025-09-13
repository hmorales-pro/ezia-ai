import { generateWithMistralAPI } from "@/lib/mistral-ai-service";

export interface AIAgentConfig {
  name: string;
  role: string;
  capabilities?: string[];
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerationOptions {
  prompt: string;
  context?: Record<string, any>;
  formatJson?: boolean;
  maxRetries?: number;
}

export abstract class AIBaseAgent {
  protected name: string;
  protected role: string;
  protected capabilities: string[];
  protected systemPrompt: string;
  protected temperature: number;
  protected maxTokens: number;

  constructor(config: AIAgentConfig) {
    this.name = config.name;
    this.role = config.role;
    this.capabilities = config.capabilities || [];
    this.systemPrompt = config.systemPrompt || this.getDefaultSystemPrompt();
    this.temperature = config.temperature || 0.3;
    this.maxTokens = config.maxTokens || 4000;
  }

  getName(): string {
    return this.name;
  }

  getRole(): string {
    return this.role;
  }

  getCapabilities(): string[] {
    return this.capabilities;
  }

  protected log(message: string): void {
    console.log(`[${this.name}]: ${message}`);
  }

  /**
   * Generate content using Mistral AI
   */
  protected async generateWithAI(options: AIGenerationOptions): Promise<string> {
    const { prompt, context, formatJson = false, maxRetries = 3 } = options;
    
    // Build enhanced prompt with context
    let enhancedPrompt = prompt;
    if (context) {
      enhancedPrompt = `Context:\n${JSON.stringify(context, null, 2)}\n\n${prompt}`;
    }

    // Add JSON formatting instruction if needed
    if (formatJson) {
      enhancedPrompt += "\n\nIMPORTANT: Respond with valid JSON only. No markdown, no explanations, just the JSON object.";
    }

    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.log(`Generating AI response (attempt ${attempt}/${maxRetries})...`);
        
        const response = await generateWithMistralAPI(
          enhancedPrompt,
          this.systemPrompt,
          process.env.MISTRAL_API_KEY
        );

        if (!response.success) {
          throw new Error(response.error || "AI generation failed");
        }

        if (!response.content) {
          throw new Error("No content generated");
        }

        // If JSON format is requested, validate it
        if (formatJson) {
          try {
            // Clean the response (remove markdown if present)
            let cleanedContent = response.content.trim();
            
            // Remove markdown code blocks if present
            cleanedContent = cleanedContent.replace(/```json\s*/g, '');
            cleanedContent = cleanedContent.replace(/```\s*/g, '');
            
            // Parse to validate JSON
            JSON.parse(cleanedContent);
            return cleanedContent;
          } catch (jsonError) {
            this.log(`JSON parsing failed, attempting to extract JSON from response...`);
            
            // Try to extract JSON from the response
            const jsonMatch = response.content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const extractedJson = jsonMatch[0];
              try {
                JSON.parse(extractedJson);
                return extractedJson;
              } catch {
                throw new Error("Generated content is not valid JSON");
              }
            }
            throw new Error("Could not extract valid JSON from response");
          }
        }

        return response.content;
      } catch (error) {
        lastError = error as Error;
        this.log(`Generation attempt ${attempt} failed: ${lastError.message}`);
        
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    // If all retries failed, throw the last error
    throw lastError || new Error("AI generation failed after all retries");
  }

  /**
   * Parse AI-generated content safely
   */
  protected parseAIJson<T>(content: string, defaultValue: T): T {
    try {
      // Clean the content
      let cleaned = content.trim();
      
      // Remove markdown code blocks if present
      cleaned = cleaned.replace(/```json\s*/g, '');
      cleaned = cleaned.replace(/```\s*/g, '');
      
      // Try to extract JSON if it's embedded in text
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleaned = jsonMatch[0];
      }
      
      return JSON.parse(cleaned);
    } catch (error) {
      this.log(`Failed to parse AI JSON response: ${error}`);
      return defaultValue;
    }
  }

  /**
   * Get default system prompt for the agent
   * Override this in subclasses to provide specific prompts
   */
  protected abstract getDefaultSystemPrompt(): string;

  /**
   * Validate AI-generated content
   * Override this in subclasses to add specific validation
   */
  protected validateContent(content: any): boolean {
    return content !== null && content !== undefined;
  }

  /**
   * Clean and format AI output
   */
  protected cleanAIOutput(content: string): string {
    // Remove any system messages or metadata
    let cleaned = content.trim();
    
    // Remove common AI artifacts
    cleaned = cleaned.replace(/^(Here's|Here is|I've created|I've generated|Let me create)[\s\S]*?:\s*/i, '');
    cleaned = cleaned.replace(/^(Sure|Certainly|Of course|I'll help)[\s\S]*?:\s*/i, '');
    
    return cleaned;
  }

  /**
   * Generate content with fallback to template if AI fails
   */
  protected async generateWithFallback<T>(
    aiOptions: AIGenerationOptions,
    templateGenerator: () => T,
    parser?: (content: string) => T
  ): Promise<T> {
    try {
      const content = await this.generateWithAI(aiOptions);
      
      if (parser) {
        return parser(content);
      }
      
      // If no parser provided, assume the content is the result
      return content as unknown as T;
    } catch (error) {
      this.log(`AI generation failed, using template fallback: ${error}`);
      return templateGenerator();
    }
  }
}