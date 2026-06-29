import type { Metadata } from "next";
import { ContactInfoSection } from "@/components/contact/ContactInfoSection";
import { ContactSection } from "@/components/home/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez Adriatica pour toute question sur nos solutions agronomiques, nos produits ou nos services. Notre équipe est à votre écoute.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <ContactInfoSection />
      <ContactSection imageUrl="/home_page_img/Adriatica Web.jpg" />
    </div>
  );
}