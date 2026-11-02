import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

// /robots.txt — at the app root (outside [locale]) so it is not captured by
// the locale route.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
