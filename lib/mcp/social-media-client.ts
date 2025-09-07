import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';

export interface PostResult {
  platform: string;
  success: boolean;
  id?: string;
  url?: string;
  error?: string;
}

export interface AnalyticsResult {
  platform: string;
  period: {
    start: string;
    end: string;
  };
  metrics: {
    posts?: number;
    impressions?: number;
    engagements?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    engagementRate?: string;
  };
  topPosts?: any[];
}

class SocialMediaMCPClient {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private serverPath: string;

  constructor() {
    // Path to the MCP server
    this.serverPath = path.join(process.cwd(), 'mcp-servers', 'social-media', 'dist', 'index.js');
  }

  async connect(): Promise<void> {
    if (this.client) {
      return; // Already connected
    }

    try {
      // Spawn the MCP server process
      const serverProcess = spawn('node', [this.serverPath], {
        env: {
          ...process.env,
          // Ensure the server has access to env variables
        },
      });

      this.transport = new StdioClientTransport({
        command: 'node',
        args: [this.serverPath],
      });

      this.client = new Client(
        {
          name: 'social-media-client',
          version: '1.0.0',
        },
        {
          capabilities: {},
        }
      );

      await this.client.connect(this.transport);
      console.log('Connected to Social Media MCP server');
    } catch (error) {
      console.error('Failed to connect to MCP server:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
    }
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (!this.client) {
      await this.connect();
    }
  }

  async post(
    content: string,
    platforms: string[],
    businessId: string,
    mediaUrls?: string[]
  ): Promise<PostResult[]> {
    await this.ensureConnected();

    try {
      const result = await this.client!.callTool('social_post', {
        content,
        platforms,
        businessId,
        mediaUrls,
      });

      const response = JSON.parse(result.content[0].text);
      return response.results || [];
    } catch (error) {
      console.error('MCP post error:', error);
      return platforms.map(platform => ({
        platform,
        success: false,
        error: error.message,
      }));
    }
  }

  async getAuthUrl(
    platform: string,
    businessId: string,
    redirectUri: string
  ): Promise<string> {
    await this.ensureConnected();

    try {
      const result = await this.client!.callTool('social_connect', {
        platform,
        businessId,
        redirectUri,
      });

      const response = JSON.parse(result.content[0].text);
      return response.authUrl;
    } catch (error) {
      console.error('MCP auth URL error:', error);
      throw error;
    }
  }

  async disconnect(platform: string, businessId: string): Promise<void> {
    await this.ensureConnected();

    try {
      await this.client!.callTool('social_disconnect', {
        platform,
        businessId,
      });
    } catch (error) {
      console.error('MCP disconnect error:', error);
      throw error;
    }
  }

  async getAnalytics(
    platform: string,
    businessId: string,
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsResult> {
    await this.ensureConnected();

    try {
      const result = await this.client!.callTool('social_analytics', {
        platform,
        businessId,
        startDate,
        endDate,
      });

      return JSON.parse(result.content[0].text);
    } catch (error) {
      console.error('MCP analytics error:', error);
      throw error;
    }
  }

  async formatContent(
    content: string,
    platform: string,
    options?: {
      addHashtags?: boolean;
      shortenLinks?: boolean;
      addEmojis?: boolean;
    }
  ): Promise<string> {
    await this.ensureConnected();

    try {
      const result = await this.client!.callTool('format_content', {
        content,
        platform,
        options,
      });

      return result.content[0].text;
    } catch (error) {
      console.error('MCP format content error:', error);
      return content; // Return original content on error
    }
  }

  async listConnectedAccounts(): Promise<any[]> {
    await this.ensureConnected();

    try {
      const result = await this.client!.listResources();
      return result.resources || [];
    } catch (error) {
      console.error('MCP list resources error:', error);
      return [];
    }
  }
}

// Export singleton instance
export const socialMediaMCP = new SocialMediaMCPClient();

// Helper function for API routes
export async function withMCPClient<T>(
  operation: (client: SocialMediaMCPClient) => Promise<T>
): Promise<T> {
  try {
    await socialMediaMCP.connect();
    return await operation(socialMediaMCP);
  } finally {
    // Keep connection alive for subsequent requests
    // await socialMediaMCP.disconnect();
  }
}