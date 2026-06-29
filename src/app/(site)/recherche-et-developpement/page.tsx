import { RDHero } from "@/components/recherche-et-developpement/RDHero";
import { SynergieSection } from "@/components/recherche-et-developpement/SynergieSection";
import { DurabiliteSection } from "@/components/recherche-et-developpement/DurabiliteSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function RechercheEtDeveloppement() {
  return (
    <div className="min-h-screen bg-white">
      <RDHero />
      <SynergieSection />
      <DurabiliteSection />
      <ContactSection />
    </div>
  );
}
