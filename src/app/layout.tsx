import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
