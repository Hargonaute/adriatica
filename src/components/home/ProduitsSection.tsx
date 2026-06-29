import { ProduitCard } from "./ProduitCard";

export interface ProduitsSectionProps {}

const PRODUITS: { title: string; image: string }[] = [
  {
    title: "Acide",
    image: "/images Adriatica/Featured icon 1@2x.png",
  },
  {
    title: "Engrais azotés",
    image: "/images Adriatica/Featured icon 2@2x.png",
  },
  {
    title: "Engrais granulés conventionnels",
    image: "/images Adriatica/Featured icon 3@2x.png",
  },
  {
    title: "Engrais granulés tertiaires",
    image: "/images Adriatica/Featured icon 4@2x.png",
  },
  {
    title: "Engrais hydrosolubles",
    image: "/images Adriatica/Featured icon 5@2x.png",
  },
  {
    title: "NPK Hydrosolubles",
    image: "/images Adriatica/Featured icon 6@2x.png",
  },
  {
    title: "NPK Gel",
    image: "/images Adriatica/Featured icon 7@2x.png",
  },
  {
    title: "Biostimulants",
    image: "/images Adriatica/Featured icon 8@2x.png",
  },
  {
    title: "Correcteur de carence",
    image: "/images Adriatica/Featured icon 9@2x.png",
  },
  {
    title: "Céréales",
    image: "/images Adriatica/Featured icon 10@2x.png",
  },
];

export function ProduitsSection(_props: ProduitsSectionProps) {
  return (
    <section
      className="bg-white w-full py-24 border-t border-slate-100"
      id="produits"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="max-w-2xl text-left mb-20">
          <h2 className="font-[family-name:var(--font-inter)] text-4xl font-bold tracking-tight text-slate-900 mb-4">
            Nos Produits
          </h2>
          <p className="text-lg text-slate-500">
            Powerful, self-serve product and growth analytics to help you
            convert, engage, and retain more users. Trusted by over 4,000
            startups.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20 mt-12">
          {PRODUITS.map((product, idx) => (
            <ProduitCard key={idx} title={product.title} image={product.image} />
          ))}
        </div>
      </div>
    </section>
  );
}
