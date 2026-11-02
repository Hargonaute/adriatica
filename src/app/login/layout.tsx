import type { Metadata } from 'next';
import { RootDocument } from '../_shell/RootDocument';
import { ROOT_METADATA } from '../_shell/rootMetadata';

// Root layout for /login (which only redirects to /dashboard/login).
export const metadata: Metadata = ROOT_METADATA;

export default function LoginRootLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="fr">{children}</RootDocument>;
}
