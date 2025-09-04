import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Activer le mode standalone pour HuggingFace Spaces
  output: 'standalone',
  
  // Configuration pour HuggingFace Spaces
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
  
  eslint: {
    // Ignorer les erreurs ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorer les erreurs TypeScript pendant le build
    ignoreBuildErrors: true,
  },
  
  // Optimisations pour HuggingFace Spaces
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Performance
  reactStrictMode: true,
  
  images: {
    domains: ["localhost", "ezia.ai", "huggingface.co"],
    formats: ["image/avif", "image/webp"],
    unoptimized: true, // Désactiver l'optimisation pour HF Spaces
  },
  
  // Configuration expérimentale
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Transpiler les packages nécessaires
  transpilePackages: ['@mistralai/mistralai'],
  
  webpack(config, options) {
    const { isServer } = options;
    
    // Gérer les fichiers audio
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

    // Ignorer certains warnings
    config.ignoreWarnings = [
      { module: /node_modules/ },
      (warning: any) => warning.message && warning.message.includes('clientModules'),
      (warning: any) => warning.message && warning.message.includes('entryCSSFiles'),
      (warning: any) => warning.message && warning.message.includes('findSourceMapURL'),
    ];

    // Optimisations pour réduire la taille du bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    return config;
  },
  
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_HUGGINGFACE_SPACES: 'true',
  },
};

export default nextConfig;