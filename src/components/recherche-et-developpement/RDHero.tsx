import Image from 'next/image';
import Link from 'next/link';
import { Search, ArrowLeft, ArrowRight } from 'lucide-react';

export interface RDHeroProps {
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
}

export function RDHero({ heading, subheading, ctaLabel, ctaHref, imageUrl, imageAlt }: RDHeroProps) {
  const lines = heading.split('\n');
  return (
    <section className="bg-white w-full pt-16 pb-8 xl:pt-8">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mb-8">
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl md:text-[56px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-5">
            {lines.map((line, i) => (
              <span key={i}>
                {line}
                {i < lines.length - 1 && <br className="hidden sm:block" />}
              </span>
            ))}
          </h1>
          <p className="text-[17px] text-slate-600 mb-8 font-medium">{subheading}</p>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors shadow-sm text-[15px]"
          >
            <Search size={18} strokeWidth={2.5} />
            {ctaLabel}
          </Link>
        </div>

        <div className="w-full relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-100 shadow-xl mb-8 border border-slate-200/60">
          <Image src={imageUrl} alt={imageAlt} fill className="object-cover" priority />
        </div>


      </div>
    </section>
  );
}
