import { db } from '@/lib/db';
import { pages } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, Edit, Globe } from 'lucide-react';
import Link from 'next/link';
import { DeletePageButton } from '@/components/dashboard/DeletePageButton';

// Force dynamic rendering to always get latest pages
export const dynamic = 'force-dynamic';

export default async function PagesDashboard() {
  const allPages = await db.select().from(pages).orderBy(desc(pages.updatedAt));

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
          <div>
             <h1 className="text-3xl font-bold tracking-tight">Pages</h1>
             <p className="text-muted-foreground">Manage your website content.</p>
          </div>
          <Link href="/dashboard/pages/new">
             <Button><Plus className="mr-2 h-4 w-4" /> Create Page</Button>
          </Link>
       </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allPages.length === 0 ? (
              <div className="col-span-full text-center py-20 border rounded-lg bg-muted/20 text-muted-foreground">
                  No pages found. Create one to get started.
              </div>
          ) : (
              allPages.map(page => (
                  <Card key={page.id} className="hover:border-primary transition-colors">
                      <CardHeader className="pb-2">
                          <CardTitle className="flex items-center justify-between">
                              <span className="truncate">{page.title}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  page.status === 'published' 
                                  ? 'bg-green-100 text-green-700 border-green-200' 
                                  : 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                              }`}>
                                  {page.status?.toUpperCase() || 'DRAFT'}
                              </span>
                          </CardTitle>
                          <CardDescription className="font-mono text-xs truncate">/{page.slug}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2 pt-2">
                          <Link href={`/dashboard/pages/${page.id}`} className="flex-1">
                              <Button variant="outline" size="sm" className="w-full">
                                  <Edit className="mr-2 h-3 w-3" /> Edit
                              </Button>
                          </Link>
                          {page.status === 'published' && (
                              <Link href={`/${page.slug}`} target="_blank">
                                  <Button variant="secondary" size="sm">
                                      <Globe className="h-3 w-3" />
                                  </Button>
                              </Link>
                          )}
                          <DeletePageButton id={page.id} title={page.title} />
                      </CardContent>
                  </Card>
              ))
          )}
       </div>
    </div>
  );
}
