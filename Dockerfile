# Dockerfile optimisé pour Ezia sur VPS avec Dokploy
FROM node:20-alpine AS builder

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install --frozen-lockfile || npm install

# Copy source code
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_ENV_VALIDATION 1

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Add non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Install only production dependencies
COPY package*.json ./
RUN npm install --production && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tailwind.config.ts ./

# Create necessary directories
RUN mkdir -p .next/cache && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port
EXPOSE 3000

# Environment variables
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["npm", "start"]