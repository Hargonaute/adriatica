import Image from "next/image";
import { Link2 } from "lucide-react";

export function SynergieSection() {
  return (
    <section className="bg-white w-full py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Title */}
        <h2 className="font-[family-name:var(--font-inter)] text-[24px] md:text-[28px] font-bold text-slate-900 tracking-tight mb-8">
          SYNERGIE
        </h2>

        {/* Text Content */}
        <div className="text-[15px] sm:text-base text-slate-600 leading-relaxed font-medium space-y-6 mb-16 max-w-5xl">
          <p>
            Chaque jour, chacun d'entre nous partage ses propres connaissances et ses propres expériences avec le reste du Groupe: en effet, c'est grâce à cette approche holistique - dans laquelle nous intégrons les connaissances de physiologie de la plante, de biologie moléculaire, de biochimie des principaux processus métaboliques, de chimie des matières premières et des sols et de gestion agronomique des cultures - que nous pouvons avoir des idées toujours neuves et créer des solutions qui répondent de manière plus efficace aux défis que l'agriculture du monde entier nous lance.
          </p>
          <p>
            C'est ainsi que nous avons également formulé les produits de notre catalogue : afin que chaque composante travaille en synergie.
          </p>
          <p>
            Les solutions nutritionnelles de Maghreb Adriatica ne sont pas des ingrédients individuels combinés, mais des formules basées sur des rapports spécifiques de composition et d'actions synergiques entre les composantes. C'est ce qui nous permet d'obtenir de meilleurs résultats que ceux que l'on obtiendrait en unissant simplement des substances actives individuelles. Chaque jour nous travaillons sur de nouvelles idées mais ce n'est qu'après une longue et minutieuse procédure d'essais en laboratoire et sur le terrain sur différentes cultures et dans différentes zones d'exploitation qu'elles se transforment en solutions pour les agriculteurs.
          </p>
          <p>
            C'est la seule façon: nos solutions, vos résultats !
          </p>
        </div>

        {/* Image Display */}
        <div className="w-full">
          <div className="w-full relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.2/1] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200/60">
            <Image
              src="/recheche_et_developpement_page/Adriatica Web copy 2.jpg"
              alt="Team discussing at a modern white desk lab environment"
              fill
              className="object-cover"
            />
          </div>
          
          {/* Caption */}
          <div className="flex items-center gap-1.5 text-slate-400 text-[13px]">
            <Link2 size={13} className="shrink-0" />
            <span>Image courtesy of Moose Photos via Pexels</span>
          </div>
        </div>

      </div>
    </section>
  );
}
