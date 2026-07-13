import type { Locale } from '@/lib/i18n/config';

export type NavLink = { label: string; href: string };

export type LangLabels = {
  openMenu: string;
  closeMenu: string;
  home: string;
  language: string;
  search: string;
  contactCta: string;
};

export type NavProps = {
  locale: Locale;
};
