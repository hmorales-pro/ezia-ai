import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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
  },
  
  // Turbopack configuration (Turbopack is now stable in Next.js 15)
  turbopack: {
    resolveAlias: {
      // Resolve any module issues
    },
  },
  
  // Optimize specific packages
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-tabs",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-avatar",
      "@radix-ui/react-badge",
      "date-fns",
      "@tanstack/react-query",
      "react-markdown",
      "sonner",
    ],
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
    
    // Optimize bundle splitting for better performance
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          maxAsyncRequests: 30,
          maxInitialRequests: 30,
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common components chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'async',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // Separate heavy libraries
            lucide: {
              test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
              name: 'lucide-icons',
              priority: 30,
              chunks: 'all',
            },
            radixui: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              priority: 30,
              chunks: 'all',
            },
            monaco: {
              test: /[\\/]node_modules[\\/]@monaco-editor[\\/]/,
              name: 'monaco-editor',
              priority: 40,
              chunks: 'all',
            },
          },
        },
      };
    }
    
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
