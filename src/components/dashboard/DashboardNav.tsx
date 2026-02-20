'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { signOut } from '@/lib/auth/auth-client';

const NAV_LINKS = [
  { href: '/dashboard/pages', label: 'Pages' },
  { href: '/dashboard/assets', label: 'Assets' },
  { href: '/dashboard/collections', label: 'Collections' },
  { href: '/dashboard/settings/database', label: 'Settings' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut({ fetchOptions: { onSuccess: () => router.push('/dashboard/login') } });
  }

  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center gap-6">
        <Link href="/dashboard" className="font-bold tracking-tight text-sm">
          CMS
        </Link>
        <nav className="flex gap-1 flex-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname.startsWith(href)
                  ? 'bg-muted font-medium text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={handleSignOut}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
