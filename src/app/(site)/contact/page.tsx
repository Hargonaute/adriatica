import { ContactInfoSection } from "@/components/contact/ContactInfoSection";
import { ContactSection } from "@/components/home/ContactSection";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <ContactInfoSection />
      <ContactSection imageUrl="/home_page_img/Adriatica Web.jpg" />
    </div>
  );
}
//ff