import { NavLogo } from "./NavLogo";
import { NavLinks } from "./NavLinks";
import { NavActions } from "./NavActions";
import { MobileNav } from "./MobileNav";
import type { NavLink } from "./nav-types";

export interface NavbarShellProps {
  links: NavLink[];
}

export function NavbarShell({ links }: NavbarShellProps) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto flex h-20 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <NavLogo />
        <NavLinks links={links} />
        <div className="flex items-center gap-2 sm:gap-4">
          <NavActions />
          <MobileNav links={links} />
        </div>
      </div>
    </nav>
  );
}

export const PREVIEW_NAV_LINKS: NavLink[] = [
  { label: "Recherche et Développement", href: "/recherche-et-developpement" },
  { label: "Produits", href: "/produits" },
  { label: "Trouver une solution", href: "/trouver-une-solution" },
  { label: "Contact", href: "/contact" },
];
