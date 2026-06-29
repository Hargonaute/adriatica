import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Allow images hosted on Vercel Blob and common CDN domains.
    // Add your own domains here as needed.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
