/** Content tables, in FK-safe insertion order. Shared by backup-content.ts and restore-content.ts. */
export const CONTENT_TABLES = ['pages', 'assets', 'collections', 'fields', 'entries'] as const;
