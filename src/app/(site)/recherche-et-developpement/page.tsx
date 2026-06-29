import type { Metadata } from "next";
import { RDHero } from "@/components/recherche-et-developpement/RDHero";
import { SynergieSection } from "@/components/recherche-et-developpement/SynergieSection";
import { DurabiliteSection } from "@/components/recherche-et-developpement/DurabiliteSection";
import { ContactSection } from "@/components/home/ContactSection";

export const metadata: Metadata = {
  title: "Recherche et développement",
  description:
    "L'innovation au cœur d'Adriatica : recherche agronomique, synergies et engagement pour la durabilité des écosystèmes agricoles.",
};

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
