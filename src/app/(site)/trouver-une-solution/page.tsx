import type { Metadata } from "next";
import { TrouverHero } from "@/components/trouver-une-solution/TrouverHero";
import { TrouverFilter } from "@/components/trouver-une-solution/TrouverFilter";
import { NewsletterCTA } from "@/components/shared/NewsletterCTA";

export const metadata: Metadata = {
  title: "Trouver une solution",
  description:
    "Trouvez la solution agronomique Adriatica adaptée à vos cultures et à vos besoins grâce à notre outil de recherche par filtres.",
};

export default function TrouverUneSolutionPage() {
  return (
    <div className="min-h-screen bg-white">
      <TrouverHero />
      <TrouverFilter />
      <NewsletterCTA />
    </div>
  );
}
