import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/pool';

// Known tables (app + auth). We query each individually so unknown/missing
// tables don't crash the whole request.
const KNOWN_TABLES = [
  'pages',
  'assets',
  'collections',
  'fields',
  'entries',
  'user',
  'session',
  'account',
  'verification',
];

export const dynamic = 'force-dynamic';

export async function GET() {
  const client = await pool.connect();
  const start = Date.now();

  try {
    const [versionRes, currentRes] = await Promise.all([
      client.query<{ server_version: string }>('SHOW server_version'),
      client.query<{ current_database: string; current_user: string; inet_server_addr: string }>(
        'SELECT current_database(), current_user, inet_server_addr()'
      ),
    ]);

    const latencyMs = Date.now() - start;

    const tableStats = await Promise.all(
      KNOWN_TABLES.map(async (table) => {
        try {
          const res = await client.query<{ count: string }>(
            `SELECT COUNT(*) AS count FROM "${table}"`
          );
          return { table_name: table, row_count: parseInt(res.rows[0].count, 10) };
        } catch {
          return { table_name: table, row_count: -1 }; // -1 = table doesn't exist yet
        }
      })
    );

    const { current_database, current_user, inet_server_addr } = currentRes.rows[0];

    return NextResponse.json({
      version: versionRes.rows[0].server_version,
      database: current_database,
      user: current_user,
      host: inet_server_addr ?? 'localhost',
      tables: tableStats.filter((t) => t.row_count >= 0),
      latencyMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    client.release();
  }
}
