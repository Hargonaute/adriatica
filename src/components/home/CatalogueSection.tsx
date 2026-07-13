import Image from 'next/image';
import { Download } from 'lucide-react';

export interface CatalogueSectionProps {
  heading: string;
  ctaLabel: string;
  imageUrl: string;
  imageAlt: string;
}

export function CatalogueSection({ heading, ctaLabel, imageUrl, imageAlt }: CatalogueSectionProps) {
  return (
    <section className="bg-[#BC0D2A] w-full py-16 md:py-20 overflow-hidden" id="catalogue">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          <div className="w-full lg:w-[45%] text-white z-10 flex flex-col justify-center">
            <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tight mb-8 leading-[1.1]">
              {heading}
            </h2>
            <a
              href="/Adriatica Final Catalogue.pdf"
              download="Adriatica Final Catalogue.pdf"
              className="flex items-center justify-center gap-[6px] px-[18px] py-[12px] rounded-[8px] bg-white text-[#414651] font-[family-name:var(--font-inter)] border border-[#d5d7da] overflow-hidden shrink-0 w-fit hover:bg-slate-50 transition-colors"
              style={{
                boxShadow:
                  '0px 0px 0px 1px rgba(10, 13, 18, 0.18) inset, 0px -2px 0px rgba(10, 13, 18, 0.05) inset, 0px 1px 2px rgba(10, 13, 18, 0.05)',
              }}
            >
              <div className="flex items-center justify-center px-[2px]">
                <span className="relative leading-[24px] font-semibold text-[16px]">{ctaLabel}</span>
              </div>
              <Download className="w-[20px] max-h-full relative" strokeWidth={2} />
            </a>
          </div>

          <div className="w-full lg:w-[55%] relative flex items-center justify-center">
            <div className="relative w-full max-w-[650px] aspect-[4/3]">
              <Image src={imageUrl} alt={imageAlt} fill className="object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
