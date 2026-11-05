// Public forms (contact, newsletter) are emailed through Web3Forms
// (https://web3forms.com): the browser posts to their API, which forwards the
// submission to the address set on the form in the Web3Forms dashboard. No
// database row, no session, no server route.
//
// The access key is public by design (it only identifies the form and its
// recipient), so it ships in the client bundle. NEXT_PUBLIC_WEB3FORMS_KEY
// overrides it, e.g. to point a preview at another recipient.
const DEFAULT_ACCESS_KEY = '464c1d43-b84c-41e3-b05b-cf63b898168b';

export const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

/** Name of the hidden honeypot checkbox Web3Forms checks (bots tick it). */
export const WEB3FORMS_HONEYPOT = 'botcheck';

export function web3formsAccessKey(): string {
  return process.env.NEXT_PUBLIC_WEB3FORMS_KEY || DEFAULT_ACCESS_KEY;
}

/**
 * Sends one submission. `fields` become the lines of the email; `subject` is
 * its subject. When `fields.email` is set, Web3Forms uses it as Reply-To, so
 * the recipient can answer the visitor directly. Throws when the submission
 * is not accepted.
 */
export async function sendWeb3Form(
  subject: string,
  fields: Record<string, string>,
  honeypot: boolean
): Promise<void> {
  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: web3formsAccessKey(),
      subject,
      from_name: 'Site Adriatica',
      [WEB3FORMS_HONEYPOT]: honeypot,
      ...fields,
    }),
  });
  const body = (await res.json().catch(() => null)) as { success?: boolean } | null;
  if (!res.ok || !body?.success) throw new Error('web3forms: submission rejected');
}
