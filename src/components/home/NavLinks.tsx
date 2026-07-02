"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavLink } from "./nav-types";

export interface NavLinksProps {
  links: NavLink[];
}

export function NavLinks({ links }: NavLinksProps) {
  const pathname = usePathname();
  return (
    <div className="hidden lg:flex items-center gap-8">
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href + "/"));
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`text-[15px] font-semibold transition-colors ${
              active
                ? "text-[#BC0D2A]"
                : "text-slate-700 hover:text-[#BC0D2A]"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
