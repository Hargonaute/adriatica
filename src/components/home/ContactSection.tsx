import Image from "next/image";
import { ContactForm } from "./ContactForm";

export interface ContactSectionProps {
  heading?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Forwarded to ContactForm — slug of the collection storing submissions. */
  collectionSlug?: string;
}

const DEFAULT_HEADING = "Nous contacter";
const DEFAULT_BODY = "Our friendly team would love to hear from you.";
const DEFAULT_IMAGE_URL = "/home_page_img/Adriatica Web copy.jpg";
const DEFAULT_IMAGE_ALT = "Person planting an onion sapling in rich brown soil";

export function ContactSection({
  heading = DEFAULT_HEADING,
  body = DEFAULT_BODY,
  imageUrl = DEFAULT_IMAGE_URL,
  imageAlt = DEFAULT_IMAGE_ALT,
  collectionSlug,
}: ContactSectionProps = {}) {
  return (
    <section className="bg-white w-full py-24 md:py-32" id="contact">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-start">
          {/* Left: Form Area */}
          <div className="w-full lg:w-1/2 flex flex-col pt-8">
            {heading && (
              <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-bold tracking-tight text-[#0f172a] mb-4">
                {heading}
              </h2>
            )}
            {body && (
              <p className="text-[#64748b] text-[17px] mb-12">{body}</p>
            )}
            <ContactForm collectionSlug={collectionSlug} />
          </div>

          {/* Right: Image */}
          <div className="w-full lg:w-1/2 h-[500px] sm:h-[600px] lg:h-[800px] relative rounded-[2rem] overflow-hidden bg-slate-100 shadow-xl">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              className="object-cover"
              priority={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
