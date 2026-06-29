import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface EntrepriseSectionProps {}

export function EntrepriseSection(_props: EntrepriseSectionProps) {
  return (
    <section className="bg-white w-full py-24" id="entreprise">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            L&apos;Entreprise
          </h2>
          <Link
            href="#decouvrir"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#BC0D2A] text-white font-medium hover:bg-[#9A0B22] transition-colors shadow-sm w-fit"
          >
            Découvrir{" "}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          {/* Text Content */}
          <div className="space-y-6 text-[17px] text-slate-600 leading-relaxed font-medium">
            <p>
              Crée au Maroc en 2012, Maghreb Adriatica, filiale du Groupe
              ADRIATICA au Maroc propose des solutions agronomiques issues
              d&apos;une recherche scientifique approfondie afin d&apos;améliorer
              la productivité agricole tout en respectant l&apos;environnement et
              durabilité des écosystèmes.
            </p>
            <p>
              La société se donne comme objectif d&apos;optimiser le développement
              des produits du Brand ADRIATICA au Maroc.
            </p>
            <p>
              La société Maghreb Adriatica a pour mission de prospecter le
              marché et d&apos;assurer la commercialisation auprès des
              Agri-Preneurs au Maroc.
            </p>
            <p>
              Mener des actions de Développement, de Marketing adaptés avec ses
              partenaires locaux afin de les accompagner en appliquant une
              approche de proximité sont les principales priorités et
              engagements de la société.
            </p>
            <p>
              Nous sommes un Groupe international qui combine sa propre
              expérience avec des défis toujours nouveaux, en misant avec
              confiance sur le développement constant de son identité
              d&apos;excellence, sans jamais oublier ses racines.
            </p>
          </div>

          {/* Image */}
          <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-100 shadow-xl">
            <Image
              src="/home_page_img/Adriatica Web Photo.png"
              alt="Maghreb Adriatica Building"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
