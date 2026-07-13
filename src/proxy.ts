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
];

// Public exceptions — mutating endpoints that must remain unauthenticated
// (e.g. public form submissions from the live site).
const PUBLIC_API_PATHS: string[] = ['/api/entries/create'];

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
 * Fast optimistic auth check using Better Auth's session cookie.
 * Full session validation (expiry, DB lookup) happens inside individual
 * Server Components via auth.api.getSession({ headers: await headers() }).
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

  if (requiresAuth && !isAuthenticated(request)) {
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
    // Public site routes: match everything that isn't a reserved system path
    // so the locale-prefix redirect can fire when needed.
    '/((?!api|_next|dashboard|login|.*\\..*).*)',
  ],
};
