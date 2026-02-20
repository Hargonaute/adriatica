'use server';

import { Pool } from 'pg';

export interface DbTestResult {
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

/**
 * Tests a PostgreSQL connection string by opening a throwaway pool,
 * running SELECT 1, and immediately closing it.
 *
 * The connection string is never logged or persisted.
 */
export async function testConnection(connectionString: string): Promise<DbTestResult> {
  if (!connectionString || typeof connectionString !== 'string') {
    return { ok: false, error: 'No connection string provided.' };
  }

  // Sanitize: must look like a postgres URL
  if (!connectionString.startsWith('postgres://') && !connectionString.startsWith('postgresql://')) {
    return { ok: false, error: 'Connection string must start with postgres:// or postgresql://.' };
  }

  const testPool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 1_000,
  });

  const start = Date.now();
  try {
    await testPool.query('SELECT 1');
    const latencyMs = Date.now() - start;
    return { ok: true, latencyMs };
  } catch (err) {
    // Strip the connection string from any error message before returning
    const raw = err instanceof Error ? err.message : String(err);
    const sanitized = raw
      .replace(/postgres(ql)?:\/\/[^\s]*/gi, '[REDACTED]')
      .replace(/password=[^\s]*/gi, 'password=[REDACTED]');
    return { ok: false, error: sanitized };
  } finally {
    await testPool.end().catch(() => undefined);
  }
}
