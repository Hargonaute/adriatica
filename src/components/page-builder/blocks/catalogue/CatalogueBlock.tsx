'use client';

import { type CatalogueBlockData } from '@/types';
import { Download } from 'lucide-react';
import homeData from '@/data/pages/home.json';

type Block = CatalogueBlockData;

// ── Editor ────────────────────────────────────────────────────────────────

export function CatalogueEditor(_props: { block: Block; onChange: (updates: Partial<Block>) => void }) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <p className="text-xs text-muted-foreground">
        Full-width red catalogue section. This block is fixed — heading, CTA
        label, and image always match the homepage catalogue section, and the
        download link always points to <code>/Adriatica Final Catalogue.pdf</code>.
      </p>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

export function CataloguePreview(_props: { block: Block }) {
  const home = homeData.fr.catalogue;
  const heading = home.heading;
  const ctaLabel = home.ctaLabel;
  const imageUrl = home.imageUrl;
  const imageAlt = home.imageAlt;
  const hasImage = imageUrl && !imageUrl.includes('REPLACE-ME');

  const responsiveCss = `
    /* Break out of the block wrapper's 1rem side padding (renderPreview.tsx)
       to reach both edges, without ever exceeding the wrapper's own width —
       so no horizontal scrollbar, unlike a 100vw breakout which overshoots by
       the vertical scrollbar's width. On routes that render blocks directly in
       <main> (product pages) this reaches the true screen edges; on routes that
       wrap blocks in a max-width container it fills that container. */
    .catalogue-bleed {
      width: calc(100% + 2rem);
      margin-left: -1rem;
      margin-right: -1rem;
    }
    @media (max-width: 767.98px) {
      .catalogue-row { flex-direction: column !important; gap: 3rem !important; }
      .catalogue-text { flex: 1 1 auto !important; width: 100% !important; }
      .catalogue-text h2 { font-size: 2.25rem !important; }
      .catalogue-image { flex: 1 1 auto !important; width: 100% !important; }
    }
    @container preview (max-width: 767.98px) {
      .catalogue-row { flex-direction: column !important; gap: 3rem !important; }
      .catalogue-text { flex: 1 1 auto !important; width: 100% !important; }
      .catalogue-text h2 { font-size: 2.25rem !important; }
      .catalogue-image { flex: 1 1 auto !important; width: 100% !important; }
    }
  `;

  return (
    <section className="catalogue-bleed" style={{ backgroundColor: '#BC0D2A', padding: '5rem 0' }}>
      <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem' }}>
        <div className="catalogue-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '3rem' }}>
          <div className="catalogue-text" style={{ flex: '0 0 45%', minWidth: 0, color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '2rem', lineHeight: 1.1 }}>
              {heading}
            </h2>
            <a
              href="/Adriatica Final Catalogue.pdf"
              download="Adriatica Final Catalogue.pdf"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '12px 18px', borderRadius: 8, background: 'white', color: '#414651', border: '1px solid #d5d7da', textDecoration: 'none', width: 'fit-content', fontWeight: 600, fontSize: 16, boxShadow: '0px 0px 0px 1px rgba(10,13,18,0.18) inset, 0px -2px 0px rgba(10,13,18,0.05) inset, 0px 1px 2px rgba(10,13,18,0.05)' }}
            >
              {ctaLabel}
              <Download size={20} strokeWidth={2} />
            </a>
          </div>
          <div className="catalogue-image" style={{ flex: '0 0 55%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={imageAlt} style={{ maxWidth: 650, width: '100%', aspectRatio: '4/3', objectFit: 'contain' }} />
            ) : (
              <div style={{ width: '100%', maxWidth: 650, aspectRatio: '4/3', border: '2px dashed rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)', borderRadius: 8, fontSize: 14 }}>
                No image
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
