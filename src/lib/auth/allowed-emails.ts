/**
 * Hard-coded allow-list of emails permitted to have an account.
 * Driven by the ALLOWED_EMAILS env var: a comma-separated list.
 * Example: ALLOWED_EMAILS=admin@example.com,editor@example.com
 *
 * Any email not in this list is rejected at sign-in and at user creation time.
 */
export function getAllowedEmails(): string[] {
  const raw = process.env.ALLOWED_EMAILS ?? '';
  return raw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowed(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = getAllowedEmails();
  if (allowed.length === 0) return false;
  return allowed.includes(email.trim().toLowerCase());
}
