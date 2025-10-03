interface LLMConfig {
  provider: 'openai' | 'mistral';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface StreamingLLMResponse {
  type: 'content' | 'event' | 'error' | 'complete';
  data?: any;
  error?: string;
}

export class StreamingLLMClient {
  private config: LLMConfig;
  private controller: AbortController | null = null;

  constructor(config: LLMConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 4000,
      ...config
    };
  }

  // Generate streaming response with SSE events
  async *generateStreamingResponse(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      formatJson?: boolean;
      structuredOutput?: boolean;
    }
  ): AsyncGenerator<StreamingLLMResponse, void, unknown> {
    this.controller = new AbortController();

    try {
      const messages: LLMMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      if (this.config.provider === 'mistral') {
        yield* this.generateMistralStreaming(messages, options);
      } else {
        yield* this.generateOpenAIStreaming(messages, options);
      }
    } catch (error) {
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.controller = null;
    }
  }

  private async *generateMistralStreaming(
    messages: LLMMessage[],
    options?: { formatJson?: boolean; structuredOutput?: boolean; }
  ): AsyncGenerator<StreamingLLMResponse, void, unknown> {
    const response = await fetch(`${this.config.baseUrl || 'https://api.mistral.ai'}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
        ...(options?.formatJson && { response_format: { type: 'json_object' } })
      }),
      signal: this.controller?.signal
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { type: 'complete' };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                yield {
                  type: 'content',
                  data: parsed.choices[0].delta.content
                };
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async *generateOpenAIStreaming(
    messages: LLMMessage[],
    options?: { formatJson?: boolean; structuredOutput?: boolean; }
  ): AsyncGenerator<StreamingLLMResponse, void, unknown> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: true,
        ...(options?.formatJson && { response_format: { type: 'json_object' } })
      }),
      signal: this.controller?.signal
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { type: 'complete' };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.choices && parsed.choices[0]?.delta?.content) {
                yield {
                  type: 'content',
                  data: parsed.choices[0].delta.content
                };
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  // Abort current request
  abort(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = null;
    }
  }

  // Generate complete response (non-streaming)
  async generateCompleteResponse(
    systemPrompt: string,
    userPrompt: string,
    options?: {
      formatJson?: boolean;
      structuredOutput?: boolean;
    }
  ): Promise<string> {
    let fullContent = '';

    for await (const chunk of this.generateStreamingResponse(systemPrompt, userPrompt, options)) {
      if (chunk.type === 'content') {
        fullContent += chunk.data;
      } else if (chunk.type === 'error') {
        throw new Error(chunk.error);
      } else if (chunk.type === 'complete') {
        break;
      }
    }

    return fullContent;
  }
}

// Factory function to create LLM client
export function createLLMClient(config: LLMConfig): StreamingLLMClient {
  return new StreamingLLMClient(config);
}

// Predefined configurations
export const LLM_CONFIGS = {
  mistral: {
    provider: 'mistral' as const,
    model: 'mistral-large-latest',
    baseUrl: 'https://api.mistral.ai'
  },
  openai: {
    provider: 'openai' as const,
    model: 'gpt-4'
  }
} as const;
