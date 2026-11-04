import { SITE_URL } from '@/lib/site';

// /robots.txt — at the app root (outside [locale]) so it is not captured by
// the locale route. A route handler instead of app/robots.ts so the file is
// exactly the text of the client spec (A1); the metadata helper writes
// "User-Agent" instead of "User-agent".
export const dynamic = 'force-static';

const ROBOTS_TXT = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api

Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET() {
  return new Response(ROBOTS_TXT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
