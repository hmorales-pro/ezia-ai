import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Configuration HTTPS pour production
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || '',
  
  // Autoriser les origines pour les ressources _next
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    allowedOrigins: ['https://ezia.ai', 'https://www.ezia.ai'],
  },
  
  // Headers de sécurité pour HTTPS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Permettre l'accès aux ressources statiques
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
  
  images: {
    domains: ["localhost", "ezia.ai"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  transpilePackages: ['@mistralai/mistralai'],
  
  env: {
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  },
};

export default nextConfig;