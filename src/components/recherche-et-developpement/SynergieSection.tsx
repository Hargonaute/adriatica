import Image from 'next/image';
import { Link2 } from 'lucide-react';

export interface SynergieSectionProps {
  heading: string;
  paragraphs: string[];
  imageUrl: string;
  imageAlt: string;
  imageCaption: string;
}

export function SynergieSection({
  heading,
  paragraphs,
  imageUrl,
  imageAlt,
  imageCaption,
}: SynergieSectionProps) {
  return (
    <section className="bg-white w-full py-16 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-inter)] text-[24px] md:text-[28px] font-bold text-slate-900 tracking-tight mb-8">
          {heading}
        </h2>

        <div className="text-[15px] sm:text-base text-slate-600 leading-relaxed font-medium space-y-6 mb-16 max-w-5xl">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="w-full">
          <div className="w-full relative aspect-[4/3] sm:aspect-[16/9] lg:aspect-[2.2/1] rounded-2xl overflow-hidden bg-slate-100 mb-4 border border-slate-200/60">
            <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
          </div>

        </div>
      </div>
    </section>
  );
}
