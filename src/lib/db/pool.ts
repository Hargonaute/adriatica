import { Pool } from 'pg';

declare global {
  // Prevent multiple Pool instances during Next.js HMR in development.
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!connectionString) {
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

// Lazy proxy: the underlying Pool (and DATABASE_URL check) is created on first
// use, not on import. Lets builds succeed when env vars aren't set yet; queries
// at request time will still throw if the DB isn't configured.
function getPool(): Pool {
  if (global._pgPool) return global._pgPool;
  const created = createPool();
  if (process.env.NODE_ENV !== 'production') {
    global._pgPool = created;
  }
  return created;
}

export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const value = Reflect.get(getPool(), prop, receiver);
    return typeof value === 'function' ? value.bind(getPool()) : value;
  },
}) as Pool;
