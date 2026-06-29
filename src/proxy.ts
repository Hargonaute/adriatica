import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Dashboard sub-paths that are publicly accessible (no auth required)
const DASHBOARD_PUBLIC = ['/dashboard'];

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

  return NextResponse.next();
}

export const config = {
  matcher: [
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
  ],
};
