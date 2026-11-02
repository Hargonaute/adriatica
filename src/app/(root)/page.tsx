import { permanentRedirect } from 'next/navigation';
import { DEFAULT_LOCALE } from '@/lib/i18n/config';

export default function RootSiteIndex() {
  // 308: the root always maps to the default locale (A3).
  permanentRedirect(`/${DEFAULT_LOCALE}`);
}
