import Image from "next/image";
import Link from "next/link";
import { Search, ArrowLeft, ArrowRight } from "lucide-react";

export function RDHero() {
  return (
    <section className="bg-white w-full pt-16 pb-24 xl:pt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Content */}
        <div className="max-w-3xl mb-8">
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl md:text-[56px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-5">
            RECHERCHE ET <br className="hidden sm:block" />
            DÉVÉLOPPEMENT
          </h1>
          <p className="text-[17px] text-slate-600 mb-8 font-medium">
            Efficacité nutritionnelle élevée et protection de l'environnement
          </p>
          <Link
            href="#produits"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors shadow-sm text-[15px]"
          >
            <Search size={18} strokeWidth={2.5} />
            Rechercher un produit
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 shadow-xl mb-8 border border-slate-200/60">
          <Image
            src="/recheche_et_developpement_page/Adriatica Web.png"
            alt="Scientist weighing white powder on a laboratory scale"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Pagination Arrows */}
        <div className="flex items-center gap-4">
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-colors bg-white shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <button className="w-12 h-12 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-colors bg-white shadow-sm">
            <ArrowRight size={20} />
          </button>
        </div>

      </div>
    </section>
  );
}
