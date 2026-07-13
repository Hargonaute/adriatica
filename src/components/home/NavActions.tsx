import { Search } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { loadCommon } from '@/lib/i18n/loadPageData';
import { LanguageSwitcher } from './LanguageSwitcher';

export function NavActions({ locale }: { locale: Locale }) {
  const common = loadCommon(locale);
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <LanguageSwitcher locale={locale} variant="desktop" />
      <button
        aria-label={common.nav.searchLabel}
        className="hidden sm:inline-flex bg-[#BC0D2A] p-2.5 rounded-md text-white hover:bg-[#9A0B22] transition-colors shadow-sm shadow-red-500/20"
      >
        <Search size={20} strokeWidth={2.5} />
      </button>
    </div>
  );
}
