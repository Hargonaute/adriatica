import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

// Site-wide default metadata, moved verbatim from the former src/app/layout.tsx
// (plus metadataBase) and exported by every root layout. Pages override it
// through buildPageMetadata() (src/lib/seo/metadata.ts).
export const ROOT_METADATA: Metadata = {
  // Resolves relative og:image / twitter:image URLs to absolute ones.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Adriatica — Solutions agronomiques pour une agriculture durable",
    template: "%s | Adriatica",
  },
  description:
    "ADRIATICA propose des solutions agronomiques afin d'améliorer la productivité agricole tout en respectant l'environnement et la durabilité des écosystèmes.",
  applicationName: "Adriatica",
  keywords: [
    "Adriatica",
    "Maghreb Adriatica",
    "agronomie",
    "agriculture durable",
    "solutions agronomiques",
    "productivité agricole",
    "fertilisants",
    "engrais",
    "agriculture",
  ],
  authors: [{ name: "Maghreb Adriatica" }],
  creator: "Maghreb Adriatica",
  publisher: "Maghreb Adriatica",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Adriatica",
    title: "Adriatica — Solutions agronomiques pour une agriculture durable",
    description:
      "ADRIATICA propose des solutions agronomiques afin d'améliorer la productivité agricole tout en respectant l'environnement et la durabilité des écosystèmes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adriatica — Solutions agronomiques pour une agriculture durable",
    description:
      "ADRIATICA propose des solutions agronomiques afin d'améliorer la productivité agricole tout en respectant l'environnement et la durabilité des écosystèmes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
