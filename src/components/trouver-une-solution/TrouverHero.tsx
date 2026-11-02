export interface TrouverHeroProps {
  heading: string;
  subheading: string;
  /**
   * Intro paragraphs of a filtered page (famille / culture, edited in the
   * dashboard). Shown instead of the subheading when present; plain text.
   */
  intro?: string[];
}

export function TrouverHero({ heading, subheading, intro = [] }: TrouverHeroProps) {
  return (
    <section className="bg-white w-full pt-16 pb-12 xl:pt-24" data-reveal>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-8">
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl md:text-[56px] font-bold text-slate-900 leading-[1.1] tracking-tight mb-5 uppercase">
            {heading}
          </h1>
          {intro.length > 0 ? (
            <div className="mb-8 space-y-3" data-testid="catalogue-intro">
              {intro.map((p, i) => (
                <p key={i} className="text-[17px] text-slate-600 font-medium whitespace-pre-line">
                  {p}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-[17px] text-slate-600 mb-8 font-medium">{subheading}</p>
          )}
        </div>
      </div>
    </section>
  );
}
