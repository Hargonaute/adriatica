'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle2, FileUp, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  parseCSV,
  validateRows,
  type CsvField,
  type ValidationReport,
} from '@/lib/csv';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectionId: string;
  fields: CsvField[];
  onImported: () => void;
}

export function BulkImportDialog({
  open,
  onOpenChange,
  collectionId,
  fields,
  onImported,
}: BulkImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [importing, setImporting] = useState(false);

  const reset = () => {
    setFileName(null);
    setReport(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large (max 5 MB)');
      return;
    }
    setFileName(file.name);
    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        toast.error('CSV must contain a header row and at least one data row');
        setReport(null);
        return;
      }
      const r = validateRows(parsed, fields);
      setReport(r);
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse CSV');
      setReport(null);
    }
  };

  const handleImport = async () => {
    if (!report) return;
    const validRows = report.rows.filter(r => r.errors.length === 0).map(r => r.data);
    if (validRows.length === 0) {
      toast.error('Nothing to import — all rows have errors');
      return;
    }
    setImporting(true);
    try {
      const res = await fetch('/api/entries/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, rows: validRows }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Import failed');
      toast.success(`Imported ${body.inserted} item${body.inserted === 1 ? '' : 's'}`);
      onImported();
      handleClose(false);
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const hasBlockingProblems =
    !!report && (report.missingRequired.length > 0 || report.knownKeys.length === 0);
  const canImport = !!report && !hasBlockingProblems && report.validRows > 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file. Headers must match this collection&apos;s field keys. Rows with errors will be skipped.
          </DialogDescription>
        </DialogHeader>

        {/* File picker */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
            >
              <FileUp className="h-3.5 w-3.5 mr-1.5" />
              {fileName ? 'Choose another file' : 'Choose CSV file'}
            </Button>
            {fileName && (
              <span className="text-sm text-muted-foreground truncate">{fileName}</span>
            )}
            {report && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground ml-auto"
                onClick={reset}
                disabled={importing}
                title="Clear"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={handleFile}
            />
          </div>
        </div>

        {/* Validation report */}
        {report && (
          <div className="space-y-3 border-t pt-4">
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3 text-sm">
              <SummaryStat label="Total rows" value={report.totalRows} />
              <SummaryStat
                label="Valid"
                value={report.validRows}
                tone={report.validRows === report.totalRows ? 'good' : 'neutral'}
              />
              <SummaryStat
                label="Errors"
                value={report.errorCount}
                tone={report.errorCount > 0 ? 'bad' : 'good'}
              />
            </div>

            {/* Header issues */}
            {report.missingRequired.length > 0 && (
              <IssueBanner tone="bad">
                Missing required columns: <code className="font-mono">{report.missingRequired.join(', ')}</code>
              </IssueBanner>
            )}
            {report.knownKeys.length === 0 && (
              <IssueBanner tone="bad">
                None of the CSV headers match this collection&apos;s field keys.
              </IssueBanner>
            )}
            {report.unknownKeys.length > 0 && (
              <IssueBanner tone="warn">
                Unknown columns will be ignored: <code className="font-mono">{report.unknownKeys.join(', ')}</code>
              </IssueBanner>
            )}

            {/* Row-level issues */}
            {report.errorCount > 0 && (
              <div className="rounded-md border">
                <div className="px-3 py-2 text-xs font-medium border-b bg-muted/50">
                  Row issues ({report.errorCount})
                </div>
                <ScrollArea className="max-h-48">
                  <ul className="divide-y text-xs">
                    {report.rows
                      .filter(r => r.errors.length > 0)
                      .slice(0, 100)
                      .flatMap(r =>
                        r.errors.map((err, i) => (
                          <li key={`${r.row}-${i}`} className="px-3 py-1.5 flex gap-3">
                            <span className="font-mono text-muted-foreground shrink-0">row {r.row}</span>
                            <span>{err.message}</span>
                          </li>
                        )),
                      )}
                  </ul>
                </ScrollArea>
              </div>
            )}

            {/* All-good banner */}
            {report.errorCount === 0 && !hasBlockingProblems && (
              <IssueBanner tone="good">
                CSV looks good — ready to import {report.validRows} row{report.validRows === 1 ? '' : 's'}.
              </IssueBanner>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => handleClose(false)} disabled={importing}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!canImport || importing}>
            <Upload className="h-3.5 w-3.5 mr-1.5" />
            {importing
              ? 'Importing…'
              : report
                ? `Import ${report.validRows} row${report.validRows === 1 ? '' : 's'}`
                : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SummaryStat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  tone?: 'good' | 'bad' | 'neutral';
}) {
  const toneClass =
    tone === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'bad'
        ? 'text-destructive'
        : 'text-foreground';
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}

function IssueBanner({
  tone,
  children,
}: {
  tone: 'good' | 'bad' | 'warn';
  children: React.ReactNode;
}) {
  const config = {
    good: {
      icon: CheckCircle2,
      cls: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    },
    bad: {
      icon: AlertCircle,
      cls: 'bg-destructive/10 text-destructive border-destructive/30',
    },
    warn: {
      icon: AlertCircle,
      cls: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    },
  }[tone];
  const Icon = config.icon;
  return (
    <div className={`flex items-start gap-2 rounded-md border px-3 py-2 text-xs ${config.cls}`}>
      <Icon className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
