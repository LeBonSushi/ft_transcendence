import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'your-domain.com',
      },
    ],
  },
};

export default nextConfig;
