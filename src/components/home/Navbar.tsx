import { NavLogo } from "./NavLogo";
import { NavLinks } from "./NavLinks";
import { NavActions } from "./NavActions";

export interface NavbarProps {}

export function Navbar(_props: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-[1400px] mx-auto flex h-20 items-center justify-between px-6 lg:px-8">
        <NavLogo />
        <NavLinks />
        <NavActions />
      </div>
    </nav>
  );
}
