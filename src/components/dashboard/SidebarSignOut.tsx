'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth/auth-client';

export function SidebarSignOut() {
  const router = useRouter();

  async function handleSignOut() {
    await signOut({
      fetchOptions: { onSuccess: () => router.push('/dashboard/login') },
    });
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors"
    >
      <LogOut className="h-4 w-4" /> Sign Out
    </button>
  );
}
