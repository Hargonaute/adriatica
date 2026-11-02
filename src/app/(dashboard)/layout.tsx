import type { Metadata } from 'next';
import { RootDocument } from '../_shell/RootDocument';
import { ROOT_METADATA } from '../_shell/rootMetadata';

// Root layout of the dashboard (incl. /dashboard/login). lang stays "fr" as
// before: editors type French content and browsers spell-check by lang.
export const metadata: Metadata = ROOT_METADATA;

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="fr">{children}</RootDocument>;
}
