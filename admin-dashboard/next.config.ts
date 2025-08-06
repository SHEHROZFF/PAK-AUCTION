import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output configuration for static hosting
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  
  // Image configuration for production
  images: {
    unoptimized: true, // Required for static export
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pak-auc-back.com.phpnode.net',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow all HTTPS images for production flexibility
      },
    ],
  },
  
  // Asset prefix for CDN or subdirectory deployment
  // assetPrefix: process.env.NODE_ENV === 'production' ? '/admin' : '',
  
  // Base path if deploying to subdirectory
  // basePath: process.env.NODE_ENV === 'production' ? '/admin' : '',
};

export default nextConfig;
