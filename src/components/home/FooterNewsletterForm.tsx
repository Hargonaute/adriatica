'use client';

import { useState, type FormEvent } from 'react';
import { sendWeb3Form, WEB3FORMS_HONEYPOT } from '@/lib/forms/web3forms';
import type { Locale } from '@/lib/i18n/config';

export interface FooterNewsletterLabels {
  placeholder: string;
  button: string;
  success: string;
  error: string;
}

export function FooterNewsletterForm({
  locale,
  labels,
}: {
  locale: Locale;
  labels: FooterNewsletterLabels;
}) {
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
      setError(labels.error);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return <p className="text-sm text-green-400">{labels.success}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="checkbox"
        name={WEB3FORMS_HONEYPOT}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder={labels.placeholder}
          className="flex-1 h-11 px-4 rounded-md border border-slate-700 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/50 placeholder:text-slate-500 text-[15px]"
        />
        <button
          type="submit"
          disabled={submitting}
          className="h-11 px-6 rounded-md bg-[#BC0D2A] text-white font-medium hover:bg-[#9A0B22] transition-colors whitespace-nowrap text-[15px] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? '…' : labels.button}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
