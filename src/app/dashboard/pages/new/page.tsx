'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export default function NewPagePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/pages/${data.id}`);
    } catch {
      setError('Network error — please try again');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/pages" className="text-sm text-muted-foreground hover:text-foreground">
            ← Pages
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">New Page</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Page</h1>
          <p className="text-sm text-muted-foreground mt-0.5">You can change these later in the editor.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 bg-background border rounded-lg p-6">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium">Page Title</label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Home, About Us, Product Landing"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className="text-sm font-medium">URL Slug</label>
            <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 focus-within:ring-2 focus-within:ring-ring">
              <span className="text-sm text-muted-foreground select-none">/</span>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-page"
                className="flex-1 text-sm outline-none bg-transparent font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Lowercase letters, numbers, and hyphens only.
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading || !title || !slug}
              className="flex-1 rounded-md bg-foreground py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {loading ? 'Creating…' : 'Create Page & Open Editor'}
            </button>
            <Link
              href="/dashboard/pages"
              className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
    </div>
  );
}
