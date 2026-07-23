import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface EntrepriseSectionProps {
  heading: string;
  ctaLabel: string;
  ctaHref: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
}

export function EntrepriseSection({
  heading,
  ctaLabel,
  ctaHref,
  paragraphs,
  imageUrl,
  imageAlt,
}: EntrepriseSectionProps) {
  return (
    <section className="bg-white w-full py-24" id="entreprise">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            {heading}
          </h2>
          <Link
            href={ctaHref}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#BC0D2A] text-white font-medium hover:bg-[#9A0B22] transition-colors shadow-sm w-fit"
          >
            {ctaLabel}{' '}
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-stretch">
          <div className="space-y-6 text-[17px] text-slate-600 leading-relaxed font-medium">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          <div className="relative w-full h-full min-h-[400px] rounded-2xl overflow-hidden bg-slate-100 shadow-xl">
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
