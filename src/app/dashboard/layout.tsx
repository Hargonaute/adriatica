import Link from 'next/link';
import { FileText, Database, Image as ImageIcon, Settings } from 'lucide-react';
import { SidebarSignOut } from '@/components/dashboard/SidebarSignOut';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/10 hidden md:flex flex-col">
        <div className="p-6 border-b">
           <Link href="/dashboard">
             <h2 className="text-xl font-bold tracking-tight">CMS Blueprint</h2>
           </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
           <Link href="/dashboard/pages" className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors">
              <FileText className="h-4 w-4" /> Pages
           </Link>
           <Link href="/dashboard/collections" className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors">
              <Database className="h-4 w-4" /> Collections
           </Link>
           <Link href="/dashboard/assets" className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors">
              <ImageIcon className="h-4 w-4" /> Assets
           </Link>
        </nav>
        <div className="p-4 border-t space-y-1">
           <Link href="/dashboard/settings/database" className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md hover:bg-muted text-foreground/80 hover:text-foreground transition-colors">
              <Settings className="h-4 w-4" /> Settings
           </Link>
           <SidebarSignOut />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
         {children}
      </main>
    </div>
  );
}
