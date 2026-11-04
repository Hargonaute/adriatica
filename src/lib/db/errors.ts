/** True for a Postgres unique-constraint violation (SQLSTATE 23505), however the driver wraps it. */
export function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; message?: string; cause?: { code?: string; message?: string } } | null;
  return (
    e?.code === '23505' ||
    e?.cause?.code === '23505' ||
    /duplicate key|unique constraint/i.test(e?.message ?? '') ||
    /duplicate key|unique constraint/i.test(e?.cause?.message ?? '')
  );
}
