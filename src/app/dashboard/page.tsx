import Link from 'next/link';

const CARDS = [
  {
    href: '/dashboard/pages',
    title: 'Pages',
    description: 'Create and edit landing pages with the visual block builder.',
    emoji: '📄',
  },
  {
    href: '/dashboard/assets',
    title: 'Assets',
    description: 'Upload and manage images and videos via Vercel Blob.',
    emoji: '🖼️',
  },
  {
    href: '/dashboard/collections',
    title: 'Collections',
    description: 'Define form schemas and view submitted entries.',
    emoji: '🗂️',
  },
  {
    href: '/dashboard/settings/database',
    title: 'Settings',
    description: 'View database health, connection info, and run diagnostics.',
    emoji: '⚙️',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your pages, assets, and collections.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CARDS.map(({ href, title, description, emoji }) => (
          <Link
            key={href}
            href={href}
            className="rounded-lg border bg-card p-6 space-y-2 hover:border-foreground/30 hover:shadow-sm transition-all"
          >
            <div className="text-2xl">{emoji}</div>
            <h2 className="font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
