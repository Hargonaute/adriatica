import { CatalogueSection } from "@/components/home/CatalogueSection";
import { ContactSection } from "@/components/home/ContactSection";
import { ProduitsSection } from "@/components/home/ProduitsSection";
import { ProduitsHero } from "@/components/produits/ProduitsHero";
import { NewsletterCTA } from "@/components/shared/NewsletterCTA";

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
