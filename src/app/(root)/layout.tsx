import type { Metadata } from 'next';
import { RootDocument } from '../_shell/RootDocument';
import { ROOT_METADATA } from '../_shell/rootMetadata';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

// Root layout of "/" only: that page just redirects to /{DEFAULT_LOCALE}.
// It lives in its own route group because the public site's root layout is
// (site)/[locale]/layout.tsx and "/" has no locale.
export const metadata: Metadata = ROOT_METADATA;

export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang={DEFAULT_LOCALE}>{children}</RootDocument>;
}
