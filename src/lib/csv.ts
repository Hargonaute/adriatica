// CSV utilities for bulk import/export of collection entries.
//
// - parseCSV: RFC 4180-ish parser (handles quoted fields, escaped quotes, embedded commas/newlines, BOM)
// - stringifyCSV: serializer that quotes only when needed
// - buildTemplateCSV: empty CSV with header + example row matching a collection's fields
// - validateRows: coerces/validates parsed CSV rows against field definitions and returns row-level issues

export type CsvFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'date'
  | 'textarea'
  | 'checkbox'
  | 'rich-text'
  | 'image';

export interface CsvField {
  key: string;
  label: string;
  type: CsvFieldType;
  required: boolean;
}

export interface RowIssue {
  row: number;        // 1-based row number in source file (header = row 1, first data row = 2)
  column?: string;    // field key the issue is about (optional for whole-row issues)
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidatedRow {
  /** 1-based source row number (header excluded — first data row = 2). */
  row: number;
  /** Coerced field values keyed by field.key. */
  data: Record<string, unknown>;
  /** Errors for this specific row. Row is skipped on import if non-empty. */
  errors: RowIssue[];
}

export interface ValidationReport {
  headers: string[];
  knownKeys: string[];   // headers that match a known field key
  unknownKeys: string[]; // headers that do not match any field key (ignored on import)
  missingRequired: string[]; // field keys that are required but missing from the headers
  rows: ValidatedRow[];
  totalRows: number;
  validRows: number;
  errorCount: number;
}

// ── Parser ────────────────────────────────────────────────────────────────────

/**
 * Parse a CSV string into a 2D array of cells.
 * Handles double-quoted fields, escaped "" quotes, embedded commas and newlines.
 * Strips a leading UTF-8 BOM if present.
 */
export function parseCSV(input: string): string[][] {
  const text = input.charCodeAt(0) === 0xfeff ? input.slice(1) : input;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }

    if (ch === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }

    if (ch === '\r') {
      // Handle \r, \r\n
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      if (text[i] === '\n') i++;
      continue;
    }

    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }

    field += ch;
    i++;
  }

  // Flush trailing field/row (ignore a single trailing empty row produced by a final newline).
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing fully-empty rows (common from trailing newline / blank lines).
  while (rows.length && rows[rows.length - 1].every(c => c.trim() === '')) {
    rows.pop();
  }

  return rows;
}

// ── Serializer ───────────────────────────────────────────────────────────────

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'string' ? value : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function stringifyCSV(rows: unknown[][]): string {
  return rows.map(r => r.map(escapeCell).join(',')).join('\n');
}

// ── Template ─────────────────────────────────────────────────────────────────

const EXAMPLE_BY_TYPE: Record<CsvFieldType, string> = {
  text: 'Example value',
  textarea: 'Longer example text',
  email: 'name@example.com',
  number: '42',
  date: '2026-01-15',
  checkbox: 'true',
  'rich-text': '<p>Example HTML</p>',
  image: 'https://example.com/image.jpg',
};

/**
 * Build an empty CSV template:
 *   row 1 → header (field keys)
 *   row 2 → one example row with type-appropriate sample values
 *
 * Field keys are used as headers so they round-trip through parseCSV → import unchanged.
 */
export function buildTemplateCSV(fields: CsvField[]): string {
  if (fields.length === 0) return '';
  const headers = fields.map(f => f.key);
  const example = fields.map(f => EXAMPLE_BY_TYPE[f.type] ?? '');
  return stringifyCSV([headers, example]);
}

// ── Validation / coercion ────────────────────────────────────────────────────

const TRUE_VALUES = new Set(['true', 'yes', 'y', '1', 'on']);
const FALSE_VALUES = new Set(['false', 'no', 'n', '0', 'off', '']);

function coerce(
  raw: string,
  field: CsvField,
): { value: unknown; error?: string } {
  const trimmed = raw.trim();

  if (trimmed === '') {
    if (field.required && field.type !== 'checkbox') {
      return { value: null, error: `"${field.key}" is required` };
    }
    if (field.type === 'checkbox') return { value: false };
    return { value: '' };
  }

  switch (field.type) {
    case 'number': {
      const n = Number(trimmed);
      if (!Number.isFinite(n)) {
        return { value: null, error: `"${field.key}" must be a number (got "${trimmed}")` };
      }
      return { value: n };
    }
    case 'email': {
      // Lightweight check — matches HTML5 input[type=email] semantics
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return { value: trimmed, error: `"${field.key}" is not a valid email` };
      }
      return { value: trimmed };
    }
    case 'date': {
      // Accept YYYY-MM-DD or anything Date.parse handles; normalize to YYYY-MM-DD.
      const t = Date.parse(trimmed);
      if (Number.isNaN(t)) {
        return { value: trimmed, error: `"${field.key}" is not a valid date (use YYYY-MM-DD)` };
      }
      const iso = new Date(t).toISOString().slice(0, 10);
      return { value: iso };
    }
    case 'checkbox': {
      const lc = trimmed.toLowerCase();
      if (TRUE_VALUES.has(lc)) return { value: true };
      if (FALSE_VALUES.has(lc)) return { value: false };
      return { value: false, error: `"${field.key}" must be true/false (got "${trimmed}")` };
    }
    case 'image': {
      try {
        // Allow absolute URLs only
        new URL(trimmed);
        return { value: trimmed };
      } catch {
        return { value: trimmed, error: `"${field.key}" must be a valid URL` };
      }
    }
    case 'text':
    case 'textarea':
    case 'rich-text':
    default:
      return { value: raw }; // preserve original (no trim) for free-text fields
  }
}

/**
 * Validate parsed CSV rows against a collection's field definitions.
 * Returns a structured report the UI can present before import.
 */
export function validateRows(
  parsed: string[][],
  fields: CsvField[],
): ValidationReport {
  if (parsed.length === 0) {
    return {
      headers: [],
      knownKeys: [],
      unknownKeys: [],
      missingRequired: fields.filter(f => f.required).map(f => f.key),
      rows: [],
      totalRows: 0,
      validRows: 0,
      errorCount: 0,
    };
  }

  const [headerRow, ...dataRows] = parsed;
  const headers = headerRow.map(h => h.trim());
  const fieldByKey = new Map(fields.map(f => [f.key, f]));

  const knownKeys: string[] = [];
  const unknownKeys: string[] = [];
  headers.forEach(h => {
    if (h === '') return;
    if (fieldByKey.has(h)) knownKeys.push(h);
    else unknownKeys.push(h);
  });

  const missingRequired = fields
    .filter(f => f.required && !headers.includes(f.key))
    .map(f => f.key);

  const validatedRows: ValidatedRow[] = dataRows.map((cells, idx) => {
    const rowNumber = idx + 2; // header is row 1
    const data: Record<string, unknown> = {};
    const errors: RowIssue[] = [];

    headers.forEach((header, colIdx) => {
      const field = fieldByKey.get(header);
      if (!field) return; // unknown header → ignored
      const raw = cells[colIdx] ?? '';
      const { value, error } = coerce(raw, field);
      data[field.key] = value;
      if (error) {
        errors.push({ row: rowNumber, column: field.key, message: error, severity: 'error' });
      }
    });

    // Required field absent from row data (when header existed but cell was empty for required type)
    fields.forEach(field => {
      if (!field.required) return;
      if (!headers.includes(field.key)) return; // header-missing reported at report level
      const v = data[field.key];
      const isEmpty = v === '' || v === null || v === undefined;
      if (isEmpty && field.type !== 'checkbox') {
        // Avoid duplicate message if coerce already produced one
        if (!errors.some(e => e.column === field.key)) {
          errors.push({
            row: rowNumber,
            column: field.key,
            message: `"${field.key}" is required`,
            severity: 'error',
          });
        }
      }
    });

    return { row: rowNumber, data, errors };
  });

  const errorCount = validatedRows.reduce((sum, r) => sum + r.errors.length, 0);
  const validRows = validatedRows.filter(r => r.errors.length === 0).length;

  return {
    headers,
    knownKeys,
    unknownKeys,
    missingRequired,
    rows: validatedRows,
    totalRows: validatedRows.length,
    validRows,
    errorCount,
  };
}

/** Trigger a browser download for a CSV blob. */
export function downloadCSV(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
