import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { TwitterClient } from './platforms/twitter.js';
import { LinkedInClient } from './platforms/linkedin.js';
import { FacebookClient } from './platforms/facebook.js';
import { InstagramClient } from './platforms/instagram.js';
import { TokenStore } from './utils/token-store.js';
import { ContentFormatter } from './utils/content-formatter.js';

// Load environment variables
dotenv.config();

// Initialize platform clients
const tokenStore = new TokenStore();
const contentFormatter = new ContentFormatter();

const twitterClient = new TwitterClient(tokenStore);
const linkedinClient = new LinkedInClient(tokenStore);
const facebookClient = new FacebookClient(tokenStore);
const instagramClient = new InstagramClient(tokenStore);

// Create MCP server
const server = new Server(
  {
    name: 'social-media-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'social_post',
        description: 'Post content to one or more social media platforms',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'The content to post',
            },
            platforms: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['twitter', 'linkedin', 'facebook', 'instagram'],
              },
              description: 'Platforms to post to',
            },
            mediaUrls: {
              type: 'array',
              items: { type: 'string' },
              description: 'URLs of media files to attach (optional)',
            },
            scheduledTime: {
              type: 'string',
              format: 'date-time',
              description: 'Schedule post for later (optional)',
            },
            businessId: {
              type: 'string',
              description: 'Business ID for token lookup',
            },
          },
          required: ['content', 'platforms', 'businessId'],
        },
      },
      {
        name: 'social_connect',
        description: 'Get OAuth URL to connect a social media account',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['twitter', 'linkedin', 'facebook', 'instagram'],
              description: 'Platform to connect',
            },
            businessId: {
              type: 'string',
              description: 'Business ID for token storage',
            },
            redirectUri: {
              type: 'string',
              description: 'OAuth callback URL',
            },
          },
          required: ['platform', 'businessId', 'redirectUri'],
        },
      },
      {
        name: 'social_disconnect',
        description: 'Disconnect a social media account',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['twitter', 'linkedin', 'facebook', 'instagram'],
              description: 'Platform to disconnect',
            },
            businessId: {
              type: 'string',
              description: 'Business ID',
            },
          },
          required: ['platform', 'businessId'],
        },
      },
      {
        name: 'social_analytics',
        description: 'Get analytics for social media posts',
        inputSchema: {
          type: 'object',
          properties: {
            platform: {
              type: 'string',
              enum: ['twitter', 'linkedin', 'facebook', 'instagram'],
              description: 'Platform to get analytics from',
            },
            businessId: {
              type: 'string',
              description: 'Business ID',
            },
            startDate: {
              type: 'string',
              format: 'date',
              description: 'Start date for analytics',
            },
            endDate: {
              type: 'string',
              format: 'date',
              description: 'End date for analytics',
            },
          },
          required: ['platform', 'businessId'],
        },
      },
      {
        name: 'format_content',
        description: 'Format content for different social media platforms',
        inputSchema: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'Original content to format',
            },
            platform: {
              type: 'string',
              enum: ['twitter', 'linkedin', 'facebook', 'instagram'],
              description: 'Target platform',
            },
            options: {
              type: 'object',
              properties: {
                addHashtags: { type: 'boolean' },
                shortenLinks: { type: 'boolean' },
                addEmojis: { type: 'boolean' },
              },
            },
          },
          required: ['content', 'platform'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'social_post': {
        const { content, platforms, mediaUrls, scheduledTime, businessId } = args as {
          content: string;
          platforms: string[];
          mediaUrls?: string[];
          scheduledTime?: string;
          businessId: string;
        };
        const results = [];

        for (const platform of platforms) {
          let result;
          const formattedContent = await contentFormatter.format(content, platform);

          switch (platform) {
            case 'twitter':
              result = await twitterClient.post(businessId, formattedContent, mediaUrls);
              break;
            case 'linkedin':
              result = await linkedinClient.post(businessId, formattedContent, mediaUrls);
              break;
            case 'facebook':
              result = await facebookClient.post(businessId, formattedContent, mediaUrls);
              break;
            case 'instagram':
              result = await instagramClient.post(businessId, formattedContent, mediaUrls);
              break;
          }

          results.push({
            platform,
            ...result,
          });
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, results }, null, 2),
            },
          ],
        };
      }

      case 'social_connect': {
        const { platform, businessId, redirectUri } = args as {
          platform: string;
          businessId: string;
          redirectUri: string;
        };
        let authUrl;

        switch (platform) {
          case 'twitter':
            authUrl = await twitterClient.getAuthUrl(businessId, redirectUri);
            break;
          case 'linkedin':
            authUrl = await linkedinClient.getAuthUrl(businessId, redirectUri);
            break;
          case 'facebook':
            authUrl = await facebookClient.getAuthUrl(businessId, redirectUri);
            break;
          case 'instagram':
            authUrl = await instagramClient.getAuthUrl(businessId, redirectUri);
            break;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ authUrl }, null, 2),
            },
          ],
        };
      }

      case 'social_disconnect': {
        const { platform, businessId } = args as {
          platform: string;
          businessId: string;
        };
        await tokenStore.removeTokens(businessId, platform);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Disconnected from ${platform}` }),
            },
          ],
        };
      }

      case 'social_analytics': {
        const { platform, businessId, startDate, endDate } = args as {
          platform: string;
          businessId: string;
          startDate?: string;
          endDate?: string;
        };
        let analytics;

        switch (platform) {
          case 'twitter':
            analytics = await twitterClient.getAnalytics(businessId, startDate, endDate);
            break;
          case 'linkedin':
            analytics = await linkedinClient.getAnalytics(businessId, startDate, endDate);
            break;
          case 'facebook':
            analytics = await facebookClient.getAnalytics(businessId, startDate, endDate);
            break;
          case 'instagram':
            analytics = await instagramClient.getAnalytics(businessId, startDate, endDate);
            break;
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(analytics, null, 2),
            },
          ],
        };
      }

      case 'format_content': {
        const { content, platform, options } = args as {
          content: string;
          platform: string;
          options?: {
            addHashtags?: boolean;
            shortenLinks?: boolean;
            addEmojis?: boolean;
          };
        };
        const formatted = await contentFormatter.format(content, platform, options);

        return {
          content: [
            {
              type: 'text',
              text: formatted,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ 
            error: true, 
            message: error instanceof Error ? error.message : String(error),
            platform: args?.platform || 'unknown'
          }, null, 2),
        },
      ],
    };
  }
});

// List resources (connected accounts)
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const connectedAccounts = await tokenStore.listAllConnections();
  
  return {
    resources: connectedAccounts.map(account => ({
      uri: `social://${account.platform}/${account.businessId}`,
      name: `${account.platform} - ${account.username || account.businessId}`,
      description: `Connected ${account.platform} account`,
      mimeType: 'application/json',
    })),
  };
});

// Read resource (account details)
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  const match = uri.match(/^social:\/\/([^\/]+)\/(.+)$/);
  
  if (!match) {
    throw new Error('Invalid resource URI');
  }
  
  const [, platform, businessId] = match;
  const tokens = await tokenStore.getTokens(businessId, platform);
  
  if (!tokens) {
    throw new Error('No connection found');
  }
  
  let accountInfo;
  switch (platform) {
    case 'twitter':
      accountInfo = await twitterClient.getAccountInfo(businessId);
      break;
    case 'linkedin':
      accountInfo = await linkedinClient.getAccountInfo(businessId);
      break;
    case 'facebook':
      accountInfo = await facebookClient.getAccountInfo(businessId);
      break;
    case 'instagram':
      accountInfo = await instagramClient.getAccountInfo(businessId);
      break;
  }
  
  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(accountInfo, null, 2),
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Social Media MCP server started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});