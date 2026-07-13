import type { Locale } from '@/lib/i18n/config';
import { loadCommon } from '@/lib/i18n/loadPageData';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NavSearchButton } from './NavSearchButton';

export function NavActions({ locale }: { locale: Locale }) {
  const common = loadCommon(locale);
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <LanguageSwitcher locale={locale} variant="desktop" />
      <NavSearchButton locale={locale} searchLabel={common.nav.searchLabel} />
    </div>
  );
}
