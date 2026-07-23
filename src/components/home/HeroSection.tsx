import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { HeroProductSearch } from './HeroProductSearch';
import type { Locale } from '@/lib/i18n/config';

export interface HeroSectionProps {
  headline: string;
  subheadline: string;
  primaryCtaLabel: string;
  primaryCtaUrl: string;
  secondaryCtaLabel: string;
  secondaryCtaUrl: string;
  imageUrl: string;
  imageAlt: string;
  productSearchLocale?: Locale;
}

export function HeroSection({
  headline,
  subheadline,
  primaryCtaLabel,
  primaryCtaUrl,
  secondaryCtaLabel,
  secondaryCtaUrl,
  imageUrl,
  imageAlt,
  productSearchLocale,
}: HeroSectionProps) {
  return (
    <section className="pt-14 pb-12 sm:pt-20 sm:pb-16 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto text-center">
      <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6" data-reveal>
        {headline && (
          <h1 className="font-[family-name:var(--font-inter)] font-semibold text-[34px] leading-[1.1] sm:text-5xl sm:leading-tight md:text-[60px] md:leading-[72px] tracking-[-0.02em] text-center text-slate-900">
            {headline}
          </h1>
        )}
        {subheadline && (
          <p className="text-base sm:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            {subheadline}
          </p>
        )}
      </div>

      {(primaryCtaLabel || secondaryCtaLabel) && (
        <div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          data-reveal
          style={{ '--reveal-delay': '120ms' } as CSSProperties}
        >
          {secondaryCtaLabel && (
            productSearchLocale ? (
              <HeroProductSearch
                placeholder={secondaryCtaLabel}
                locale={productSearchLocale}
              />
            ) : (
              <Link
                href={secondaryCtaUrl}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm w-full sm:w-auto justify-center"
              >
                <Search size={18} className="text-slate-400" />
                {secondaryCtaLabel}
              </Link>
            )
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

      {imageUrl && (
        <div
          className="mt-10 sm:mt-16 w-full max-w-[1200px] mx-auto aspect-[16/9] md:aspect-[21/9] rounded-2xl sm:rounded-[2rem] overflow-hidden bg-slate-100 shadow-2xl relative"
          data-reveal="scale"
          style={{ '--reveal-delay': '220ms' } as CSSProperties}
        >
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
