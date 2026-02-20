import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Dashboard sub-paths that are publicly accessible (no auth required)
const DASHBOARD_PUBLIC = ['/dashboard/login'];

// Mutating API routes that require authentication
// (Public form submission at /api/entries/create is intentionally excluded)
const PROTECTED_API_PATHS = [
  '/api/pages',
  '/api/upload',
  '/api/assets',
  '/api/collections',
  '/api/entries',
  '/api/admin',
];

function isDashboardProtected(pathname: string): boolean {
  if (!pathname.startsWith('/dashboard')) return false;
  return !DASHBOARD_PUBLIC.some((p) => pathname.startsWith(p));
}

function isProtectedApiPath(pathname: string, method: string): boolean {
  const mutatingMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!mutatingMethods.includes(method)) return false;
  return PROTECTED_API_PATHS.some((p) => pathname.startsWith(p));
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

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  const requiresAuth =
    isDashboardProtected(pathname) || isProtectedApiPath(pathname, method);

  if (requiresAuth && !isAuthenticated(request)) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/pages/:path*',
    '/api/upload',
    '/api/assets/:path*',
    '/api/collections/:path*',
    '/api/entries',
    '/api/admin/:path*',
  ],
};
