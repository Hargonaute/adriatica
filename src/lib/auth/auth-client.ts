'use client';

import { createAuthClient } from 'better-auth/react';

// Resolve baseURL at runtime so the same bundle works on localhost and in
// production without rebuilding. In the browser we use the current origin;
// during SSR we fall back to NEXT_PUBLIC_APP_URL.
function resolveBaseURL(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
}

export const authClient = createAuthClient({
  baseURL: resolveBaseURL(),
});

export const { signIn, signOut, signUp, useSession } = authClient;
