# Ezia Social Media MCP Server

This MCP (Model Context Protocol) server enables Ezia AI to interact with social media platforms for automated posting, analytics, and account management.

## Features

- 🔗 **Multi-Platform Support**: Twitter/X, LinkedIn, Facebook, Instagram
- 📝 **Content Publishing**: Post content to connected social media accounts
- 📊 **Analytics**: Retrieve engagement metrics and performance data
- 🔒 **Secure Token Storage**: Encrypted storage of OAuth tokens
- ✨ **Content Formatting**: Platform-specific content optimization
- 🔄 **OAuth Integration**: Handle authentication flows for each platform

## Installation

1. Install dependencies:
```bash
cd mcp-servers/social-media
npm install
```

2. Build the server:
```bash
npm run build
```

3. Configure environment variables in `.env`:
```env
# Encryption
MCP_ENCRYPTION_KEY=your-secure-encryption-key

# Twitter/X
TWITTER_CONSUMER_KEY=your-twitter-key
TWITTER_CONSUMER_SECRET=your-twitter-secret
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/twitter/callback

# LinkedIn
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/auth/linkedin/callback

# Facebook (also for Instagram)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/api/auth/facebook/callback
```

## Adding to Claude Code

Add the server to Claude Code:

```bash
claude mcp add social-media -- node /path/to/ezia36/mcp-servers/social-media/dist/index.js
```

Or for development:
```bash
claude mcp add social-media -- npx tsx /path/to/ezia36/mcp-servers/social-media/src/index.ts
```

## Available Tools

### `social_post`
Post content to social media platforms.

Example:
```json
{
  "content": "Excited to announce our new product launch! 🚀",
  "platforms": ["twitter", "linkedin"],
  "businessId": "business-123",
  "mediaUrls": ["https://example.com/image.jpg"]
}
```

### `social_connect`
Get OAuth URL for connecting a social media account.

Example:
```json
{
  "platform": "twitter",
  "businessId": "business-123",
  "redirectUri": "https://app.ezia.ai/callback"
}
```

### `social_disconnect`
Disconnect a social media account.

Example:
```json
{
  "platform": "twitter",
  "businessId": "business-123"
}
```

### `social_analytics`
Get analytics for social media posts.

Example:
```json
{
  "platform": "twitter",
  "businessId": "business-123",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

### `format_content`
Format content for specific platforms.

Example:
```json
{
  "content": "Check out our latest blog post about AI trends",
  "platform": "twitter",
  "options": {
    "addHashtags": true,
    "addEmojis": true
  }
}
```

## Resources

The server exposes connected accounts as resources:
- URI format: `social://[platform]/[businessId]`
- Example: `social://twitter/business-123`

## Security

- OAuth tokens are encrypted using AES-256-GCM
- Tokens are stored in `~/.ezia/social-tokens.json`
- Each business has isolated token storage
- Refresh tokens are handled automatically when available

## Development

Run in development mode:
```bash
npm run dev
```

## Platform-Specific Notes

### Twitter/X
- Uses OAuth 1.0a for authentication
- Supports media uploads (images, videos)
- Rate limits apply based on API tier

### LinkedIn
- Uses OAuth 2.0
- Limited analytics for personal profiles
- Full analytics require Organization access

### Facebook/Instagram
- Instagram is managed through Facebook Graph API
- Requires Facebook Page for business accounts
- Media uploads supported for both platforms

## Troubleshooting

1. **Authentication Errors**: Check that all API credentials are correctly set in environment variables
2. **Token Storage**: Ensure `~/.ezia` directory has write permissions
3. **Rate Limits**: Implement proper error handling for platform rate limits

## Future Improvements

- [ ] Implement media upload functionality
- [ ] Add support for scheduled posts
- [ ] Implement token refresh mechanisms
- [ ] Add more platforms (TikTok, Pinterest, etc.)
- [ ] Batch posting capabilities
- [ ] Advanced analytics with visualizations