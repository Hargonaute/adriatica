'use client';

import { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Code, Database, ExternalLink, Layout, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Field {
    id: string;
    key: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
}

interface CollectionData {
    id: string;
    name: string;
    slug: string;
    basePath: string | null;
    itemSlugField: string | null;
    indexPageId: string | null;
    detailTemplatePageId: string | null;
    fields: Field[];
}

interface PageListItem {
    id: string;
    slug: string;
    title: string;
    status: string;
}

// ── Isolated Add Field Form ───────────────────────────────────────────────────

function AddFieldForm({
    collectionId,
    nextOrder,
    onAdded,
}: {
    collectionId: string;
    nextOrder: number;
    onAdded: (field: Field) => void;
}) {
    const [label, setLabel] = useState('');
    const [key, setKey] = useState('');
    const [keyTouched, setKeyTouched] = useState(false);
    const [type, setType] = useState('text');
    const [required, setRequired] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const reset = () => {
        setLabel('');
        setKey('');
        setKeyTouched(false);
        setType('text');
        setRequired(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!label.trim() || !key.trim()) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collectionId,
                    label: label.trim(),
                    key: key.trim(),
                    type,
                    required,
                    order: nextOrder,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to add field');
            }

            const newField = await res.json();
            onAdded(newField);
            reset();
            toast.success('Field added');
        } catch (err: any) {
            toast.error(err.message || 'Failed to add field');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <Label className="text-xs">Label</Label>
                    <Input
                        value={label}
                        onChange={e => {
                            setLabel(e.target.value);
                            if (!keyTouched) {
                                setKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                            }
                        }}
                        placeholder="e.g. Full Name"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Key (API identifier)</Label>
                    <Input
                        value={key}
                        onChange={e => { setKeyTouched(true); setKey(e.target.value); }}
                        placeholder="e.g. full_name"
                        className="font-mono"
                    />
                </div>
                <div className="space-y-1.5">
                    <Label className="text-xs">Type</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="text">Text (single line)</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="rich-text">Rich Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="image">Image URL</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3 pt-6">
                    <Switch
                        id="field-required"
                        checked={required}
                        onCheckedChange={setRequired}
                    />
                    <Label htmlFor="field-required" className="text-sm cursor-pointer">Required field</Label>
                </div>
            </div>
            <Button type="submit" disabled={submitting || !label.trim() || !key.trim()}>
                {submitting ? 'Adding…' : 'Add Field'}
            </Button>
        </form>
    );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function CollectionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<CollectionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState<PageListItem[]>([]);
    const [savingTemplate, setSavingTemplate] = useState(false);
    const [missingSlugCount, setMissingSlugCount] = useState(0);

    useEffect(() => {
        Promise.all([
            fetch(`/api/collections/${id}`).then(r => r.json()),
            fetch('/api/pages').then(r => r.json()),
            fetch(`/api/entries?collectionId=${id}&includeUnpublished=true`).then(r => r.json()),
        ])
            .then(([col, pageList, entriesList]) => {
                if (col.error) throw new Error(col.error);
                setData(col);
                setPages(Array.isArray(pageList) ? pageList : []);
                if (Array.isArray(entriesList)) {
                    setMissingSlugCount(
                        entriesList.filter((e: { slug: string | null }) => !e.slug || !String(e.slug).trim()).length,
                    );
                }
                setLoading(false);
            })
            .catch(() => {
                toast.error('Failed to load collection');
                setLoading(false);
            });
    }, [id]);

    const handleDeleteField = async (fieldId: string) => {
        if (!confirm('Delete this field? Existing entry data for this key will remain but the field will no longer appear in forms.')) return;
        try {
            const res = await fetch(`/api/fields/${fieldId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            setData(prev => prev ? { ...prev, fields: prev.fields.filter(f => f.id !== fieldId) } : null);
            toast.success('Field deleted');
        } catch {
            toast.error('Failed to delete field');
        }
    };

    const handleDeleteCollection = async () => {
        if (!confirm('Are you sure? This will delete all entries and fields permanently.')) return;
        try {
            const res = await fetch(`/api/collections/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed');
            toast.success('Collection deleted');
            router.push('/dashboard/collections');
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleTemplateChange = async (pageId: string) => {
        const newId = pageId === '__none__' ? null : pageId;
        setSavingTemplate(true);
        try {
            const res = await fetch(`/api/collections/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ detailTemplatePageId: newId }),
            });
            if (!res.ok) throw new Error('Failed');
            setData(prev => prev ? { ...prev, detailTemplatePageId: newId } : null);
            toast.success(newId ? 'Template saved' : 'Template removed');
        } catch {
            toast.error('Failed to save template');
        } finally {
            setSavingTemplate(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
    if (!data) return <div className="p-10 text-center text-muted-foreground">Collection not found</div>;

    const publishedPages = pages.filter(p => p.status === 'published');

    return (
        <div className="space-y-8 max-w-5xl pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/collections">
                       <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{data.name}</h1>
                        <p className="text-muted-foreground font-mono text-sm">{data.slug}</p>
                    </div>
                </div>
                <Button variant="destructive" onClick={handleDeleteCollection}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Collection
                </Button>
            </div>

            {missingSlugCount > 0 && (
                <div className="rounded-md border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-sm">
                        <p className="font-medium text-amber-900 dark:text-amber-200">
                            {missingSlugCount} {missingSlugCount === 1 ? 'entry is' : 'entries are'} missing slugs — detail page URLs won&rsquo;t work until slugs are added.
                        </p>
                        <p className="text-amber-800 dark:text-amber-300/80 mt-1">
                            <Link href={`/dashboard/collections/${id}/items`} className="underline">Open the items list</Link> to fix each entry.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
                {/* Fields Management */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fields</CardTitle>
                            <CardDescription>Define the data structure for this collection. Each field becomes an input in your form.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.fields.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-md border-2 border-dashed">
                                    No fields yet. Add one below.
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {data.fields.map(field => (
                                        <div key={field.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="font-medium truncate">{field.label}</span>
                                                <span className="text-xs font-mono text-muted-foreground shrink-0">({field.key})</span>
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-secondary shrink-0">{field.type}</span>
                                                {field.required && <span className="text-xs text-destructive font-medium shrink-0">Required</span>}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                                                onClick={() => handleDeleteField(field.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Add Field Form */}
                            <div className="mt-6 pt-6 border-t">
                                <h4 className="text-sm font-medium mb-4">Add New Field</h4>
                                <AddFieldForm
                                    collectionId={id}
                                    nextOrder={data.fields.length + 1}
                                    onAdded={newField => setData(prev => prev ? { ...prev, fields: [...prev.fields, newField] } : null)}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                            <CardDescription>Create and manage the content items in this collection.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                <Database className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Add, edit, and delete items from this collection.</p>
                                <div className="flex items-center justify-center gap-3 mt-2">
                                    <Link href={`/dashboard/collections/${data.id}/items`}>
                                        <Button variant="default" size="sm">Manage Items →</Button>
                                    </Link>
                                    <Link href={`/dashboard/collections/${data.id}/entries`}>
                                        <Button variant="outline" size="sm">Form Submissions</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Panel */}
                <div className="space-y-6">
                    {/* Developer Info */}
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><Code className="h-4 w-4" /> Developer Info</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div>
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Collection ID</span>
                                <code className="bg-background px-2 py-1 rounded text-xs break-all block">{data.id}</code>
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Base Path</span>
                                <code className="bg-background px-2 py-1 rounded text-xs block">{data.basePath ?? data.slug}</code>
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Index URL</span>
                                <div className="flex items-center gap-2">
                                    <code className="bg-background px-2 py-1 rounded text-xs block flex-1">/collections/{data.basePath ?? data.slug}</code>
                                    <a
                                        href={`/collections/${data.basePath ?? data.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-muted-foreground hover:text-foreground"
                                        title="View listing page"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Item URL pattern</span>
                                <code className="bg-background px-2 py-1 rounded text-xs block">/collections/{data.basePath ?? data.slug}/&#123;item-slug&#125;</code>
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Submit Endpoint</span>
                                <code className="bg-background px-2 py-1 rounded text-xs block">POST /api/entries/create</code>
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Payload</span>
                                <code className="bg-background px-2 py-1 rounded text-xs block whitespace-pre">{`{\n  collectionId: "${data.id}",\n  data: { ...fields }\n}`}</code>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detail Page Template */}
                    <Card className="bg-muted/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base"><Layout className="h-4 w-4" /> Detail Page Template</CardTitle>
                            <CardDescription className="text-xs">
                                Select a published page to use as the item detail template. Add a &ldquo;Collection Item Fields&rdquo; block to that page to display live item data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Select
                                value={data.detailTemplatePageId ?? '__none__'}
                                onValueChange={handleTemplateChange}
                                disabled={savingTemplate}
                            >
                                <SelectTrigger className="text-sm">
                                    <SelectValue placeholder="Auto-generated (default)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">Auto-generated (default)</SelectItem>
                                    {publishedPages.map(p => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {data.detailTemplatePageId && (() => {
                                const tpl = pages.find(p => p.id === data.detailTemplatePageId);
                                return tpl ? (
                                    <div className="flex items-center gap-2 pt-1">
                                        <Link
                                            href={`/dashboard/pages/${tpl.id}`}
                                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                                        >
                                            Edit template in builder
                                        </Link>
                                    </div>
                                ) : null;
                            })()}

                            {publishedPages.length === 0 && (
                                <p className="text-xs text-muted-foreground">
                                    No published pages found.{' '}
                                    <Link href="/dashboard/pages" className="underline hover:text-foreground">Create one</Link> first.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
