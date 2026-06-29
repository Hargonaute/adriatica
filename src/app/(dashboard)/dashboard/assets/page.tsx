'use client';

import { useEffect, useRef, useState } from 'react';

interface Asset {
  id: string;
  url: string;
  pathname: string;
  contentType: string | null;
  size: number | null;
  alt: string | null;
  createdAt: string;
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function fetchAssets() {
    try {
      const res = await fetch('/api/assets');
      if (res.ok) setAssets(await res.json());
    } catch {
      // DB not ready
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAssets(); }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Upload failed'); return; }
      setAssets((prev) => [data, ...prev]);
    } catch {
      setError('Network error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  async function handleDelete(asset: Asset) {
    if (!confirm(`Delete "${asset.pathname}"?`)) return;
    try {
      await fetch(`/api/assets/${asset.id}`, { method: 'DELETE' });
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch {
      setError('Delete failed');
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assets</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{assets.length} file{assets.length !== 1 ? 's' : ''}</p>
          </div>
          <label className="inline-flex h-9 cursor-pointer items-center rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 transition-colors">
            {uploading ? 'Uploading…' : '+ Upload File'}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
        )}

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading…</p>
        ) : assets.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center">
            <p className="text-muted-foreground">No assets yet. Upload an image or video to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((asset) => (
              <div key={asset.id} className="group relative rounded-lg border bg-background overflow-hidden">
                {asset.contentType?.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={asset.url}
                    alt={asset.alt || asset.pathname}
                    className="w-full aspect-square object-cover"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted flex items-center justify-center text-2xl">
                    🎬
                  </div>
                )}
                <div className="p-2 space-y-1">
                  <p className="text-xs font-mono truncate text-muted-foreground">{asset.pathname}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(asset.size)}</p>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => navigator.clipboard.writeText(asset.url)}
                    className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-black hover:bg-white"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(asset)}
                    className="rounded bg-red-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-red-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
