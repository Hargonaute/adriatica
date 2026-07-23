'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ContactFormSimpleBlockData } from '@/types';
import { ContactForm } from '@/components/home/ContactForm';
import { loadCommon } from '@/lib/i18n/loadPageData';
import homeData from '@/data/pages/home.json';

type Block = ContactFormSimpleBlockData;

// ── Editor ────────────────────────────────────────────────────────────────

export function ContactFormSimpleEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (updates: Partial<Block>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <p className="text-xs text-muted-foreground">
        Renders the contact form and side image — same image as the contact
        page, without the info cards above it. The image is fixed. The form
        posts to <code>/api/entries/create</code> against the <code>contact</code> collection.
      </p>
      <div className="space-y-1.5">
        <Label className="text-xs">Heading</Label>
        <Input
          value={block.heading ?? ''}
          onChange={(e) => onChange({ heading: e.target.value })}
          placeholder="Nous contacter"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Body Text</Label>
        <Input
          value={block.body ?? ''}
          onChange={(e) => onChange({ body: e.target.value })}
          placeholder="Notre équipe serait ravie de vous entendre."
        />
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────

const CONTACT_PAGE_IMAGE_URL = '/home_page_img/Adriatica Web.jpg';

export function ContactFormSimplePreview({ block }: { block: Block }) {
  const home = homeData.fr.contact;
  const common = loadCommon('fr');
  const heading = block.heading || home.heading;
  const body = block.body || home.body;
  const imageUrl = CONTACT_PAGE_IMAGE_URL;
  const imageAlt = home.imageAlt;
  const hasImage = imageUrl && !imageUrl.includes('REPLACE-ME');

  const responsiveCss = `
    @media (max-width: 767.98px) {
      .contact-form-simple-row { flex-direction: column !important; gap: 2.5rem !important; }
      .contact-form-simple-text { flex: 1 1 auto !important; padding-top: 0 !important; }
      .contact-form-simple-image { flex: 1 1 auto !important; width: 100% !important; height: 320px !important; }
    }
    @container preview (max-width: 767.98px) {
      .contact-form-simple-row { flex-direction: column !important; gap: 2.5rem !important; }
      .contact-form-simple-text { flex: 1 1 auto !important; padding-top: 0 !important; }
      .contact-form-simple-image { flex: 1 1 auto !important; width: 100% !important; height: 320px !important; }
    }
  `;

  return (
    <section style={{ backgroundColor: 'white', width: '100%', padding: '2rem 0' }}>
      <style dangerouslySetInnerHTML={{ __html: responsiveCss }} />
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 2rem' }}>
        <div className="contact-form-simple-row" style={{ display: 'flex', flexDirection: 'row', gap: '6rem', alignItems: 'start' }}>
          <div className="contact-form-simple-text" style={{ flex: '1 1 0', minWidth: 0, display: 'flex', flexDirection: 'column', paddingTop: '2rem' }}>
            {heading && (
              <h2 style={{ fontSize: '2.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a', marginBottom: '1rem' }}>
                {heading}
              </h2>
            )}
            {body && <p style={{ color: '#64748b', fontSize: 17, marginBottom: '3rem' }}>{body}</p>}
            <ContactForm labels={common.contactForm} />
          </div>
          <div className="contact-form-simple-image" style={{ flex: '1 1 0', minWidth: 0, height: 500, borderRadius: '2rem', overflow: 'hidden', backgroundColor: '#f1f5f9', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            {hasImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt={imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                No image
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
