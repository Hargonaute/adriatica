import type { Config } from 'drizzle-kit';
import { config } from 'dotenv';

// drizzle-kit doesn't auto-load .env.local (Next.js convention), so load it explicitly.
config({ path: '.env.local' });

export default {
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? process.env.POSTGRES_URL!,
  },
} satisfies Config;
