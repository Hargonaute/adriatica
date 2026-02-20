import { redirect } from 'next/navigation';

// /login is no longer the primary auth entry point.
// Redirect to the real login page at /dashboard/login.
export default async function LoginRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = callbackUrl
    ? `/dashboard/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : '/dashboard/login';

  redirect(target);
}
