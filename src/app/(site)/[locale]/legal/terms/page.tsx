import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Maghreb Adriatica',
};

const content: Record<Locale, { title: string; sections: { heading: string; body: string }[] }> = {
  fr: {
    title: 'Conditions Générales d\'Utilisation',
    sections: [
      {
        heading: '1. Acceptation des conditions',
        body: 'En accédant à ce site, vous acceptez d\'être lié par les présentes conditions générales d\'utilisation, toutes les lois et réglementations applicables.',
      },
      {
        heading: '2. Utilisation du site',
        body: 'Ce site est fourni à titre informatif uniquement. Maghreb Adriatica se réserve le droit de modifier ou de supprimer tout contenu à tout moment sans préavis.',
      },
      {
        heading: '3. Propriété intellectuelle',
        body: 'Tout le contenu présent sur ce site, y compris les textes, images et logos, est la propriété exclusive de Maghreb Adriatica et est protégé par le droit d\'auteur.',
      },
      {
        heading: '4. Limitation de responsabilité',
        body: 'Maghreb Adriatica ne saurait être tenu responsable des dommages directs ou indirects résultant de l\'utilisation de ce site ou de l\'impossibilité d\'y accéder.',
      },
      {
        heading: '5. Loi applicable',
        body: 'Les présentes conditions sont régies par le droit marocain. Tout litige sera soumis à la compétence exclusive des tribunaux du Maroc.',
      },
    ],
  },
  en: {
    title: 'Terms & Conditions',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        body: 'By accessing this site, you agree to be bound by these terms and conditions, all applicable laws and regulations.',
      },
      {
        heading: '2. Use of the Site',
        body: 'This site is provided for informational purposes only. Maghreb Adriatica reserves the right to modify or remove any content at any time without notice.',
      },
      {
        heading: '3. Intellectual Property',
        body: 'All content on this site, including text, images, and logos, is the exclusive property of Maghreb Adriatica and is protected by copyright law.',
      },
      {
        heading: '4. Limitation of Liability',
        body: 'Maghreb Adriatica shall not be held liable for any direct or indirect damages resulting from the use of this site or inability to access it.',
      },
      {
        heading: '5. Governing Law',
        body: 'These terms are governed by Moroccan law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Morocco.',
      },
    ],
  },
};

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { title, sections } = content[locale];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 120px' }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#0f172a',
            marginBottom: 40,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {sections.map((s) => (
          <div key={s.heading} style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: 10,
              }}
            >
              {s.heading}
            </h2>
            <p style={{ fontSize: 16, color: '#475569', lineHeight: 1.7 }}>{s.body}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
