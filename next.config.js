/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  experimental: {
    esmExternals: false,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Desabilitar completamente o cache incremental
      config.cache = false;
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/.git/**',
          '**/coverage/**',
          '**/dist/**',
          '**/build/**',
          '**/*.tsbuildinfo'
        ],
        poll: false,
        aggregateTimeout: 300,
      };
    }
    return config;
  }
};

module.exports = nextConfig;
