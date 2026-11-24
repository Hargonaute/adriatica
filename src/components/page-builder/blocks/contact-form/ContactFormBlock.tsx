'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { type BlockData } from '@/types';
import { ContactInfoSection, type ContactInfoCard } from '@/components/contact/ContactInfoSection';
import { ContactSection } from '@/components/home/ContactSection';
import contactData from '@/data/pages/contact.json';
import homeData from '@/data/pages/home.json';

const defaultCards = contactData.fr.info.cards;
const defaultEmail = defaultCards[0].contact ?? '';
const defaultAddress = ('address' in defaultCards[1] ? defaultCards[1].address : []) as string[];
const defaultPhone = defaultCards[2].contact ?? '';
const defaultHours = defaultCards[2].body ?? '';

/** Textarea text → lines. Blank lines are kept while typing and dropped at render. */
function toLines(text: string): string[] {
  return text.split('\n');
}

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
        Messages are emailed to Adriatica (Web3Forms).
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

      <div className="pt-2 border-t space-y-4">
        <p className="text-xs font-medium">Contact details (info cards)</p>
        <p className="text-[10px] text-muted-foreground">
          Leave a field blank to use the site default shown as placeholder.
        </p>
        <div className="space-y-1.5">
          <Label className="text-xs">Email</Label>
          <Input
            type="email"
            value={block.contactEmail ?? ''}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            placeholder={defaultEmail}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Address (one line per row)</Label>
          <Textarea
            rows={4}
            value={(block.contactAddress ?? []).join('\n')}
            onChange={(e) => onChange({ contactAddress: toLines(e.target.value) })}
            placeholder={defaultAddress.join('\n')}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Phone</Label>
          <Input
            type="tel"
            value={block.contactPhone ?? ''}
            onChange={(e) => onChange({ contactPhone: e.target.value })}
            placeholder={defaultPhone}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Opening hours</Label>
          <Input
            value={block.contactHours ?? ''}
            onChange={(e) => onChange({ contactHours: e.target.value })}
            placeholder={defaultHours}
          />
        </div>
      </div>
    </div>
  );
}

// ── Preview ───────────────────────────────────────────────────────────────
// Pixel-perfect: reuses the real <ContactInfoSection> and <ContactSection>
// from the live /contact page. The form inside ContactSection emails the
// message via Web3Forms — same flow as the live site.

export function ContactFormPreview({ block }: { block: BlockData & { type: 'contact-form' } }) {
  const info = contactData.fr.info;
  const home = homeData.fr.contact;
  const email = block.contactEmail?.trim();
  const phone = block.contactPhone?.trim();
  const hours = block.contactHours?.trim();
  const address = ((block.contactAddress ?? []) as string[]).map((l) => l.trim()).filter(Boolean);
  const overrides: Record<string, Partial<ContactInfoCard>> = {
    message: email ? { contact: email, contactHref: `mailto:${email}` } : {},
    map: address.length ? { address } : {},
    phone: {
      ...(phone ? { contact: phone, contactHref: `tel:${phone.replace(/[^\d+]/g, '')}` } : {}),
      ...(hours ? { body: hours } : {}),
    },
  };
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
          ...overrides[c.icon],
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
