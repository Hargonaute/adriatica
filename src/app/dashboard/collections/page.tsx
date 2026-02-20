'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Plus, Database, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');

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
      toast.success('Collection created');
    } catch (error) {
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
            <p className="text-muted-foreground">Manage CMS collections — blog posts, team members, form submissions, and more.</p>
         </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {/* Create Form */}
         <Card className="md:col-span-1 h-fit">
            <CardHeader>
                <CardTitle>New Collection</CardTitle>
                <CardDescription>Create a new database for form entries.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input 
                            value={newName} 
                            onChange={e => {
                                setNewName(e.target.value);
                                // Auto-slug
                                if (!newSlug) {
                                    setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                                }
                            }} 
                            placeholder="e.g. Contact Form" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Slug</label>
                        <Input 
                            value={newSlug} 
                            onChange={e => setNewSlug(e.target.value)} 
                            placeholder="e.g. contact-form" 
                            required 
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isCreating}>
                        {isCreating ? 'Creating...' : (
                            <>
                                <Plus className="mr-2 h-4 w-4" /> Create Collection
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
         </Card>

         {/* List */}
         <div className="md:col-span-2 space-y-4">
             {loading ? (
                 <div className="text-center py-10 text-muted-foreground">Loading collections...</div>
             ) : collections.length === 0 ? (
                 <div className="text-center py-10 border rounded-lg bg-muted/20">
                     <Database className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                     <p className="font-medium">No collections yet</p>
                 </div>
             ) : (
                 collections.map(col => (
                     <Link key={col.id} href={`/dashboard/collections/${col.id}`} className="block">
                         <Card className="hover:border-primary transition-colors">
                             <CardHeader className="flex flex-row items-center justify-between py-4">
                                 <div>
                                     <CardTitle className="text-base">{col.name}</CardTitle>
                                     <CardDescription className="text-xs font-mono">{col.slug}</CardDescription>
                                 </div>
                                 <ArrowRight className="h-4 w-4 text-muted-foreground" />
                             </CardHeader>
                         </Card>
                     </Link>
                 ))
             )}
         </div>
      </div>
    </div>
  );
}
