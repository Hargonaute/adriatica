import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

export interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
}

const DEFAULT_HEADLINE = "Bienvenue chez Maghreb Adriatica";
const DEFAULT_SUBHEADLINE =
  "ADRIATICA propose des solutions agronomiques afin d'améliorer la productivité agricole tout en respectant l'environnement et la durabilité des écosystèmes.";
const DEFAULT_PRIMARY_LABEL = "Contactez-nous";
const DEFAULT_PRIMARY_URL = "#contact";
const DEFAULT_SECONDARY_LABEL = "Rechercher un produit";
const DEFAULT_SECONDARY_URL = "#search";
const DEFAULT_IMAGE_URL =
  "/home_page_img/Adriatica Web Mockup.png";
const DEFAULT_IMAGE_ALT =
  "Agricultural field viewed from above with a tractor harvesting";

export function HeroSection({
  headline = DEFAULT_HEADLINE,
  subheadline = DEFAULT_SUBHEADLINE,
  primaryCtaLabel = DEFAULT_PRIMARY_LABEL,
  primaryCtaUrl = DEFAULT_PRIMARY_URL,
  secondaryCtaLabel = DEFAULT_SECONDARY_LABEL,
  secondaryCtaUrl = DEFAULT_SECONDARY_URL,
  imageUrl = DEFAULT_IMAGE_URL,
  imageAlt = DEFAULT_IMAGE_ALT,
}: HeroSectionProps = {}) {
  return (
    <section className="pt-24 pb-16 px-6 lg:px-8 max-w-[1400px] mx-auto text-center">
      {/* Title & Subtitle */}
      <div className="max-w-4xl mx-auto space-y-6">
        {headline && (
          <h1 className="font-[family-name:var(--font-inter)] font-semibold text-[60px] leading-[72px] tracking-[-0.02em] text-center text-slate-900">
            {headline}
          </h1>
        )}
        {subheadline && (
          <p className="text-lg sm:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(primaryCtaLabel || secondaryCtaLabel) && (
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {secondaryCtaLabel && (
            <Link
              href={secondaryCtaUrl}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm w-full sm:w-auto justify-center"
            >
              <Search size={18} className="text-slate-400" />
              {secondaryCtaLabel}
            </Link>
          )}
          {primaryCtaLabel && (
            <Link
              href={primaryCtaUrl}
              className="px-8 py-3.5 rounded-xl bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-all shadow-md shadow-red-500/20 w-full sm:w-auto justify-center"
            >
              {primaryCtaLabel}
            </Link>
          )}
        </div>
      )}

      {/* Hero Image */}
      {imageUrl && (
        <div className="mt-16 w-full max-w-[1200px] mx-auto aspect-[16/9] md:aspect-[21/9] rounded-[2rem] overflow-hidden bg-slate-100 shadow-2xl relative">
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            className="object-cover hover:scale-105 transition-transform duration-1000"
            priority
          />
        </div>
      )}
    </section>
  );
}
