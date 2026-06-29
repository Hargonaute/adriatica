# Auth Setup — Better Auth

Authentication is handled by [Better Auth](https://www.better-auth.com) with
email + password sign-in only. **Public signup is disabled.** Accounts must be
provisioned via a CLI script and the email must appear in the `ALLOWED_EMAILS`
allow-list.

---

## How it works

| Piece | Location |
|---|---|
| Auth config (server) | `src/lib/auth/auth.ts` |
| Auth client (browser) | `src/lib/auth/auth-client.ts` |
| Allow-list parser | `src/lib/auth/allowed-emails.ts` |
| API handler | `src/app/api/auth/[...all]/route.ts` (mounted at `/api/auth/*`) |
| Login page | `src/app/(dashboard)/dashboard/login/page.tsx` |
| Change-password page | `src/app/(dashboard)/dashboard/account/page.tsx` |
| Route protection | `src/proxy.ts` (proxies all `/dashboard/*` except `/dashboard/login`) |
| User-create script | `scripts/create-user.ts` |

The allow-list is enforced in **two** places (defence in depth):
1. `databaseHooks.user.create.before` — rejects user creation for any email not in `ALLOWED_EMAILS`.
2. `databaseHooks.session.create.before` — rejects sign-in if the user's email has been removed from `ALLOWED_EMAILS` after the account was created.

---

## Environment variables

Required in both `.env.local` (dev) and Vercel (Production + Preview):

| Var | Example | Notes |
|---|---|---|
| `DATABASE_URL` | `postgresql://…@…/neondb?sslmode=require` | Postgres connection string |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` | Random 32-byte secret |
| `BETTER_AUTH_URL` | `https://adriatica-git-main-phiros-group.vercel.app` | Canonical base URL for the auth API |
| `NEXT_PUBLIC_APP_URL` | same as `BETTER_AUTH_URL` | Used by the client during SSR |
| `ALLOWED_EMAILS` | `a@example.com, b@example.com` | Comma-separated. Whitespace is trimmed, casing normalized. |

For Vercel preview deployments where `BETTER_AUTH_URL` is unset, the server falls
back to `https://${VERCEL_URL}` automatically.

### Setting env vars on Vercel

```bash
vercel env add BETTER_AUTH_SECRET production preview
vercel env add BETTER_AUTH_URL production preview
vercel env add NEXT_PUBLIC_APP_URL production preview
vercel env add ALLOWED_EMAILS production preview
```

Or via dashboard: Project → Settings → Environment Variables.

After changing any of these, **redeploy** for them to take effect.

---

## Trusted origins

Hard-coded in `src/lib/auth/auth.ts`:

```ts
trustedOrigins: [
  'http://localhost:3000',
  'https://adriatica-git-main-phiros-group.vercel.app',
]
```

If you add a custom domain or another preview URL, append it to this array.

---

## Managing users

### Add a new user

1. Add the email to `ALLOWED_EMAILS` in **both** `.env.local` and Vercel.
   - In Vercel: Project → Settings → Environment Variables → edit `ALLOWED_EMAILS` for Production and Preview.
   - **Redeploy** Vercel after editing.
2. Create the account (against whichever DB you want):

   ```bash
   npm run auth:create-user -- <email> <password> [name]
   ```

   The script reads `DATABASE_URL` from `.env.local`. To create the account on
   the production DB instead, override the env var inline:

   ```bash
   DATABASE_URL='<neon-prod-url>' \
   BETTER_AUTH_SECRET='<prod-secret>' \
   ALLOWED_EMAILS='<same-list-as-prod>' \
     npx tsx scripts/create-user.ts <email> <password>
   ```

3. Share the temporary credentials with the user. They sign in at
   `/dashboard/login` and immediately change their password at
   `/dashboard/account`.

### Reset a user's password

Re-run the same command with a new password — the script detects the existing
user and updates the hash:

```bash
npm run auth:create-user -- <email> <new-password>
```

### Revoke a user's access

1. Remove the email from `ALLOWED_EMAILS` in `.env.local` and Vercel.
2. Redeploy.

The user's existing session continues to work until it expires, but they cannot
sign in again. To force-revoke now, delete the row from the `session` table:

```sql
DELETE FROM session WHERE user_id = (SELECT id FROM "user" WHERE email = 'them@example.com');
```

Optionally also delete the user entirely:

```sql
DELETE FROM "user" WHERE email = 'them@example.com';
-- cascade deletes session + account rows
```

---

## Local dev

```bash
npm run dev
```

- Login: <http://localhost:3000/dashboard/login>
- Account: <http://localhost:3000/dashboard/account>

`.env.local` should contain:

```env
DATABASE_URL=postgresql://…@…/cmsdb
BETTER_AUTH_SECRET=…
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
ALLOWED_EMAILS=you@example.com
```

---

## Production checklist

Before going live, verify the following on Vercel:

- [ ] `DATABASE_URL` points at the production Postgres
- [ ] `BETTER_AUTH_SECRET` is set (don't reuse the local-dev one)
- [ ] `BETTER_AUTH_URL` matches the deployed URL exactly (including `https://`)
- [ ] `NEXT_PUBLIC_APP_URL` matches `BETTER_AUTH_URL`
- [ ] `ALLOWED_EMAILS` contains the production allow-list
- [ ] At least one user has been created via `scripts/create-user.ts` against the production DB
- [ ] The Vercel domain is in `trustedOrigins` (`src/lib/auth/auth.ts`)

---

## Troubleshooting

**"This email is not permitted to register."**
The email isn't in `ALLOWED_EMAILS`. Add it (and redeploy on Vercel).

**"Invalid credentials."**
Wrong password, or the account doesn't exist yet. Run `auth:create-user` to
provision it.

**Sign-in succeeds on localhost but redirects to login on production.**
`BETTER_AUTH_URL` is probably wrong, or the production domain isn't in
`trustedOrigins`. Double-check both.

**Logged in but instantly redirected back to login.**
The session cookie isn't being set under the production domain — usually means
`BETTER_AUTH_URL` doesn't match the actual deployment URL. Cookies are scoped
to the URL Better Auth thinks it is.

**Sessions disappear between deploys.**
You rotated `BETTER_AUTH_SECRET`. Don't rotate it unless you intend to
invalidate every session.
