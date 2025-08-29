import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Désactiver complètement les vérifications pour accélérer le build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Optimisations pour réduire la mémoire
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  
  // Désactiver les features non essentielles
  reactStrictMode: false,
  
  // Réduire le nombre de workers
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  
  // Configuration webpack minimale
  webpack: (config, { isServer }) => {
    // Désactiver les source maps en production
    if (!isServer) {
      config.devtool = false;
    }
    
    // Optimisations webpack
    config.optimization = {
      ...config.optimization,
      minimize: true,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
    };
    
    return config;
  },
};

export default nextConfig;