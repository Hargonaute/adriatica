import { notFound } from 'next/navigation';
import { Navbar } from '@/components/home/Navbar';
import { SiteFooter } from '@/components/home/SiteFooter';
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
      <Navbar locale={locale as Locale} />
      {children}
      <SiteFooter locale={locale as Locale} />
    </>
  );
}
