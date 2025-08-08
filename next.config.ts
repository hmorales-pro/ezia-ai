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
  // Turbopack configuration (Turbopack is now stable in Next.js 15)
  turbopack: {
    resolveAlias: {
      // Resolve any module issues
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
