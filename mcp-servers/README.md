# MCP Servers for Ezia AI

This directory contains MCP (Model Context Protocol) servers that extend Ezia AI's capabilities.

## Social Media MCP Server

The social media MCP server enables automated posting and analytics for social platforms.

### Installation

1. **Install MCP SDK in the main project** (when ready to use MCP):
```bash
pnpm add @modelcontextprotocol/sdk
```

2. **Build the MCP server**:
```bash
cd mcp-servers/social-media
npm install
npm run build
```

3. **Configure environment variables** in `.env`:
```env
# Social Media API Keys
TWITTER_CONSUMER_KEY=xxx
TWITTER_CONSUMER_SECRET=xxx
LINKEDIN_CLIENT_ID=xxx
LINKEDIN_CLIENT_SECRET=xxx
FACEBOOK_APP_ID=xxx
FACEBOOK_APP_SECRET=xxx
```

4. **Enable MCP in the client**:
- Remove the mock implementation in `/lib/mcp/social-media-client.ts`
- Uncomment the actual MCP imports and implementation

### Current Status

⚠️ **MCP is currently disabled** to avoid build errors. The social media features are mocked until:
1. The MCP SDK is added to package.json
2. The MCP server is properly deployed
3. OAuth apps are configured for each platform

### Architecture

```
mcp-servers/
└── social-media/
    ├── src/
    │   ├── index.ts          # MCP server entry point
    │   ├── platforms/        # Platform-specific clients
    │   └── utils/            # Shared utilities
    ├── package.json
    └── README.md
```

### Features

When enabled, the MCP server provides:
- Multi-platform posting (Twitter, LinkedIn, Facebook, Instagram)
- OAuth authentication flows
- Content formatting and optimization
- Analytics retrieval
- Secure token storage

See `/mcp-servers/social-media/README.md` for detailed documentation.