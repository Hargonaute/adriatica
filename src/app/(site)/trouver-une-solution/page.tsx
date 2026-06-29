import { TrouverHero } from "@/components/trouver-une-solution/TrouverHero";
import { TrouverFilter } from "@/components/trouver-une-solution/TrouverFilter";
import { NewsletterCTA } from "@/components/shared/NewsletterCTA";

export default function TrouverUneSolutionPage() {
  return (
    <div className="min-h-screen bg-white">
      <TrouverHero />
      <TrouverFilter />
      <NewsletterCTA />
      

    </div>
  );
}
