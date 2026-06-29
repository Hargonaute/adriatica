'use client';

import { useState } from 'react';
import { testConnection } from '@/lib/actions/db-test';

interface TableStat {
  table_name: string;
  row_count: number;
}

interface DbInfo {
  version: string;
  database: string;
  user: string;
  host: string;
  tables: TableStat[];
  latencyMs: number;
}

export default function DatabaseSettingsPage() {
  const [info, setInfo] = useState<DbInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [infoError, setInfoError] = useState('');

  const [testUrl, setTestUrl] = useState('');
  const [testResult, setTestResult] = useState<{ ok: boolean; latencyMs?: number; error?: string } | null>(null);
  const [testingUrl, setTestingUrl] = useState(false);

  async function loadDbInfo() {
    setLoadingInfo(true);
    setInfoError('');
    setInfo(null);
    try {
      const res = await fetch('/api/admin/db-info');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setInfoError(body.error ?? `Server error ${res.status}`);
      } else {
        setInfo(await res.json());
      }
    } catch (e) {
      setInfoError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setLoadingInfo(false);
    }
  }

  async function handleTestConnection(e: React.FormEvent) {
    e.preventDefault();
    setTestingUrl(true);
    setTestResult(null);
    const result = await testConnection(testUrl);
    setTestResult(result);
    setTestingUrl(false);
  }

  const mode =
    typeof process.env.NEXT_PUBLIC_APP_URL === 'string' &&
    process.env.NEXT_PUBLIC_APP_URL.includes('localhost')
      ? 'local'
      : 'production';

  return (
    <div className="max-w-3xl space-y-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Database Health</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Read-only diagnostics for your PostgreSQL database.
          </p>
        </div>

        {/* Environment badge */}
        <section className="rounded-lg border bg-card p-5 space-y-2">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Environment
          </h2>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                mode === 'local'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {mode === 'local' ? 'Local (Docker)' : 'Production (Vercel Postgres)'}
            </span>
            <span className="text-xs text-muted-foreground">
              DATABASE_URL is{' '}
              {process.env.NEXT_PUBLIC_DB_URL_SET === '1' ? (
                <span className="text-green-600 font-medium">set</span>
              ) : (
                <span className="text-destructive font-medium">not detected on client</span>
              )}
            </span>
          </div>
        </section>

        {/* Live DB info */}
        <section className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Live Connection Info
            </h2>
            <button
              onClick={loadDbInfo}
              disabled={loadingInfo}
              className="text-xs px-3 py-1.5 rounded-md bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
            >
              {loadingInfo ? 'Loading…' : info ? 'Refresh' : 'Check Connection'}
            </button>
          </div>

          {infoError && (
            <p className="text-sm text-destructive">{infoError}</p>
          )}

          {info && (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <dt className="text-muted-foreground">Host</dt>
                  <dd className="font-mono">{info.host}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Database</dt>
                  <dd className="font-mono">{info.database}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">User</dt>
                  <dd className="font-mono">{info.user}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Latency</dt>
                  <dd className="font-mono">{info.latencyMs} ms</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Server version</dt>
                  <dd className="font-mono text-xs">{info.version}</dd>
                </div>
              </dl>

              <div>
                <h3 className="text-sm font-medium mb-2">Tables &amp; row counts</h3>
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-3 py-2 font-medium text-muted-foreground">Table</th>
                        <th className="text-right px-3 py-2 font-medium text-muted-foreground">Rows</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {info.tables.map((t) => (
                        <tr key={t.table_name} className="hover:bg-muted/20">
                          <td className="px-3 py-2 font-mono">{t.table_name}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{t.row_count.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Test a connection string */}
        <section className="rounded-lg border bg-card p-5 space-y-4">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Test a Connection String
          </h2>
          <p className="text-xs text-muted-foreground">
            Provide a connection string to validate it. It is never stored or logged.
          </p>

          <form onSubmit={handleTestConnection} className="flex gap-2">
            <input
              type="password"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="postgresql://user:pass@host:5432/db"
              className="flex-1 rounded-md border bg-background px-3 py-2 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
              required
            />
            <button
              type="submit"
              disabled={testingUrl}
              className="px-4 py-2 rounded-md bg-foreground text-background text-sm hover:bg-foreground/90 disabled:opacity-50 transition-colors whitespace-nowrap"
            >
              {testingUrl ? 'Testing…' : 'Test'}
            </button>
          </form>

          {testResult && (
            <div
              className={`rounded-md px-4 py-3 text-sm ${
                testResult.ok
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.ok ? (
                <span>
                  Connected successfully in{' '}
                  <span className="font-semibold">{testResult.latencyMs} ms</span>.
                </span>
              ) : (
                <span>Connection failed: {testResult.error}</span>
              )}
            </div>
          )}
        </section>
    </div>
  );
}
