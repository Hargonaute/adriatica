import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError } from 'better-auth/api';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import * as schema from '@/lib/db/schema';
import { isEmailAllowed } from './allowed-emails';

// Resolve the base URL across local dev, Vercel previews, and production.
// Priority: explicit BETTER_AUTH_URL → Vercel-provided URL → NEXT_PUBLIC_APP_URL → localhost.
function resolveBaseURL(): string {
  if (process.env.BETTER_AUTH_URL) return process.env.BETTER_AUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  return 'http://localhost:3000';
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    // Public signup is disabled. New users are created server-side via
    // `npm run auth:create-user` and must appear in ALLOWED_EMAILS.
    disableSignUp: true,
  },

  // Defence in depth: even if a user row exists in the DB, reject the sign-in
  // if their email is no longer on the allow-list.
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (!isEmailAllowed(user.email)) {
            throw new APIError('FORBIDDEN', {
              message: 'This email is not permitted to register.',
            });
          }
          return { data: user };
        },
      },
    },
    session: {
      create: {
        before: async (session: { userId: string }) => {
          const [row] = await db
            .select({ email: schema.user.email })
            .from(schema.user)
            .where(eq(schema.user.id, session.userId))
            .limit(1);
          if (!row || !isEmailAllowed(row.email)) {
            throw new APIError('FORBIDDEN', {
              message: 'This account is no longer permitted to sign in.',
            });
          }
          return { data: session };
        },
      },
    },
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: resolveBaseURL(),

  // Origins allowed to call the auth API. Localhost + the known production
  // URL are hard-coded; add more (custom domain, additional preview URLs) here.
  trustedOrigins: [
    'http://localhost:3000',
    'https://adriatica-git-main-phiros-group.vercel.app',
  ],
});

export type Session = typeof auth.$Infer.Session;
