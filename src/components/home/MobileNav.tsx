"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import type { NavLink } from "./nav-types";

export interface MobileNavProps {
  links: NavLink[];
}

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const drawer = (
    <div
      className={`lg:hidden fixed inset-0 z-[100] bg-white flex flex-col transition-transform duration-300 ease-out ${
        open ? "translate-x-0" : "translate-x-full pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      {/* Header: logo + close */}
      <div className="flex items-center justify-between h-20 px-5 border-b border-slate-100 shrink-0">
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className="flex items-center"
          aria-label="Accueil"
        >
          <Image
            src="/images Adriatica/logo.png"
            alt="Maghreb Adriatica"
            width={222}
            height={32}
            className="h-7 w-auto"
          />
        </Link>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fermer le menu"
          className="inline-flex items-center justify-center h-11 w-11 rounded-md text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <X size={22} />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto">
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
              className={`flex items-center min-h-[56px] px-5 border-b border-slate-100 text-[16px] font-semibold transition-colors ${
                active
                  ? "text-[#BC0D2A] bg-[#BC0D2A]/5"
                  : "text-slate-800 hover:bg-slate-50"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: language + CTA */}
      <div className="shrink-0 border-t border-slate-100 px-5 pt-5 pb-6 flex flex-col gap-3 bg-white">
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3 text-sm font-semibold text-slate-700 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            FR <ChevronDown size={14} className="text-slate-400" />
          </button>
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center min-h-[44px] px-3 text-sm font-semibold text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
          >
            AR
          </button>
        </div>
        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          className="w-full inline-flex items-center justify-center min-h-[52px] px-5 rounded-md bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors shadow-sm shadow-red-500/20"
        >
          Contact
        </Link>
      </div>
    </div>
  );

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

      {mounted && createPortal(drawer, document.body)}
    </>
  );
}
