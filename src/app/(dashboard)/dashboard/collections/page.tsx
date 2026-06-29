'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Database, Settings2, List } from 'lucide-react';
import { toast } from 'sonner';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  indexPageId?: string;
  detailTemplatePageId?: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

  useEffect(() => {
    fetch('/api/collections')
      .then(res => res.json())
      .then(data => {
        setCollections(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, slug: newSlug }),
      });

      if (!res.ok) throw new Error('Failed to create');

      const newCollection = await res.json();
      setCollections([newCollection, ...collections]);
      setNewName('');
      setNewSlug('');
      setSlugEdited(false);
      toast.success('Collection created');
    } catch {
      toast.error('Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
          <p className="text-muted-foreground">Manage CMS collections — blog posts, team members, and more.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Create Form */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>New Collection</CardTitle>
            <CardDescription>Define a new content type with custom fields.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newName}
                  onChange={e => {
                    setNewName(e.target.value);
                    if (!slugEdited) {
                      setNewSlug(slugify(e.target.value));
                    }
                  }}
                  placeholder="e.g. Team Members"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Slug</label>
                <Input
                  value={newSlug}
                  onChange={e => {
                    setSlugEdited(true);
                    setNewSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. team-members"
                  required
                />
                <p className="text-xs text-muted-foreground">Public URL: /collections/{newSlug || '…'}/…</p>
              </div>
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating...' : (
                  <><Plus className="mr-2 h-4 w-4" /> Create Collection</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="md:col-span-2 space-y-3">
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="text-center py-10 border rounded-lg bg-muted/20">
              <Database className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">No collections yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create one to get started.</p>
            </div>
          ) : (
            collections.map(col => (
              <Card key={col.id} className="hover:border-primary/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between py-4 gap-4">
                  {/* Main area → items list */}
                  <Link
                    href={`/dashboard/collections/${col.id}/items`}
                    className="flex-1 min-w-0 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                        <List className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm group-hover:text-primary transition-colors truncate">{col.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate">/collections/{col.slug}/…</p>
                      </div>
                    </div>
                  </Link>

                  {/* Gear icon & Template links */}
                  <div className="flex items-center gap-2 shrink-0">
                    {col.indexPageId && (
                      <Link href={`/dashboard/pages/${col.indexPageId}`} title="Edit Index Template">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Index Template
                        </Button>
                      </Link>
                    )}
                    {col.detailTemplatePageId && (
                      <Link href={`/dashboard/pages/${col.detailTemplatePageId}`} title="Edit Detail Template">
                        <Button variant="outline" size="sm" className="h-8 text-xs">
                          Item Template
                        </Button>
                      </Link>
                    )}
                    <Link href={`/dashboard/collections/${col.id}`} title="Collection settings">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
