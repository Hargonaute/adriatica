import type { Metadata } from 'next';
import { RootDocument } from '../_shell/RootDocument';
import { ROOT_METADATA } from '../_shell/rootMetadata';

// Root layout of the dashboard (incl. /dashboard/login). lang stays "fr" as
// before: editors type French content and browsers spell-check by lang.
// Admin UI is never indexed (A10); the X-Robots-Tag header is set in next.config.ts.
export const metadata: Metadata = {
  ...ROOT_METADATA,
  robots: { index: false, follow: false },
};

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="fr">{children}</RootDocument>;
}
