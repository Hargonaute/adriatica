'use client';

import { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Code, Database } from 'lucide-react';
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
    fields: Field[];
}

export default function CollectionDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<CollectionData | null>(null);
    const [loading, setLoading] = useState(true);

    // Field Form
    const [isAddingField, setIsAddingField] = useState(false);
    const [fieldLabel, setFieldLabel] = useState('');
    const [fieldKey, setFieldKey] = useState('');
    const [fieldKeyTouched, setFieldKeyTouched] = useState(false);
    const [fieldType, setFieldType] = useState('text');
    const [fieldRequired, setFieldRequired] = useState(false);

    useEffect(() => {
        fetch(`/api/collections/${id}`)
            .then(res => res.json())
            .then(json => {
                if (json.error) throw new Error(json.error);
                setData(json);
                setLoading(false);
            })
            .catch(() => {
                toast.error('Failed to load collection');
                setLoading(false);
            });
    }, [id]);

    const handleAddField = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsAddingField(true);
        try {
            const res = await fetch('/api/fields', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    collectionId: id,
                    label: fieldLabel,
                    key: fieldKey,
                    type: fieldType,
                    required: fieldRequired,
                    order: (data?.fields.length || 0) + 1,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body.error || 'Failed to add field');
            }

            const newField = await res.json();
            setData(prev => prev ? { ...prev, fields: [...prev.fields, newField] } : null);
            setFieldLabel('');
            setFieldKey('');
            setFieldKeyTouched(false);
            setFieldRequired(false);
            toast.success('Field added');
        } catch (err: any) {
            toast.error(err.message || 'Failed to add field');
        } finally {
            setIsAddingField(false);
        }
    };

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

    if (loading) return <div className="p-10 text-center text-muted-foreground">Loading…</div>;
    if (!data) return <div className="p-10 text-center text-muted-foreground">Collection not found</div>;

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
                                <form onSubmit={handleAddField} className="space-y-4">
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Label</Label>
                                            <Input
                                                value={fieldLabel}
                                                onChange={e => {
                                                    setFieldLabel(e.target.value);
                                                    if (!fieldKeyTouched) {
                                                        setFieldKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                                                    }
                                                }}
                                                placeholder="e.g. Full Name"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Key (API identifier)</Label>
                                            <Input
                                                value={fieldKey}
                                                onChange={e => { setFieldKeyTouched(true); setFieldKey(e.target.value); }}
                                                placeholder="e.g. full_name"
                                                required
                                                className="font-mono"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-xs">Type</Label>
                                            <Select value={fieldType} onValueChange={setFieldType}>
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
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-3 pt-6">
                                            <Switch
                                                id="required"
                                                checked={fieldRequired}
                                                onCheckedChange={setFieldRequired}
                                            />
                                            <Label htmlFor="required" className="text-sm cursor-pointer">Required field</Label>
                                        </div>
                                    </div>
                                    <Button type="submit" disabled={isAddingField || !fieldLabel || !fieldKey}>
                                        {isAddingField ? 'Adding…' : 'Add Field'}
                                    </Button>
                                </form>
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
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Submit Endpoint</span>
                                <code className="bg-background px-2 py-1 rounded text-xs block">POST /api/entries/create</code>
                            </div>
                            <div>
                                <span className="font-semibold block text-xs uppercase text-muted-foreground mb-1">Payload</span>
                                <code className="bg-background px-2 py-1 rounded text-xs block whitespace-pre">{`{\n  collectionId: "${data.id}",\n  data: { ...fields }\n}`}</code>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
