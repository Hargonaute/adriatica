import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/lib/i18n/config';

export const metadata: Metadata = {
  title: 'Privacy Policy | Maghreb Adriatica',
};

const content: Record<Locale, { title: string; sections: { heading: string; body: string }[] }> = {
  fr: {
    title: 'Politique de Confidentialité',
    sections: [
      {
        heading: '1. Collecte des données',
        body: 'Nous collectons les informations que vous nous fournissez directement, notamment lors de la soumission du formulaire de contact (nom, prénom, adresse e-mail, numéro de téléphone, message).',
      },
      {
        heading: '2. Utilisation des données',
        body: 'Les données collectées sont utilisées uniquement pour répondre à vos demandes et vous fournir les informations ou services demandés. Elles ne sont jamais vendues à des tiers.',
      },
      {
        heading: '3. Cookies',
        body: 'Notre site peut utiliser des cookies pour améliorer votre expérience de navigation. Vous pouvez configurer votre navigateur pour refuser les cookies, mais certaines fonctionnalités du site pourraient ne plus être disponibles.',
      },
      {
        heading: '4. Durée de conservation',
        body: 'Vos données personnelles sont conservées pendant la durée nécessaire à l\'accomplissement des finalités pour lesquelles elles ont été collectées, dans le respect de la législation en vigueur.',
      },
      {
        heading: '5. Vos droits',
        body: 'Conformément à la réglementation applicable, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits, contactez-nous via le formulaire de contact.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy',
    sections: [
      {
        heading: '1. Data Collection',
        body: 'We collect information you provide directly to us, including when you submit the contact form (first name, last name, email address, phone number, message).',
      },
      {
        heading: '2. Use of Data',
        body: 'Collected data is used solely to respond to your inquiries and provide the information or services requested. It is never sold to third parties.',
      },
      {
        heading: '3. Cookies',
        body: 'Our site may use cookies to improve your browsing experience. You can configure your browser to refuse cookies, but some site features may no longer be available.',
      },
      {
        heading: '4. Retention Period',
        body: 'Your personal data is retained for as long as necessary to fulfil the purposes for which it was collected, in compliance with applicable legislation.',
      },
      {
        heading: '5. Your Rights',
        body: 'In accordance with applicable regulations, you have the right to access, rectify, and delete your personal data. To exercise these rights, contact us via the contact form.',
      },
    ],
  },
};

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { title, sections } = content[locale];

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#fff' }}>
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '80px 24px 120px' }} data-reveal>
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
