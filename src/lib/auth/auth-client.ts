'use client';

import { createAuthClient } from 'better-auth/react';

// When client and server share the same domain, baseURL is optional.
// We set it explicitly so it works correctly during SSR.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
});

export const { signIn, signOut, signUp, useSession } = authClient;
