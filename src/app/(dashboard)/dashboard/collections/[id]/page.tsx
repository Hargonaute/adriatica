'use client';

import { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Trash2, ArrowLeft, Code, Database, ExternalLink, Layout, AlertTriangle, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Field {
    id: string;
    key: string;
    label: string;
    type: string;
    required: boolean;
    order: number;
    options?: any;
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

// ── Select / Multi-select option builder ──────────────────────────────────────

function OptionBuilder({
    options,
    onChange,
}: {
    options: Array<{ label: string; value: string }>;
    onChange: (opts: Array<{ label: string; value: string }>) => void;
}) {
    const add = () => onChange([...options, { label: '', value: '' }]);
    const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i));
    const update = (i: number, field: 'label' | 'value', val: string) => {
        const next = [...options];
        next[i] = { ...next[i], [field]: val };
        // auto-derive value from label if value is empty or still matches previous auto
        if (field === 'label') {
            const autoValue = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
            if (!next[i].value || next[i].value === options[i].value) {
                next[i].value = autoValue;
            }
        }
        onChange(next);
    };

    return (
        <div className="space-y-2">
            {options.map((opt, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <Input
                        placeholder="Label"
                        value={opt.label}
                        onChange={e => update(i, 'label', e.target.value)}
                        className="text-xs"
                    />
                    <Input
                        placeholder="Value"
                        value={opt.value}
                        onChange={e => update(i, 'value', e.target.value)}
                        className="text-xs font-mono"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={add} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add option
            </Button>
        </div>
    );
}

// ── List sub-field builder (for list type with itemType=object) ───────────────

interface SubFieldDef { key: string; label: string; type: string }

function SubFieldBuilder({
    subFields,
    onChange,
}: {
    subFields: SubFieldDef[];
    onChange: (sf: SubFieldDef[]) => void;
}) {
    const primitiveTypes = ['text', 'number', 'url', 'email', 'date'];
    const add = () => onChange([...subFields, { key: '', label: '', type: 'text' }]);
    const remove = (i: number) => onChange(subFields.filter((_, idx) => idx !== i));
    const update = (i: number, field: keyof SubFieldDef, val: string) => {
        const next = [...subFields];
        next[i] = { ...next[i], [field]: val };
        if (field === 'label' && (!next[i].key || next[i].key === subFields[i].key)) {
            next[i].key = val.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
        }
        onChange(next);
    };

    return (
        <div className="space-y-2">
            {subFields.map((sf, i) => (
                <div key={i} className="flex gap-2 items-center">
                    <Input
                        placeholder="Label"
                        value={sf.label}
                        onChange={e => update(i, 'label', e.target.value)}
                        className="text-xs"
                    />
                    <Input
                        placeholder="key"
                        value={sf.key}
                        onChange={e => update(i, 'key', e.target.value)}
                        className="text-xs font-mono"
                    />
                    <select
                        value={sf.type}
                        onChange={e => update(i, 'type', e.target.value)}
                        className="h-9 rounded-md border bg-background px-2 text-xs outline-none focus:ring-2 focus:ring-ring"
                    >
                        {primitiveTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}>
                        <X className="h-3.5 w-3.5" />
                    </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={add} className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add sub-field
            </Button>
        </div>
    );
}

// ── Isolated Add Field Form ───────────────────────────────────────────────────

function AddFieldForm({
    collectionId,
    nextOrder,
    onAdded,
    existingFields,
}: {
    collectionId: string;
    nextOrder: number;
    onAdded: (field: Field) => void;
    existingFields: Field[];
}) {
    const [label, setLabel] = useState('');
    const [key, setKey] = useState('');
    const [keyTouched, setKeyTouched] = useState(false);
    const [type, setType] = useState('text');
    const [required, setRequired] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // select / multi-select
    const [selectOptions, setSelectOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [selectDefault, setSelectDefault] = useState('');
    const [msMin, setMsMin] = useState('');
    const [msMax, setMsMax] = useState('');

    // list
    const [listItemType, setListItemType] = useState('text');
    const [listSubFields, setListSubFields] = useState<SubFieldDef[]>([]);

    // reference
    const [refCollectionId, setRefCollectionId] = useState('');
    const [refMultiple, setRefMultiple] = useState(false);
    const [availableCollections, setAvailableCollections] = useState<Array<{ id: string; name: string; slug: string }>>([]);

    // slug
    const [slugSource, setSlugSource] = useState('');

    // Fetch collections when reference type is selected
    useEffect(() => {
        if (type !== 'reference') return;
        fetch('/api/collections')
            .then(r => r.json())
            .then(d => setAvailableCollections(Array.isArray(d) ? d : []))
            .catch(() => {});
    }, [type]);

    const resetTypeConfig = () => {
        setSelectOptions([]);
        setSelectDefault('');
        setMsMin('');
        setMsMax('');
        setListItemType('text');
        setListSubFields([]);
        setRefCollectionId('');
        setRefMultiple(false);
        setSlugSource('');
    };

    const handleTypeChange = (val: string) => {
        setType(val);
        resetTypeConfig();
    };

    const reset = () => {
        setLabel('');
        setKey('');
        setKeyTouched(false);
        setType('text');
        setRequired(false);
        resetTypeConfig();
    };

    const buildOptions = (): any => {
        switch (type) {
            case 'select':
                return selectOptions.length > 0
                    ? { options: selectOptions, ...(selectDefault ? { default: selectDefault } : {}) }
                    : null;
            case 'multi-select':
                return selectOptions.length > 0
                    ? {
                        options: selectOptions,
                        ...(msMin !== '' ? { min: Number(msMin) } : {}),
                        ...(msMax !== '' ? { max: Number(msMax) } : {}),
                    }
                    : null;
            case 'list':
                return {
                    itemType: listItemType,
                    ...(listItemType === 'object' && listSubFields.length > 0 ? { subFields: listSubFields } : {}),
                };
            case 'reference':
                return refCollectionId ? { collection: refCollectionId, multiple: refMultiple } : null;
            case 'slug':
                return slugSource ? { source: slugSource } : {};
            default:
                return null;
        }
    };

    const configValid = (): boolean => {
        switch (type) {
            case 'select':
            case 'multi-select':
                return selectOptions.length > 0 && selectOptions.every(o => o.label && o.value);
            case 'list':
                return listItemType !== 'object' || listSubFields.length > 0;
            case 'reference':
                return !!refCollectionId;
            default:
                return true;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!label.trim() || !key.trim()) return;
        if (!configValid()) {
            toast.error('Please complete the field configuration before saving.');
            return;
        }
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
                    options: buildOptions(),
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

    const textFields = existingFields.filter(f => f.type === 'text' || f.type === 'textarea');

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
                    <Select value={type} onValueChange={handleTypeChange}>
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
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="select">Select (single choice)</SelectItem>
                            <SelectItem value="multi-select">Multi-select (tags)</SelectItem>
                            <SelectItem value="list">List (repeatable)</SelectItem>
                            <SelectItem value="reference">Reference (relation)</SelectItem>
                            <SelectItem value="slug">Slug (URL-friendly)</SelectItem>
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

            {/* ── select / multi-select config ── */}
            {(type === 'select' || type === 'multi-select') && (
                <div className="space-y-3 rounded-md border bg-muted/20 p-4">
                    <p className="text-xs font-medium">Options</p>
                    <OptionBuilder options={selectOptions} onChange={setSelectOptions} />
                    {type === 'select' && selectOptions.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                            <Label className="text-xs">Default value (optional)</Label>
                            <Select value={selectDefault || '__none__'} onValueChange={v => setSelectDefault(v === '__none__' ? '' : v)}>
                                <SelectTrigger className="text-xs">
                                    <SelectValue placeholder="No default" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">No default</SelectItem>
                                    {selectOptions.filter(o => o.value).map(o => (
                                        <SelectItem key={o.value} value={o.value}>{o.label || o.value}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {type === 'multi-select' && (
                        <div className="flex gap-4 pt-1">
                            <div className="space-y-1.5">
                                <Label className="text-xs">Min selections (optional)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={msMin}
                                    onChange={e => setMsMin(e.target.value)}
                                    placeholder="—"
                                    className="text-xs w-24"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs">Max selections (optional)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={msMax}
                                    onChange={e => setMsMax(e.target.value)}
                                    placeholder="—"
                                    className="text-xs w-24"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── list config ── */}
            {type === 'list' && (
                <div className="space-y-3 rounded-md border bg-muted/20 p-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Item type</Label>
                        <Select value={listItemType} onValueChange={v => { setListItemType(v); setListSubFields([]); }}>
                            <SelectTrigger className="text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="number">Number</SelectItem>
                                <SelectItem value="url">URL</SelectItem>
                                <SelectItem value="email">Email</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                                <SelectItem value="object">Structured object (sub-fields)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {listItemType === 'object' && (
                        <div className="space-y-2">
                            <p className="text-xs font-medium">Sub-fields</p>
                            <SubFieldBuilder subFields={listSubFields} onChange={setListSubFields} />
                        </div>
                    )}
                </div>
            )}

            {/* ── reference config ── */}
            {type === 'reference' && (
                <div className="space-y-3 rounded-md border bg-muted/20 p-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Target collection</Label>
                        <Select value={refCollectionId || '__none__'} onValueChange={v => setRefCollectionId(v === '__none__' ? '' : v)}>
                            <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Select a collection…" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Select a collection…</SelectItem>
                                {availableCollections.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-3">
                        <Switch id="ref-multiple" checked={refMultiple} onCheckedChange={setRefMultiple} />
                        <Label htmlFor="ref-multiple" className="text-xs cursor-pointer">Allow multiple references (one-to-many)</Label>
                    </div>
                </div>
            )}

            {/* ── slug config ── */}
            {type === 'slug' && (
                <div className="space-y-3 rounded-md border bg-muted/20 p-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Derive from field (optional)</Label>
                        <Select value={slugSource || '__none__'} onValueChange={v => setSlugSource(v === '__none__' ? '' : v)}>
                            <SelectTrigger className="text-xs">
                                <SelectValue placeholder="Manual entry only" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="__none__">Manual entry only</SelectItem>
                                {textFields.map(f => (
                                    <SelectItem key={f.key} value={f.key}>{f.label} ({f.key})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">When set, the slug field auto-generates from this field while it&apos;s empty, and a "Generate" button appears in the item editor.</p>
                    </div>
                </div>
            )}

            <Button type="submit" disabled={submitting || !label.trim() || !key.trim() || !configValid()}>
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
                                                {field.options?.options?.length > 0 && (
                                                    <span className="text-xs text-muted-foreground shrink-0">{field.options.options.length} options</span>
                                                )}
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
                                    existingFields={data.fields}
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
