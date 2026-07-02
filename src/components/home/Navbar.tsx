import { cache } from "react";
import { NavLogo } from "./NavLogo";
import { NavLinks } from "./NavLinks";
import { NavActions } from "./NavActions";
import { MobileNav } from "./MobileNav";
import { db, pages } from "@/lib/db";
import { and, eq, desc } from "drizzle-orm";
import type { NavLink } from "./nav-types";

export type { NavLink };

const HARDCODED_LINKS: NavLink[] = [
  { label: "Recherche et Développement", href: "/recherche-et-developpement" },
  { label: "Produits", href: "/produits" },
  { label: "Trouver une solution", href: "/trouver-une-solution" },
  { label: "Contact", href: "/contact" },
];

const getNavLinks = cache(async (): Promise<NavLink[]> => {
  try {
    const rows = await db
      .select({ slug: pages.slug, title: pages.title })
      .from(pages)
      .where(and(eq(pages.status, "published"), eq(pages.isTemplate, false)))
      .orderBy(desc(pages.updatedAt));

    const reservedSlugs = new Set(
      HARDCODED_LINKS.map((l) => l.href.replace(/^\//, ""))
    );

    const cmsLinks = rows
      .filter((p) => !reservedSlugs.has(p.slug))
      .map((p) => ({ label: p.title, href: `/${p.slug}` }));

    return [...HARDCODED_LINKS, ...cmsLinks];
  } catch (err) {
    console.error("Navbar: failed to load CMS pages", err);
    return HARDCODED_LINKS;
  }
});

export async function Navbar() {
  const links = await getNavLinks();
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
