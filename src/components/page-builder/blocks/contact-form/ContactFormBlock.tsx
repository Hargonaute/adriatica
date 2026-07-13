'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BlockData } from '@/types';
import { ContactInfoSection } from '@/components/contact/ContactInfoSection';
import { ContactSection } from '@/components/home/ContactSection';
import contactData from '@/data/pages/contact.json';
import homeData from '@/data/pages/home.json';

// ── Editor ────────────────────────────────────────────────────────────────
// Minimal: only heading/body/side-image are configurable; everything else is
// identical to the live contact page and posts to the same endpoint.

export function ContactFormEditor({
  block,
  onChange,
}: {
  block: BlockData & { type: 'contact-form' };
  onChange: (updates: Partial<BlockData>) => void;
}) {
  return (
    <div className="space-y-4 p-4 border rounded-md">
      <p className="text-xs text-muted-foreground">
        Renders the full contact page — info cards, form, and side image — identical to the live site.
        The form posts to <code>/api/entries/create</code> against the <code>contact</code> collection.
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
          placeholder="Our friendly team would love to hear from you."
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Side Image URL</Label>
        <Input
          value={block.imageUrl ?? ''}
          onChange={(e) => onChange({ imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
        <p className="text-[10px] text-muted-foreground">Leave blank to use the default image.</p>
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────
// Pixel-perfect: reuses the real <ContactInfoSection> and <ContactSection>
// from the live /contact page. The form inside ContactSection posts to
// /api/entries/create — same endpoint as the live site.

export function ContactFormPreview({ block }: { block: BlockData & { type: 'contact-form' } }) {
  const info = contactData.fr.info;
  const home = homeData.fr.contact;
  return (
    <div className="bg-white w-full">
      <ContactInfoSection
        heading={info.heading}
        subheading={info.subheading}
        cards={info.cards.map((c) => ({
          icon: c.icon as 'message' | 'map' | 'phone',
          heading: c.heading,
          body: 'body' in c ? c.body : undefined,
          contact: 'contact' in c ? c.contact : undefined,
          contactHref: 'contactHref' in c ? c.contactHref : undefined,
          address: 'address' in c ? c.address : undefined,
        }))}
      />
      <ContactSection
        heading={block.heading || home.heading}
        body={block.body || home.body}
        imageUrl={block.imageUrl || home.imageUrl}
        imageAlt={home.imageAlt}
        locale="fr"
      />
    </div>
  );
}
