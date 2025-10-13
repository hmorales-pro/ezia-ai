import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone', // Activé pour Docker/Dokploy

  // Expose environment variables explicitly for standalone mode
  env: {
    BREVO_API_KEY: process.env.BREVO_API_KEY,
    BREVO_SENDER_EMAIL: process.env.BREVO_SENDER_EMAIL,
    ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL,
  },

  // Configuration pour Dokploy et CORS
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
          {
            key: 'X-Forwarded-Proto',
            value: 'https',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
  
  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
    ];
  },
  
  // Rewrites pour servir les images via l'API (toujours actif pour Dokploy)
  async rewrites() {
    return [
      {
        source: '/img/:path*',
        destination: '/api/images/img/:path*',
      },
      {
        source: '/logo.png',
        destination: '/api/images/logo.png',
      },
      {
        source: '/favicon.ico',
        destination: '/api/images/favicon.ico',
      },
      {
        source: '/favicon-16x16.png',
        destination: '/api/images/favicon-16x16.png',
      },
      {
        source: '/favicon-32x32.png',
        destination: '/api/images/favicon-32x32.png',
      },
      {
        source: '/apple-touch-icon.png',
        destination: '/api/images/apple-touch-icon.png',
      },
    ];
  },
  
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // Enable compression for better performance
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Performance optimizations
  reactStrictMode: true,
  
  // Désactiver l'indicateur de développement
  devIndicators: {
    position: 'bottom-right',
  },
  images: {
    domains: ["localhost", "ezia.ai"],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true, // Pour Dokploy - désactive l'optimisation d'images
  },
  
  // Turbopack configuration (Turbopack is now stable in Next.js 15)
  turbopack: {
    resolveAlias: {
      // Resolve any module issues
    },
  },
  
  // Optimize specific packages
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Ensure proper module resolution
  transpilePackages: ['@mistralai/mistralai'],
  webpack(config, options) {
    const { isServer } = options;
    
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve("url-loader"),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve("file-loader"),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? "../" : ""}static/images/`,
            name: "[name]-[hash].[ext]",
            esModule: config.esModule || false,
          },
        },
      ],
    });

    // Suppress specific warnings
    config.ignoreWarnings = [
      { module: /node_modules/ },
      (warning: any) => warning.message && warning.message.includes('clientModules'),
      (warning: any) => warning.message && warning.message.includes('entryCSSFiles'),
      (warning: any) => warning.message && warning.message.includes('findSourceMapURL'),
    ];

    return config;
  },
};

export default nextConfig;
