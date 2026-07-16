'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type ContactFormSimpleBlockData } from '@/types';
import { ContactSection } from '@/components/home/ContactSection';
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
        Renders the contact form and side image — without the info cards above.
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
          placeholder="Notre équipe serait ravie de vous entendre."
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

export function ContactFormSimplePreview({ block }: { block: Block }) {
  const home = homeData.fr.contact;
  return (
    <div className="bg-white w-full">
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
