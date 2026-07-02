import { db } from '@/lib/db';
import { entries, fields } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { generateEntrySlug } from '@/lib/db/generateEntrySlug';

// Simple in-memory rate limiter — 10 submissions per IP per minute.
// Good enough for a single Node instance; move to Redis/KV if we scale out.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;
const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || entry.resetAt < now) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count += 1;
  return true;
}

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

function isEmpty(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  return false;
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const body = await request.json();

    if (!body.collectionId || !body.data || typeof body.data !== 'object') {
      return NextResponse.json({ error: 'Collection ID and Data required' }, { status: 400 });
    }

    // Honeypot: silently reject bots that fill a hidden "website" field.
    if (typeof body.data.website === 'string' && body.data.website.trim() !== '') {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    // Load the field schema for this collection to build a whitelist.
    const colFields = await db
      .select()
      .from(fields)
      .where(eq(fields.collectionId, body.collectionId));

    if (colFields.length === 0) {
      return NextResponse.json({ error: 'Invalid collection' }, { status: 400 });
    }

    const validKeys = new Set(colFields.map((f) => f.key));
    const requiredKeys = colFields.filter((f) => f.required).map((f) => f.key);

    // Strip any keys not defined in the collection schema.
    const submitted = body.data as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(submitted)) {
      if (validKeys.has(k)) sanitized[k] = v;
    }

    // Enforce required fields against the sanitized payload.
    const missing = requiredKeys.filter((k) => isEmpty(sanitized[k]));
    if (missing.length > 0) {
      return NextResponse.json(
        { error: 'Missing required fields', fields: missing },
        { status: 400 },
      );
    }

    const slug = await generateEntrySlug(body.collectionId, sanitized);

    const [newEntry] = await db
      .insert(entries)
      .values({
        collectionId: body.collectionId,
        data: sanitized,
        slug,
        status: 'published',
        publishedAt: new Date(),
      })
      .returning();

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('Create entry error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
