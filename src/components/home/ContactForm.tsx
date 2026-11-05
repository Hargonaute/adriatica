'use client';

import { ChevronDown } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { sendWeb3Form, WEB3FORMS_HONEYPOT } from '@/lib/forms/web3forms';

export interface ContactFormLabels {
  firstNameLabel: string;
  firstNamePlaceholder: string;
  lastNameLabel: string;
  lastNamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  messageLabel: string;
  messagePlaceholder: string;
  consent: string;
  submitLabel: string;
  submittingLabel: string;
  successTitle: string;
  successBody: string;
  errorConfig: string;
  errorNoCollection: string;
  errorSubmit: string;
  errorGeneric: string;
}

export interface ContactFormProps {
  labels: ContactFormLabels;
  /** @deprecated Ignored: submissions are emailed (see lib/forms/web3forms). */
  collectionSlug?: string;
}

export function ContactForm({ labels }: ContactFormProps) {
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
      const get = (k: string) => String(fd.get(k) ?? '').trim();
      const phone = [get('phoneCountry'), get('phone')].filter(Boolean).join(' ');
      const name = `${get('firstName')} ${get('lastName')}`.trim();

      await sendWeb3Form(
        `Nouveau message de ${name} — site Adriatica`,
        {
          'Prénom': get('firstName'),
          'Nom': get('lastName'),
          email: get('email'),
          'Téléphone': get('phone') ? phone : '',
          'Message': get('message'),
          'Page': window.location.href,
        },
        fd.get(WEB3FORMS_HONEYPOT) !== null
      );

      setSuccess(true);
    } catch {
      setError(labels.errorSubmit);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-[500px] rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-semibold text-green-900 mb-1">{labels.successTitle}</p>
        <p className="text-sm text-green-800">{labels.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-[500px]">
      <input
        type="checkbox"
        name={WEB3FORMS_HONEYPOT}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-[14px] font-medium text-[#334155]">
            {labels.firstNameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            name="firstName"
            type="text"
            required
            placeholder={labels.firstNamePlaceholder}
            className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-[14px] font-medium text-[#334155]">
            {labels.lastNameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            name="lastName"
            type="text"
            required
            placeholder={labels.lastNamePlaceholder}
            className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[14px] font-medium text-[#334155]">
          {labels.emailLabel} <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder={labels.emailPlaceholder}
          className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[14px] font-medium text-[#334155]">{labels.phoneLabel}</label>
        <div className="flex relative">
          <select
            name="phoneCountry"
            defaultValue="FR"
            className="absolute left-0 top-0 bottom-0 w-20 px-3 bg-transparent border-r border-[#cbd5e1] rounded-l-lg text-sm text-[#475569] focus:outline-none appearance-none cursor-pointer z-10"
          >
            <option>FR</option>
            <option>MA</option>
          </select>
          <ChevronDown
            size={14}
            className="absolute left-14 top-1/2 -translate-y-1/2 text-slate-400 z-0 pointer-events-none"
          />
          <input
            name="phone"
            type="tel"
            placeholder={labels.phonePlaceholder}
            className="w-full h-11 pl-[90px] pr-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[14px] font-medium text-[#334155]">
          {labels.messageLabel} <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder={labels.messagePlaceholder}
          className="w-full p-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8] resize-y"
        />
      </div>

      <div className="flex items-start gap-3 pt-2">
        <input
          type="checkbox"
          id="privacy"
          required
          className="mt-1 h-4 w-4 rounded border-[#cbd5e1] text-[#BC0D2A] focus:ring-[#BC0D2A]"
        />
        <label
          htmlFor="privacy"
          className="text-sm text-[#64748b] leading-relaxed cursor-pointer select-none"
        >
          {labels.consent}
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-lg bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors shadow-sm mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? labels.submittingLabel : labels.submitLabel}
      </button>
    </form>
  );
}
