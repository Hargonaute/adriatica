'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import type { Locale } from '@/lib/i18n/config';
import commonData from '@/data/common.json';

export type NewsletterSectionBg = 'brand-red' | 'brand-green' | 'navy' | 'gray';

export interface NewsletterCTALabels {
  heading: string;
  body: string;
  buttonLabel: string;
  emailPlaceholder: string;
  consent: string;
  successMessage: string;
  errorGeneric: string;
  errorConfig: string;
  errorSubmit: string;
}

export interface NewsletterCTAProps {
  locale: Locale;
  labels?: Partial<NewsletterCTALabels>;
  imageUrl?: string;
  imageAlt?: string;
  sectionBg?: NewsletterSectionBg;
  /** Slug of the collection storing subscribers. Default: "newsletter". */
  collectionSlug?: string;
}

interface CollectionLite {
  id: string;
  slug: string;
}

const sectionBgMap: Record<NewsletterSectionBg, string> = {
  'brand-red': 'bg-[#BC0D2A]',
  'brand-green': 'bg-[#328542]',
  navy: 'bg-[#0b0f19]',
  gray: 'bg-slate-100',
};

const DEFAULT_IMAGE_URL =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop';
const DEFAULT_IMAGE_ALT = 'Beautiful farm field with green crops under a sunny sky';

export function NewsletterCTA({
  locale,
  labels,
  imageUrl = DEFAULT_IMAGE_URL,
  imageAlt = DEFAULT_IMAGE_ALT,
  sectionBg = 'brand-red',
  collectionSlug = 'newsletter',
}: NewsletterCTAProps) {
  const common = (commonData as Record<Locale, { newsletter: NewsletterCTALabels }>)[locale];
  const L: NewsletterCTALabels = { ...common.newsletter, ...labels };

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError(null);

    try {
      const fd = new FormData(e.currentTarget);
      const data = { email: fd.get('email') ?? '' };

      const collectionsRes = await fetch('/api/collections');
      if (!collectionsRes.ok) throw new Error(L.errorConfig);
      const collections: CollectionLite[] = await collectionsRes.json();
      const collection = collections.find((c) => c.slug === collectionSlug);
      if (!collection) throw new Error(L.errorConfig);

      const res = await fetch('/api/entries/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: collection.id, data }),
      });
      if (!res.ok) throw new Error(L.errorSubmit);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : L.errorGeneric);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`${sectionBgMap[sectionBg]} w-full py-16 md:py-24`}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="bg-white rounded-[2rem] overflow-hidden flex flex-col-reverse lg:flex-row shadow-xl">
          <div className="flex-1 p-10 md:p-14 lg:p-16 xl:p-20 flex flex-col justify-center">
            <h2 className="font-[family-name:var(--font-inter)] text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4">
              {L.heading}
            </h2>
            <p className="text-slate-500 text-lg mb-10 max-w-md">{L.body}</p>

            {success ? (
              <div className="w-full max-w-[500px] rounded-lg border border-green-200 bg-green-50 p-4">
                <p className="text-sm text-green-800 font-medium">{L.successMessage}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-[500px]">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex-1 flex flex-col gap-3">
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder={L.emailPlaceholder}
                      className="w-full h-11 px-4 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-[14px] placeholder:text-slate-400 text-slate-900"
                    />
                    <p className="text-[10px] text-slate-500 leading-snug">{L.consent}</p>
                    {error && (
                      <p className="text-xs text-red-600" role="alert">
                        {error}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-11 px-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold transition-colors shadow-sm whitespace-nowrap text-[14px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? '…' : L.buttonLabel}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="w-full lg:w-[45%] xl:w-[50%] shrink-0 p-4 sm:p-6 lg:p-8 flex">
            <div className="relative w-full h-full min-h-[300px] lg:min-h-full rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <Image src={imageUrl} alt={imageAlt} fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
