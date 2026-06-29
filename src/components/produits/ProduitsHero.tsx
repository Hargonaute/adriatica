import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function ProduitsHero() {
  return (
    <section className="bg-white w-full pt-16 pb-24 xl:pt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Content */}
        <div className="max-w-3xl mb-12 text-[#475467]">
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl md:text-[56px] font-bold text-[#101828] leading-[1.1] tracking-tight mb-6">
            PRODUITS
          </h1>
          <div className="text-[17px] leading-relaxed mb-8 font-medium space-y-6">
            <p>
              Les solutions nutritionnelles de Maghreb Adriatica ne sont pas des ingrédients individuels combinés, mais des formules basées sur des rapports spécifiques de composition et d'actions synergiques entre les composantes.
            </p>
            <p>
              C'est ce qui nous permet d'obtenir de meilleurs résultats que ceux que l'on obtiendrait en unissant simplement des substances actives individuelles.
            </p>
          </div>
          <Link
            href="#catalogue"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors shadow-sm text-[15px]"
          >
            Voir notre Catalogue
            <ArrowRight size={18} strokeWidth={2.5} />
          </Link>
        </div>

        {/* Hero Image */}
        <div className="w-full relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 shadow-xl border border-slate-200/60">
          <Image
            src="/produit_page_img/Adriatica Web.jpg"
            alt="Scientist weighing white powder on a laboratory scale"
            fill
            className="object-cover"
            priority
          />
        </div>

      </div>
    </section>
  );
}
