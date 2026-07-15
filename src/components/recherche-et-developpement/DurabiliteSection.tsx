export interface DurabiliteItem {
  term: string;
  detail: string;
}

export interface DurabiliteSectionEntry {
  heading: string;
  paragraphs?: string[];
  intro?: string;
  items?: DurabiliteItem[];
}

export interface DurabiliteSectionProps {
  sections: DurabiliteSectionEntry[];
}

export function DurabiliteSection({ sections }: DurabiliteSectionProps) {
  return (
    <section className="bg-white w-full py-8 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="max-w-5xl space-y-16">
          {sections.map((section, idx) => (
            <div key={idx} className="space-y-6 text-[15px] sm:text-base text-slate-600 leading-relaxed font-medium">
              <h2 className="font-[family-name:var(--font-inter)] text-2xl md:text-[28px] font-bold text-slate-900 tracking-tight mb-8 uppercase">
                {section.heading}
              </h2>
              {section.paragraphs?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {section.intro && <p className="mb-6">{section.intro}</p>}
              {section.items && (
                <ul className="space-y-4">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-slate-900 font-bold">•</span>
                      <span>
                        <strong className="text-slate-900 font-bold">{item.term}:</strong>{' '}
                        {item.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
