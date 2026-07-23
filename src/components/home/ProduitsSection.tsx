import type { CSSProperties } from 'react';
import { ProduitCard } from './ProduitCard';

export interface ProduitItem {
  title: string;
  image: string;
}

export interface ProduitsSectionProps {
  heading: string;
  body: string;
  items: ProduitItem[];
}

export function ProduitsSection({ heading, body, items }: ProduitsSectionProps) {
  return (
    <section className="bg-white w-full py-24 border-t border-slate-100" id="produits">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl text-left mb-20" data-reveal>
          <h2 className="font-[family-name:var(--font-inter)] text-4xl font-bold tracking-tight text-slate-900 mb-4">
            {heading}
          </h2>
          <p className="text-lg text-slate-500">{body}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-20 mt-12">
          {items.map((product, idx) => (
            <div
              key={idx}
              data-reveal
              style={{ '--reveal-delay': `${(idx % 4) * 90}ms` } as CSSProperties}
            >
              <ProduitCard title={product.title} image={product.image} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
