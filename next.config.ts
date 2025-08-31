import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // output: 'standalone', // Désactivé pour compatibilité
  
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
        ],
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
  // Expose environment variables to server-side code
  env: {
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
  },
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
