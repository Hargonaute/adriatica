import Link from "next/link";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkColumnProps {
  heading: string;
  links: FooterLink[];
}

export function FooterLinkColumn({ heading, links }: FooterLinkColumnProps) {
  return (
    <div className="flex flex-col gap-4">
      <h4 className="text-slate-400 text-sm font-semibold tracking-wide">
        {heading}
      </h4>
      <ul className="flex flex-col gap-3">
        {links.map((link) => {
          const className =
            "text-slate-300 hover:text-white transition-colors text-[15px] font-medium";
          // Social profiles are other sites: open them in a new tab.
          const external = /^https?:\/\//.test(link.href);
          return (
            <li key={link.label}>
              {external ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {link.label}
                </a>
              ) : (
                <Link href={link.href} className={className}>
                  {link.label}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
