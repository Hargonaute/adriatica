import { MessageCircle, MapPin, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ContactInfoCard {
  icon: 'message' | 'map' | 'phone';
  heading: string;
  body?: string;
  contact?: string;
  contactHref?: string;
  address?: string[];
}

export interface ContactInfoSectionProps {
  heading: string;
  subheading: string;
  cards: ContactInfoCard[];
}

const ICONS: Record<ContactInfoCard['icon'], LucideIcon> = {
  message: MessageCircle,
  map: MapPin,
  phone: Phone,
};

export function ContactInfoSection({ heading, subheading, cards }: ContactInfoSectionProps) {
  return (
    <section className="bg-white w-full pt-16 pb-12 xl:pt-24">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
            {heading}
          </h1>
          <p className="text-[17px] text-slate-500 font-medium">{subheading}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((card, idx) => {
            const Icon = ICONS[card.icon];
            return (
              <div
                key={idx}
                className="bg-[#fcfbfc] border border-slate-100 rounded-2xl p-8 flex flex-col items-start hover:shadow-md hover:border-slate-200 transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-[#BC0D2A] text-white flex items-center justify-center mb-10 shadow-sm">
                  <Icon size={22} strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2 flex-grow">
                  {card.heading}
                </h3>
                {card.body && (
                  <p className="text-slate-500 text-sm mb-6 flex-grow">{card.body}</p>
                )}
                {card.address && (
                  <div className="text-[#BC0D2A] text-[13px] font-semibold leading-relaxed">
                    {card.address.map((line, i) => (
                      <span key={i}>
                        {line}
                        {i < card.address!.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                )}
                {card.contact && card.contactHref && (
                  <a
                    href={card.contactHref}
                    className="font-semibold text-[#BC0D2A] text-sm hover:underline"
                  >
                    {card.contact}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
