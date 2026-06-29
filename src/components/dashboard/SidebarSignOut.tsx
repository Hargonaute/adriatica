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
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Sign Out
    </button>
  );
}
