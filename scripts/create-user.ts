/* eslint-disable no-console */
import { config as loadEnv } from 'dotenv';
loadEnv({ path: '.env.local' });
loadEnv({ path: '.env' });

/**
 * Create (or update the password of) a user that is on the ALLOWED_EMAILS list.
 *
 * Usage:
 *   npm run auth:create-user -- <email> <password> [name]
 *   npx tsx scripts/create-user.ts <email> <password> [name]
 *
 * Requires the same env file as the app (DATABASE_URL, BETTER_AUTH_SECRET,
 * ALLOWED_EMAILS). Public signup is disabled in auth.ts; this script writes
 * directly to the DB using Better Auth's password hashing.
 */
async function main() {
  const [emailArg, passwordArg, nameArg] = process.argv.slice(2);

  if (!emailArg || !passwordArg) {
    console.error('Usage: npm run auth:create-user -- <email> <password> [name]');
    process.exit(1);
  }

  // Dynamic imports so dotenv loads before the db pool reads DATABASE_URL.
  const { randomUUID } = await import('node:crypto');
  const { eq } = await import('drizzle-orm');
  const { db } = await import('../src/lib/db/drizzle');
  const { user, account } = await import('../src/lib/db/schema');
  const { auth } = await import('../src/lib/auth/auth');
  const { isEmailAllowed, getAllowedEmails } = await import(
    '../src/lib/auth/allowed-emails'
  );

  const email = emailArg.trim().toLowerCase();

  if (!isEmailAllowed(email)) {
    console.error(`✗ Email "${email}" is not on the ALLOWED_EMAILS list.`);
    console.error(`  Current allow-list: ${getAllowedEmails().join(', ') || '(empty)'}`);
    console.error('  Add it to ALLOWED_EMAILS in your env, then rerun.');
    process.exit(1);
  }

  const ctx = await auth.$context;
  const hash = await ctx.password.hash(passwordArg);

  const existing = await db.select().from(user).where(eq(user.email, email)).limit(1);

  if (existing.length > 0) {
    const existingUser = existing[0];
    const accounts = await db
      .select()
      .from(account)
      .where(eq(account.userId, existingUser.id));
    const credAccount = accounts.find((a) => a.providerId === 'credential');

    if (credAccount) {
      await db
        .update(account)
        .set({ password: hash, updatedAt: new Date() })
        .where(eq(account.id, credAccount.id));
      console.log(`✓ Updated password for existing user ${email}`);
    } else {
      await db.insert(account).values({
        id: randomUUID(),
        accountId: existingUser.id,
        providerId: 'credential',
        userId: existingUser.id,
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✓ Added credential account for existing user ${email}`);
    }
  } else {
    const userId = randomUUID();
    const now = new Date();
    await db.insert(user).values({
      id: userId,
      email,
      name: nameArg ?? email.split('@')[0],
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    });
    await db.insert(account).values({
      id: randomUUID(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: hash,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`✓ Created user ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Failed to create user:', err);
  process.exit(1);
});
