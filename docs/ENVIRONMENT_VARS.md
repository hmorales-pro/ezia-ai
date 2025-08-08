# Environment Variables Configuration

This document lists all the environment variables required for Ezia vBeta to function properly.

## Required Variables

### OAuth Configuration (HuggingFace)
```env
OAUTH_CLIENT_ID=your_huggingface_oauth_client_id
OAUTH_CLIENT_SECRET=your_huggingface_oauth_client_secret
```

**Important**: These must match the OAuth app configuration on HuggingFace:
- Redirect URI: `https://hmorales-ezia.hf.space/auth/callback`
- App URL: `https://hmorales-ezia.hf.space`

### Database Configuration
```env
MONGODB_URI=mongodb+srv://example-user:example-password@example-cluster.mongodb.net/example-db
```

### API Configuration
```env
NEXT_APP_API_URL=https://api.deepsite.com  # External API URL if needed
NEXTAUTH_URL=https://hmorales-ezia.hf.space  # Your app URL
```

### HuggingFace Tokens
```env
HF_TOKEN=hf_your_token_here  # Your personal HuggingFace token
DEFAULT_HF_TOKEN=hf_default_token  # Fallback token for anonymous users
```

## Optional Variables

### Development
```env
NODE_ENV=development  # Set to 'production' in production
```

## Setting up OAuth on HuggingFace

1. Go to https://huggingface.co/settings/applications
2. Create a new OAuth application
3. Set the following:
   - App name: Ezia vBeta
   - Homepage URL: `https://hmorales-ezia.hf.space`
   - Redirect URI: `https://hmorales-ezia.hf.space/auth/callback`
   - Scopes: `openid profile write-repos manage-repos inference-api`
4. Copy the Client ID and Client Secret to your environment variables

## HuggingFace Space Configuration

In your HuggingFace Space settings, add the following secrets:
- `OAUTH_CLIENT_ID`
- `OAUTH_CLIENT_SECRET`
- `MONGODB_URI`
- `HF_TOKEN`
- `DEFAULT_HF_TOKEN`