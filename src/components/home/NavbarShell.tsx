import { NavLogo } from './NavLogo';
import { NavLinks } from './NavLinks';
import { NavActions } from './NavActions';
import { MobileNav } from './MobileNav';
import type { NavLink } from './nav-types';
import type { Locale } from '@/lib/i18n/config';
import { loadCommon } from '@/lib/i18n/loadPageData';

export interface NavbarShellProps {
  locale: Locale;
  links: NavLink[];
}

export function NavbarShell({ locale, links }: NavbarShellProps) {
  const common = loadCommon(locale);
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto flex h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <NavLogo locale={locale} />
        <NavLinks links={links} />
        <div className="flex items-center gap-2 sm:gap-4">
          <NavActions locale={locale} />
          <MobileNav
            locale={locale}
            links={links}
            labels={{
              openMenu: common.nav.openMenuLabel,
              closeMenu: common.nav.closeMenuLabel,
              home: common.nav.homeLabel,
              contactCta: common.nav.contactCta,
            }}
          />
        </div>
      </div>
    </nav>
  );
}
