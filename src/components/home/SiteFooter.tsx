import Image from 'next/image';
import Link from 'next/link';
import { FooterLinkColumn, type FooterLink } from './FooterLinkColumn';
import { FooterNewsletterForm } from './FooterNewsletterForm';
import type { Locale } from '@/lib/i18n/config';
import { loadCommon } from '@/lib/i18n/loadPageData';
import { pathForKey, type StaticPageKey } from '@/lib/i18n/pageSlugs';

const FOOTER_KEY_TO_PAGE: Record<string, StaticPageKey> = {
  rd: 'research-and-development',
  products: 'products',
  contact: 'contact',
  solution: 'solution',
};

export function SiteFooter({ locale }: { locale: Locale }) {
  const common = loadCommon(locale);
  const productLinks: FooterLink[] = common.footer.productLinks.map((l) => {
    const key = FOOTER_KEY_TO_PAGE[l.key];
    return { label: l.label, href: key ? pathForKey(key, locale) : '#' };
  });
  const socialLinks: FooterLink[] = common.footer.socialLinks.map((l) => ({
    label: l.label,
    href: l.href,
  }));

  return (
    <footer className="bg-[#0b0f19] w-full pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8 mb-16">
          <div className="w-full lg:w-[35%] flex flex-col gap-6">
            <div className="bg-white inline-flex items-center self-start px-4 py-3 rounded-md">
              <Image
                src="/images Adriatica/logo.png"
                alt="Maghreb Adriatica"
                width={222}
                height={32}
                className="h-8 w-auto"
              />
            </div>
            {/* TODO-CLIENT: footer text pending from Adriatica (A9); hidden while empty. */}
            {common.footer.description && (
              <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
                {common.footer.description}
              </p>
            )}
          </div>

          <div className="w-full lg:w-[30%] flex gap-16 lg:justify-center">
            <FooterLinkColumn heading={common.footer.productHeading} links={productLinks} />
            <FooterLinkColumn heading={common.footer.socialHeading} links={socialLinks} />
          </div>

          <div className="w-full lg:w-[35%] flex flex-col gap-4">
            <h4 className="text-slate-300 text-[15px] font-semibold tracking-wide mb-1">
              {common.footer.newsletterHeading}
            </h4>
            <FooterNewsletterForm
              locale={locale}
              labels={{
                placeholder: common.footer.newsletterPlaceholder,
                button: common.footer.newsletterButton,
                success: common.newsletter.successMessage,
                error: common.newsletter.errorSubmit,
              }}
            />
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
    
          <div className="flex gap-6">
            {common.footer.legal.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
