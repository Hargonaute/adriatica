import type { Metadata } from "next";
import { CatalogueSection } from "@/components/home/CatalogueSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ProduitsSection } from "@/components/home/ProduitsSection";
import { ProduitsHero } from "@/components/produits/ProduitsHero";
import { NewsletterCTA } from "@/components/shared/NewsletterCTA";

export const metadata: Metadata = {
  title: "Nos produits",
  description:
    "Découvrez la gamme de produits Adriatica : solutions agronomiques conçues pour améliorer la productivité agricole tout en préservant l'environnement.",
};

export default function ProduitsPage() {
  return (
    <div className="min-h-screen bg-white">
      <ProduitsHero />
      <ProduitsSection />
      <CatalogueSection />
      <ContactSection />
      <NewsletterCTA />
    </div>
  );
}
