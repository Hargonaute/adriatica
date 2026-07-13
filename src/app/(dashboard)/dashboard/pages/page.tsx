import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Plus, Edit, Globe, FileText } from 'lucide-react';
import Link from 'next/link';
import { DeletePageButton } from '@/components/dashboard/DeletePageButton';

export const dynamic = 'force-dynamic';

export default async function PagesDashboard() {
  const allPages = await db.select().from(pages).orderBy(desc(pages.updatedAt));
  const staticPages = allPages.filter((p) => !p.isTemplate);
  const templatePages = allPages.filter((p) => p.isTemplate);

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Pages</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {allPages.length} {allPages.length === 1 ? 'page' : 'pages'} total
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

      {/* Pages list */}
      {allPages.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 border-dashed rounded-xl text-center py-20">
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-xl w-fit mx-auto mb-4">
            <FileText className="h-7 w-7 text-[#BC0D2A]" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm">No pages yet</p>
          <p className="text-slate-400 text-xs mt-1 mb-5">
            Create your first page to get started.
          </p>
          <Link
            href="/dashboard/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#BC0D2A] text-white text-sm font-semibold rounded-lg hover:bg-[#9A0B22] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Page
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { label: 'Pages', items: staticPages },
            { label: 'Templates', items: templatePages },
          ]
            .filter(({ items }) => items.length > 0)
            .map(({ label, items }) => (
              <div key={label}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 px-1">
                  {label}
                </h2>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {items.map((page) => (
                      <div
                        key={page.id}
                        className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                      >
                        {/* Page info */}
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
                            <FileText className="h-4 w-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {page.title}
                            </p>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">/{page.slug}</p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0 ml-4">
                          {page.isTemplate && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200 uppercase">
                              {page.templateKind ?? 'template'}
                            </span>
                          )}
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                              page.status === 'published'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {page.status === 'published' ? 'PUBLISHED' : 'DRAFT'}
                          </span>

                          {page.status === 'published' && !page.isTemplate && (
                            <Link
                              href={`/fr/${page.slug}`}
                              target="_blank"
                              className="p-1.5 text-slate-400 hover:text-[#BC0D2A] transition-colors rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="View live page"
                            >
                              <Globe className="h-4 w-4" />
                            </Link>
                          )}

                          <Link
                            href={`/dashboard/pages/${page.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 transition-all"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                          </Link>

                          <DeletePageButton id={page.id} title={page.title} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
