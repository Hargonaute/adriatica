import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Old catalogue URL (may be shared in emails / indexed) → current catalogue.
  // Temporary (307) so browsers don't cache it when the next catalogue ships.
  async redirects() {
    return [
      {
        source: '/Adriatica%20Final%20Catalogue.pdf',
        destination: '/catalogue-adriatica-2026.pdf',
        permanent: false,
      },
    ];
  },
  // Keep the admin UI, the /login alias and the API out of search engines
  // (A10). Applies to every response on these paths.
  async headers() {
    const noindex = [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      { source: '/dashboard', headers: noindex },
      { source: '/dashboard/:path*', headers: noindex },
      { source: '/login', headers: noindex },
      { source: '/api/:path*', headers: noindex },
    ];
  },
  images: {
    // Dev only: on IPv6/NAT64 networks the Blob host resolves to 64:ff9b::/96,
    // which Next treats as a private IP and refuses to optimise ("url" parameter
    // is not allowed). Production builds keep the default SSRF protection.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
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
