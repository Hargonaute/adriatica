import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';
import { auth } from './auth';
import { isEmailAllowed } from './allowed-emails';

/**
 * Full session validation (signature, expiry, DB lookup) — unlike the
 * cookie-presence check in src/proxy.ts, a forged or expired cookie fails here.
 * Also re-checks the email allow-list, so removing an email from
 * ALLOWED_EMAILS revokes existing sessions immediately.
 */
export async function getValidSession() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session || !isEmailAllowed(session.user.email)) return null;
    return session;
  } catch {
    return null;
  }
}

/**
 * For route handlers: returns a 401 response when there is no valid session,
 * null otherwise.
 *
 *   const unauthorized = await requireSession();
 *   if (unauthorized) return unauthorized;
 */
export async function requireSession(): Promise<NextResponse | null> {
  const session = await getValidSession();
  return session ? null : NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * For dashboard Server Components that read the DB. The dashboard layout
 * checks too, but layouts are not re-rendered on client-side navigation
 * (partial rendering), so each data-loading page checks for itself.
 */
export async function requireDashboardSession(callbackUrl = '/dashboard') {
  const session = await getValidSession();
  if (!session) redirect(`/dashboard/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return session;
}
