import { Geist, Geist_Mono, Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

// Shared <html>/<body> shell for the app's root layouts. There is no single
// src/app/layout.tsx any more: the public site's root layout lives under
// (site)/[locale] so <html lang> can follow the locale, and (dashboard),
// login and the "/" redirect each have their own root layout. They all render
// this component, so fonts, theme and toasts stay identical everywhere.
// (`_shell` is a private folder: nothing in it is routable.)

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

export function RootDocument({
  lang,
  children,
}: Readonly<{
  lang: string;
  children: React.ReactNode;
}>) {
  return (
    <html lang={lang} suppressHydrationWarning>
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
