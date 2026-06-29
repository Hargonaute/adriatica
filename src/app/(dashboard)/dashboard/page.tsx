import Link from 'next/link';
import { db } from '@/lib/db';
import { pages, assets, collections } from '@/lib/db/schema';
import { count, desc } from 'drizzle-orm';
import { FileText, Database, Image as ImageIcon, ArrowRight, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [[pageCount], [assetCount], [collectionCount], recentPages] = await Promise.all([
    db.select({ count: count() }).from(pages),
    db.select({ count: count() }).from(assets),
    db.select({ count: count() }).from(collections),
    db
      .select({
        id: pages.id,
        title: pages.title,
        slug: pages.slug,
        status: pages.status,
        updatedAt: pages.updatedAt,
      })
      .from(pages)
      .orderBy(desc(pages.updatedAt))
      .limit(5),
  ]);

  const STATS = [
    { label: 'Total Pages', value: pageCount.count, icon: FileText, href: '/dashboard/pages' },
    { label: 'Assets', value: assetCount.count, icon: ImageIcon, href: '/dashboard/assets' },
    { label: 'Collections', value: collectionCount.count, icon: Database, href: '/dashboard/collections' },
  ];

  const QUICK_ACTIONS = [
    {
      href: '/dashboard/pages/new',
      icon: FileText,
      title: 'Create a Page',
      description: 'Build a new page with the visual block editor.',
    },
    {
      href: '/dashboard/assets',
      icon: ImageIcon,
      title: 'Upload Assets',
      description: 'Add images and videos to your media library.',
    },
    {
      href: '/dashboard/collections',
      icon: Database,
      title: 'Manage Collections',
      description: 'Define form schemas and view submitted entries.',
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Overview
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Welcome back — here&apos;s what&apos;s happening with your site.
          </p>
        </div>
        <Link
          href="/dashboard/pages/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#BC0D2A] text-white text-sm font-semibold rounded-lg hover:bg-[#9A0B22] transition-colors shadow-sm shadow-red-900/20"
        >
          <Plus className="h-4 w-4" />
          New Page
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 hover:border-[#BC0D2A]/50 hover:shadow-sm transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <Icon className="h-5 w-5 text-[#BC0D2A]" />
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-[#BC0D2A] group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Pages */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Recent Pages</h2>
          <Link
            href="/dashboard/pages"
            className="text-sm text-[#BC0D2A] hover:underline font-medium"
          >
            View all →
          </Link>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          {recentPages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No pages yet.{' '}
              <Link href="/dashboard/pages/new" className="text-[#BC0D2A] hover:underline">
                Create your first page
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentPages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {page.title}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">/{page.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                        page.status === 'published'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {page.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                    <Link
                      href={`/dashboard/pages/${page.id}`}
                      className="text-xs text-slate-400 hover:text-[#BC0D2A] font-medium transition-colors"
                    >
                      Edit →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="flex gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 hover:border-[#BC0D2A]/50 hover:shadow-sm transition-all group"
            >
              <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg h-fit shrink-0">
                <Icon className="h-5 w-5 text-[#BC0D2A]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#BC0D2A] transition-colors">
                  {title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
