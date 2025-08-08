# Dokploy Deployment Guide

## Option 1: Using Pre-built Docker Image (Recommended)

Since Dokploy may have resource constraints during build, we recommend using a pre-built Docker image.

### Steps:

1. **Build the image locally** (on your development machine):
   ```bash
   ./scripts/build-and-push.sh
   ```
   
   You'll need:
   - Docker installed locally
   - GitHub Personal Access Token with `write:packages` permission
   - Login when prompted with your GitHub username and token

2. **In Dokploy**, use the `docker-compose.dokploy.yml` file which references the pre-built image:
   - Set your Compose Path to: `docker-compose.dokploy.yml`
   - This avoids building and uses the image from GitHub Container Registry

3. **Configure environment variables** in Dokploy:
   ```
   MONGODB_URI=your-mongodb-uri
   HF_TOKEN=your-huggingface-token
   MISTRAL_API_KEY=your-mistral-api-key
   JWT_SECRET=your-jwt-secret
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXT_PUBLIC_APP_URL=https://ezia.ai
   DEFAULT_HF_TOKEN=your-default-hf-token
   NEXT_APP_API_URL=your-api-url
   ```

## Option 2: Application Mode (Instead of Compose)

If Compose mode continues to fail, try Application mode in Dokploy:

1. Switch to "Application" deployment type
2. Use this simplified Dockerfile:
   ```dockerfile
   FROM ghcr.io/hmorales-pro/ezia-ai:latest
   ```
3. Set port to 3000
4. Configure the same environment variables

## Option 3: Build with More Resources

If you want to build in Dokploy:

1. Use `Dockerfile.fast` which has memory optimizations
2. Consider scaling up your Dokploy server temporarily during build
3. Monitor the build logs for specific failure points

## Troubleshooting

### Build Hangs
- The Next.js build requires significant memory
- Try Option 1 (pre-built image) instead

### "Service not found" errors
- Ensure service name is `ezia` in docker-compose
- Check that Dokploy is reading the correct compose file

### Missing .next folder
- The .next folder is created during build
- Cannot use Dockerfile.simple without first building locally