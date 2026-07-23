import { notFound } from 'next/navigation';
import { Navbar } from '@/components/home/Navbar';
import { SiteFooter } from '@/components/home/SiteFooter';
import { ScrollReveal } from '@/components/shared/ScrollReveal';
import { LOCALES, isLocale, type Locale } from '@/lib/i18n/config';

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <>
      {/* Enable the reveal-on-view hidden state before first paint so there is
          no flash; without JS the class is never added and content stays shown. */}
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('reveal-ready')",
        }}
      />
      <Navbar locale={locale as Locale} />
      {children}
      <SiteFooter locale={locale as Locale} />
      <ScrollReveal />
    </>
  );
}
