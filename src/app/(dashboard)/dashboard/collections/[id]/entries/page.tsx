'use client';

import { use, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Entry {
    id: string;
    data: Record<string, any>;
    createdAt: string;
}

interface Collection {
    id: string;
    name: string;
    fields: { key: string; label: string }[];
}

export default function EntriesPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [collection, setCollection] = useState<Collection | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
             try {
                 const [colRes, entriesRes] = await Promise.all([
                     fetch(`/api/collections/${id}`),
                     fetch(`/api/entries?collectionId=${id}`),
                 ]);
                 const colData = await colRes.json();
                 const entriesData = await entriesRes.json();
                 if (colData.error) throw new Error(colData.error);
                 setCollection(colData);
                 setEntries(Array.isArray(entriesData) ? entriesData : []);
             } catch {
                 toast.error('Failed to load data');
             } finally {
                 setLoading(false);
             }
        };
        fetchData();
    }, [id]);

    const handleExportCSV = () => {
        if (!entries.length || !collection) return;
        const headers = ['ID', 'Created At', ...collection.fields.map(f => f.label)];
        const csvContent = [
            headers.join(','),
            ...entries.map(e => {
                const row = [
                    e.id,
                    new Date(e.createdAt).toISOString(),
                    ...collection.fields.map(f => `"${String(e.data[f.key] ?? '').replace(/"/g, '""')}"`)
                ];
                return row.join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${collection.id}-entries.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (loading) return <div className="p-10 text-center text-muted-foreground">Loading entries…</div>;
    if (!collection) return <div className="p-10 text-center text-muted-foreground">Collection not found</div>;

    const displayFields = collection.fields.slice(0, 5);

    return (
        <div className="space-y-8 max-w-6xl pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={`/dashboard/collections/${id}`}>
                       <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{collection.name}: Entries</h1>
                        <p className="text-muted-foreground">{entries.length} submission{entries.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <Button variant="outline" onClick={handleExportCSV} disabled={entries.length === 0}>
                    <Download className="h-4 w-4 mr-2" /> Export CSV
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[180px]">Submitted</TableHead>
                                {displayFields.map(f => (
                                    <TableHead key={f.key}>{f.label}</TableHead>
                                ))}
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={displayFields.length + 2} className="text-center py-12 text-muted-foreground">
                                        No entries yet. Entries appear here once someone submits your form.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                entries.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(entry.createdAt).toLocaleString()}
                                        </TableCell>
                                        {displayFields.map(f => (
                                            <TableCell key={f.key} className="max-w-[200px] truncate text-sm">
                                                {String(entry.data[f.key] ?? '—')}
                                            </TableCell>
                                        ))}
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" onClick={() => alert(JSON.stringify(entry.data, null, 2))}>
                                                View JSON
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
