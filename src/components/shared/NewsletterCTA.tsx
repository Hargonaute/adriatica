'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import type { Locale } from '@/lib/i18n/config';
import commonData from '@/data/common.json';
import { sendWeb3Form, WEB3FORMS_HONEYPOT } from '@/lib/forms/web3forms';

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
  /** @deprecated Ignored: sign-ups are emailed (see lib/forms/web3forms). */
  collectionSlug?: string;
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
      const email = String(fd.get('email') ?? '').trim();
      await sendWeb3Form(
        `Nouvelle inscription à la newsletter — ${email}`,
        { email, 'Langue': locale.toUpperCase(), 'Page': window.location.href },
        fd.get(WEB3FORMS_HONEYPOT) !== null
      );

      setSuccess(true);
    } catch {
      setError(L.errorSubmit);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className={`${sectionBgMap[sectionBg]} w-full py-16 md:py-24`} data-reveal>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
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
                <input
                  type="checkbox"
                  name={WEB3FORMS_HONEYPOT}
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
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
