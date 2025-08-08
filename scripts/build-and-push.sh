#!/bin/bash
# Script pour construire et pousser l'image Docker

# Configuration
REGISTRY="ghcr.io"
USERNAME="hmorales-pro"
IMAGE_NAME="ezia-ai"
TAG="latest"

echo "🔨 Building Docker image locally..."
docker build -t ${IMAGE_NAME}:${TAG} .

echo "🏷️ Tagging image..."
docker tag ${IMAGE_NAME}:${TAG} ${REGISTRY}/${USERNAME}/${IMAGE_NAME}:${TAG}

echo "🔐 Login to GitHub Container Registry..."
echo "Use your GitHub Personal Access Token as password"
docker login ${REGISTRY} -u ${USERNAME}

echo "📤 Pushing image..."
docker push ${REGISTRY}/${USERNAME}/${IMAGE_NAME}:${TAG}

echo "✅ Done! Image available at: ${REGISTRY}/${USERNAME}/${IMAGE_NAME}:${TAG}"

# Create docker-compose for Dokploy
cat > docker-compose-ghcr.yml << EOF
services:
  ezia:
    image: ${REGISTRY}/${USERNAME}/${IMAGE_NAME}:${TAG}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=\${MONGODB_URI}
      - HF_TOKEN=\${HF_TOKEN}
      - MISTRAL_API_KEY=\${MISTRAL_API_KEY}
      - JWT_SECRET=\${JWT_SECRET}
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_APP_URL=\${NEXT_PUBLIC_APP_URL:-https://ezia.ai}
    restart: unless-stopped
EOF

echo "📄 Created docker-compose-ghcr.yml for Dokploy"