import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';
import { LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/config';

// Dashboard sub-paths that are publicly accessible (no auth required).
// Only the login page itself is public; everything else under /dashboard
// requires an authenticated session.
const DASHBOARD_PUBLIC = ['/dashboard/login'];

// Mutating API routes that require authentication
const PROTECTED_API_PATHS: string[] = [
  '/api/pages',
  '/api/upload',
  '/api/image-upload',
  '/api/assets',
  '/api/collections',
  '/api/entries',
  '/api/fields',
  '/api/admin',
  '/api/import',
];

// Public exceptions — mutating endpoints that must remain unauthenticated.
// /api/entries/create is no longer public: it requires a dashboard session.
const PUBLIC_API_PATHS: string[] = [];

/**
 * Vercel Blob's upload-completed callback to /api/upload carries no session
 * cookie. Let it reach the route, which rejects it unless the
 * x-vercel-signature matches (handleUpload verifies it with the Blob token).
 */
function isBlobUploadCallback(request: NextRequest): boolean {
  return request.nextUrl.pathname === '/api/upload' && request.headers.has('x-vercel-signature');
}

// Paths that never need locale prefixing.
const LOCALE_RESERVED_PREFIXES = ['/api', '/dashboard', '/login', '/_next', '/favicon'];
const LOCALE_RESERVED_FILE_RE = /\.[a-z0-9]+$/i;

function isDashboardProtected(pathname: string): boolean {
  if (!pathname.startsWith('/dashboard')) return false;
  return !DASHBOARD_PUBLIC.some((p) => pathname.startsWith(p));
}

function isProtectedApiPath(pathname: string, method: string): boolean {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutatingMethods.includes(method)) return false;
  if (PUBLIC_API_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return false;
  }
  return PROTECTED_API_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Fast optimistic auth check using Better Auth's session cookie — presence
 * only, so it is NOT sufficient on its own. Full validation (signature,
 * expiry, DB lookup) happens in every route handler and in the dashboard
 * layout via requireSession() / getValidSession() (src/lib/auth/require-session.ts).
 */
function isAuthenticated(request: NextRequest): boolean {
  const cookie = getSessionCookie(request);
  return !!cookie;
}

function pathHasLocale(pathname: string): boolean {
  return LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
}

function isLocaleReserved(pathname: string): boolean {
  if (pathname === '/') return true;
  if (LOCALE_RESERVED_FILE_RE.test(pathname)) return true;
  return LOCALE_RESERVED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const requiresAuth =
    isDashboardProtected(pathname) ||
    (process.env.NODE_ENV === 'production' && isProtectedApiPath(pathname, method));

  if (requiresAuth && !isAuthenticated(request) && !isBlobUploadCallback(request)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Locale prefix redirect: any public path that isn't reserved and lacks a
  // locale prefix is redirected to the default locale (/fr).
  if (!isLocaleReserved(pathname) && !pathHasLocale(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${DEFAULT_LOCALE}${pathname}`;
    return NextResponse.redirect(url);
  }

  // Let the dashboard layout know which page is rendered (it skips its
  // session redirect on the login page). Always overwritten here, so a
  // client-supplied x-pathname header is never trusted.
  if (pathname.startsWith('/dashboard')) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-pathname', pathname);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Auth-gated dashboard and API routes.
    '/dashboard/:path*',
    '/api/pages/:path*',
    '/api/upload',
    '/api/image-upload',
    '/api/assets/:path*',
    '/api/collections/:path*',
    '/api/entries',
    '/api/entries/:path*',
    '/api/fields/:path*',
    '/api/admin/:path*',
    '/api/import/:path*',
    // Public site routes: match everything that isn't a reserved system path
    // so the locale-prefix redirect can fire when needed.
    '/((?!api|_next|dashboard|login|.*\\..*).*)',
  ],
};
