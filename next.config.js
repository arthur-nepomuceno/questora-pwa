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
    
    // Configuração para Firebase
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    // Ignorar módulos problemáticos do Firebase
    config.externals = config.externals || [];
    config.externals.push({
      'undici': 'commonjs undici'
    });
    
    return config;
  }
};

module.exports = nextConfig;
