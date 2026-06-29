import Image from "next/image";
import Link from "next/link";
import { FooterLinkColumn, FooterLink } from "./FooterLinkColumn";

export interface SiteFooterProps {}

const PRODUCT_LINKS: FooterLink[] = [
  { label: "R&D", href: "#" },
  { label: "Produits", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Solutions", href: "#" },
];

const SOCIAL_LINKS: FooterLink[] = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Linkedin", href: "#" },
];

export function SiteFooter(_props: SiteFooterProps) {
  return (
    <footer className="bg-[#0b0f19] w-full pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-8 mb-16">
          {/* Logo & Description */}
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
            <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
              Design amazing digital experiences that create more happy in the
              world.
            </p>
          </div>

          {/* Link Columns */}
          <div className="w-full lg:w-[30%] flex gap-16 lg:justify-center">
            <FooterLinkColumn heading="Product" links={PRODUCT_LINKS} />
            <FooterLinkColumn heading="Social" links={SOCIAL_LINKS} />
          </div>

          {/* Newsletter */}
          <div className="w-full lg:w-[35%] flex flex-col gap-4">
            <h4 className="text-slate-300 text-[15px] font-semibold tracking-wide mb-1">
              Stay up to date
            </h4>
            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-11 px-4 rounded-md border border-slate-700 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#BC0D2A]/50 placeholder:text-slate-500 text-[15px]"
              />
              <button
                type="submit"
                className="h-11 px-6 rounded-md bg-[#BC0D2A] text-white font-medium hover:bg-[#9A0B22] transition-colors whitespace-nowrap text-[15px]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Divider & Copyright */}
        <div className="pt-8 border-t border-slate-800 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm text-center md:text-left">
            Copyright 2025 - Adriatica S.p.A. - Strada Dogado 300/19-21 - Loreo
            (RO) - ITALIA - info (at) k-adriatica.it - P.IVA 01135290292
          </p>
          <div className="flex gap-6">
            <Link
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
