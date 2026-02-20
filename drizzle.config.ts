import type { Config } from 'drizzle-kit';

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    // Use DATABASE_URL for all environments.
    // For Vercel Postgres migrations, set this to POSTGRES_URL_NON_POOLING.
    url: process.env.DATABASE_URL ?? process.env.POSTGRES_URL!,
  },
} satisfies Config;
