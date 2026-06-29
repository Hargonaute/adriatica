import { Navbar } from "@/components/home/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { TrustedBySection } from "@/components/home/TrustedBySection";
import { EntrepriseSection } from "@/components/home/EntrepriseSection";
import { ProduitsSection } from "@/components/home/ProduitsSection";
import { RDSection } from "@/components/home/RDSection";
import { CatalogueSection } from "@/components/home/CatalogueSection";
import { ContactSection } from "@/components/home/ContactSection";
import { SiteFooter } from "@/components/home/SiteFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-100 selection:text-red-900">

      <HeroSection />
      <TrustedBySection />
      <EntrepriseSection />
      <ProduitsSection />
      <RDSection />
      <CatalogueSection />
      <ContactSection />
  
    </div>
  );
}
