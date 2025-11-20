import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // API calls will be handled by Nginx reverse proxy
  // Client calls /api/* → Nginx routes to backend services
};

export default nextConfig;
