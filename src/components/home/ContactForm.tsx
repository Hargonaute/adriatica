"use client";

import { ChevronDown } from "lucide-react";
import { useState, type FormEvent } from "react";

export interface ContactFormProps {
  /** Slug of the collection where submissions are stored. Default: "contact". */
  collectionSlug?: string;
}

interface CollectionLite {
  id: string;
  slug: string;
}
//ddd
export function ContactForm({
  collectionSlug = "contact",
}: ContactFormProps = {}) {
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
      const data = {
        firstName: fd.get("firstName") ?? "",
        lastName: fd.get("lastName") ?? "",
        email: fd.get("email") ?? "",
        phoneCountry: fd.get("phoneCountry") ?? "",
        phone: fd.get("phone") ?? "",
        message: fd.get("message") ?? "",
      };

      const collectionsRes = await fetch("/api/collections");
      if (!collectionsRes.ok) throw new Error("Configuration introuvable.");
      const collections: CollectionLite[] = await collectionsRes.json();
      const collection = collections.find((c) => c.slug === collectionSlug);
      if (!collection) {
        throw new Error(
          `Aucune collection "${collectionSlug}" n'est configurée pour recevoir les messages.`
        );
      }

      const res = await fetch("/api/entries/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId: collection.id, data }),
      });
      if (!res.ok) throw new Error("Échec de l'envoi. Réessayez plus tard.");

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Une erreur est survenue."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-[500px] rounded-lg border border-green-200 bg-green-50 p-6">
        <p className="font-semibold text-green-900 mb-1">Merci !</p>
        <p className="text-sm text-green-800">
          Votre message a bien été envoyé. Nous reviendrons vers vous
          rapidement.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-[500px]">
      {/* First & Last Name row */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="flex-1 space-y-2">
          <label className="text-[14px] font-medium text-[#334155]">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            name="firstName"
            type="text"
            required
            placeholder="Prénom"
            className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
          />
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-[14px] font-medium text-[#334155]">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            name="lastName"
            type="text"
            required
            placeholder="Nom"
            className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label className="text-[14px] font-medium text-[#334155]">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          className="w-full h-11 px-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label className="text-[14px] font-medium text-[#334155]">
          Téléphone
        </label>
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
            placeholder="+33 99 99 99 99 99"
            className="w-full h-11 pl-[90px] pr-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8]"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label className="text-[14px] font-medium text-[#334155]">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Laissez nous votre message..."
          className="w-full p-3 rounded-lg border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/20 focus:border-[#BC0D2A] transition-colors text-sm placeholder:text-[#94a3b8] resize-y"
        />
      </div>

      {/* Privacy checkbox */}
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
          J&apos;autorise le traitement de mes données personnelles aux termes
          du décret législatif 196/2003.
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3.5 rounded-lg bg-[#BC0D2A] text-white font-semibold hover:bg-[#9A0B22] transition-colors shadow-sm mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? "Envoi…" : "Envoyer"}
      </button>
    </form>
  );
}
