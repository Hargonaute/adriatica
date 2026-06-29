import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface RDSectionProps {}

export function RDSection(_props: RDSectionProps) {
  return (
    <section className="bg-white w-full pb-24" id="rd">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="bg-[#BC0D2A] w-full rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-xl">
          {/* Left Content */}
          <div className="p-10 lg:p-14 xl:p-20 flex-1 flex flex-col justify-center text-white">
            <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl lg:text-5xl xl:text-[56px] font-semibold tracking-tight mb-8 leading-[1.15]">
              Recherche et
              <br />
              Développement
            </h2>
            <p className="text-white/90 text-[17px] leading-relaxed mb-10 max-w-lg font-medium">
              Maghreb Adriatica est aux côtés des agriculteurs depuis plus de 50
              ans, dès lors elle a toujours cherché à satisfaire les demandes
              des clients et les besoins nutritionnels des différentes cultures
              dans le monde avec des propositions innovantes.
            </p>
            <Link
              href="#decouvrir-rd"
              className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors shadow-sm w-fit"
            >
              Découvrir{" "}
              <ArrowRight
                size={18}
                className="text-slate-400 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          {/* Right Image */}
          <div className="w-full lg:w-[48%] xl:w-[50%] shrink-0 pt-8 pl-8 sm:pt-12 sm:pl-12 lg:pt-16 lg:pl-8 xl:pt-20 xl:pl-16 flex relative min-h-[400px] lg:min-h-[500px]">
            <div className="w-full h-full bg-white rounded-tl-[1.8rem] pt-[2px] pl-[2px] relative">
              <div className="relative w-full h-full rounded-tl-[1.7rem] overflow-hidden bg-black/5">
                <Image
                  src="/home_page_img/Adriatica Web.jpg"
                  alt="Scientist working with pipette"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
