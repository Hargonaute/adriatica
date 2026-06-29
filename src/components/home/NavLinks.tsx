import Link from "next/link";

export interface NavLinksProps {}

export function NavLinks(_props: NavLinksProps) {
  return (
    <div className="hidden lg:flex items-center gap-8">
      <Link
        href="#rd"
        className="text-[15px] font-semibold text-slate-700 hover:text-[#BC0D2A] transition-colors"
      >
        Recherche et Développement
      </Link>
      <Link
        href="#produits"
        className="text-[15px] font-semibold text-slate-700 hover:text-[#BC0D2A] transition-colors"
      >
        Produits
      </Link>
      <Link
        href="#contact"
        className="text-[15px] font-semibold text-slate-700 hover:text-[#BC0D2A] transition-colors"
      >
        Contact
      </Link>
      <Link
        href="#solutions"
        className="text-[15px] font-semibold text-slate-700 hover:text-[#BC0D2A] transition-colors"
      >
        Trouver une solution
      </Link>
    </div>
  );
}
