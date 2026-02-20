import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '@/lib/db/drizzle';
import * as schema from '@/lib/db/schema';

export const auth = betterAuth({
  // Use the Drizzle adapter — all tables live in schema.ts and are managed by drizzle-kit.
  database: drizzleAdapter(db, {
    provider: 'pg',
    // Table mapping: Better Auth model name → Drizzle table object.
    // Required because our schema exports named tables alongside app tables.
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  // Enable email + password authentication.
  emailAndPassword: {
    enabled: true,
  },

  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
});

export type Session = typeof auth.$Infer.Session;
