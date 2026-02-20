import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-muted/10 p-8">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">CMS Page Builder</h1>
          <p className="text-muted-foreground text-lg">
            A no-code landing page builder with bilingual (EN/AR) support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Open Dashboard
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            View README
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <p className="font-semibold text-sm">Visual Builder</p>
            <p className="text-xs text-muted-foreground">
              Drag-and-drop blocks with live preview and JSON view.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <p className="font-semibold text-sm">EN / AR</p>
            <p className="text-xs text-muted-foreground">
              Bilingual content with RTL support for Arabic.
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4 space-y-1">
            <p className="font-semibold text-sm">Extensible</p>
            <p className="text-xs text-muted-foreground">
              Add a new block type in one file — no renderer changes.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
