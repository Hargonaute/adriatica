import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface RDSectionProps {
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
  imageAlt: string;
}

export function RDSection({ heading, body, ctaLabel, ctaHref, imageUrl, imageAlt }: RDSectionProps) {
  const headingLines = heading.split('\n');
  return (
    <section className="bg-white w-full pb-16 sm:pb-24" id="rd">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#BC0D2A] w-full rounded-2xl sm:rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-xl">
          <div className="p-8 sm:p-10 lg:p-14 xl:p-20 flex-1 flex flex-col justify-center text-white">
            <h2 className="font-[family-name:var(--font-inter)] text-[32px] sm:text-5xl lg:text-5xl xl:text-[56px] font-semibold tracking-tight mb-6 sm:mb-8 leading-[1.15]">
              {headingLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="text-white/90 text-base sm:text-[17px] leading-relaxed mb-8 sm:mb-10 max-w-lg font-medium">
              {body}
            </p>
            <Link
              href={ctaHref}
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 min-h-[44px] rounded-xl bg-white text-slate-800 font-semibold hover:bg-slate-50 transition-colors shadow-sm w-fit"
            >
              {ctaLabel}{' '}
              <ArrowRight
                size={18}
                className="text-slate-400 group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="w-full lg:w-[48%] xl:w-[50%] shrink-0 pt-8 px-8 sm:pt-12 sm:px-12 lg:pt-16 lg:pl-8 lg:pr-0 xl:pt-20 xl:pl-16 flex relative min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
            <div className="w-full h-full bg-white rounded-tl-[1.8rem] pt-[2px] pl-[2px] relative">
              <div className="relative w-full h-full rounded-tl-[1.7rem] overflow-hidden bg-black/5">
                <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
