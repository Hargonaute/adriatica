import { Pool } from 'pg';

declare global {
  // Prevent multiple Pool instances during Next.js HMR in development.
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) {
    // Build-time / pre-provisioned environments: construct a pool with a
    // placeholder URL so module imports don't throw. The Pool constructor
    // does not open a connection — the first real query will fail loudly
    // until DATABASE_URL is set.
    if (process.env.NODE_ENV !== 'development') {
      return new Pool({ connectionString: 'postgresql://unset:unset@localhost:5432/unset' });
    }
    throw new Error(
      'DATABASE_URL is not set. Add it to .env.local (see .env.example).'
    );
  }

  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
}

export const pool = global._pgPool ?? createPool();

if (process.env.NODE_ENV !== 'production') {
  global._pgPool = pool;
}
