"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Search } from "lucide-react";
import type { NavLink } from "./nav-types";

export interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        className="lg:hidden inline-flex items-center justify-center h-11 w-11 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <Menu size={22} />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-[86%] max-w-sm bg-white shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 h-20 border-b border-slate-100">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="inline-flex items-center justify-center h-11 w-11 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col px-4 py-4 gap-1">
              {links.map((link) => {
                const active =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href + "/"));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center min-h-[48px] px-3 rounded-md text-[16px] font-semibold transition-colors ${
                      active
                        ? "bg-[#BC0D2A]/10 text-[#BC0D2A]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="px-5 pb-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-1.5 h-11 px-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
              >
                FR <ChevronDown size={14} className="text-slate-400" />
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 h-11 px-4 rounded-md border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Search size={16} strokeWidth={2.5} />
                Rechercher
              </button>
              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center h-11 px-5 rounded-md bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors shadow-sm shadow-red-500/20"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
