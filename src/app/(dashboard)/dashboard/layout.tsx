import Image from 'next/image';
import Link from 'next/link';
import { FileText, Database, Image as ImageIcon, Settings, LayoutDashboard } from 'lucide-react';
import { SidebarSignOut } from '@/components/dashboard/SidebarSignOut';
import { db } from '@/lib/db';
import { collections } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/pages', label: 'Pages', icon: FileText },
  { href: '/dashboard/collections', label: 'Collections', icon: Database },
  { href: '/dashboard/assets', label: 'Assets', icon: ImageIcon },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const allCollections = await db.select().from(collections).orderBy(desc(collections.createdAt));

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-[#0b0f19] hidden md:flex flex-col shrink-0 fixed top-0 left-0 bottom-0 z-40 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10 shrink-0">
          <Link href="/" className="inline-flex items-center bg-white rounded-md px-3 py-2">
            <Image
              src="/images Adriatica/logo.png"
              alt="Maghreb Adriatica"
              width={222}
              height={32}
              priority
              className="h-7 w-auto"
            />
          </Link>
          <p className="text-white/30 text-[10px] mt-2.5 font-semibold tracking-widest uppercase">
            CMS Dashboard
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-0.5 transition-all">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </div>

          {/* Collections & Templates */}
          {allCollections.length > 0 && (
            <div className="mt-6">
              <p className="px-3 text-[10px] font-semibold tracking-widest text-white/40 uppercase mb-2">
                Collections
              </p>
              <div className="space-y-2 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
                {allCollections.map((col) => (
                  <div key={col.id} className="space-y-1 relative z-10">
                    <Link
                      href={`/dashboard/collections/${col.id}/items`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all text-sm font-medium group"
                    >
                      <Database className="h-3.5 w-3.5 shrink-0 group-hover:text-[#BC0D2A] transition-colors" />
                      {col.name}
                    </Link>
                    
                    {/* Template Links */}
                    {(col.indexPageId || col.detailTemplatePageId) && (
                      <div className="pl-9 pr-3 space-y-1">
                        {col.indexPageId && (
                          <Link
                            href={`/dashboard/pages/${col.indexPageId}`}
                            className="flex items-center gap-2 py-1 text-xs text-white/40 hover:text-white transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-indigo-400/50" />
                            Index Template
                          </Link>
                        )}
                        {col.detailTemplatePageId && (
                          <Link
                            href={`/dashboard/pages/${col.detailTemplatePageId}`}
                            className="flex items-center gap-2 py-1 text-xs text-white/40 hover:text-white transition-colors"
                          >
                            <span className="w-1 h-1 rounded-full bg-indigo-400/50" />
                            Detail Template
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5 shrink-0">
          <Link
            href="/dashboard/settings/database"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
          <SidebarSignOut />
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 md:pl-64">
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
