import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  async rewrites() {
    return {
      // These are handled by local Next.js API routes (need to set cookies properly)
      beforeFiles: [],
      // Everything else proxies to the backend
      afterFiles: [
        {
          source: '/api/:path*',
          destination: 'https://api-13-204-42-87.nip.io/api/:path*',
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
