import { MessageCircle, MapPin, Phone } from "lucide-react";

export function ContactInfoSection() {
  return (
    <section className="bg-white w-full pt-16 pb-12 xl:pt-24">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        
        {/* Header Content */}
        <div className="max-w-3xl mb-16">
          <h1 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-4">
            CONTACT
          </h1>
          <p className="text-[17px] text-slate-500 font-medium">
            Our friendly team is always here to chat.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Sales Chat */}
          <div className="bg-[#fcfbfc] border border-slate-100 rounded-2xl p-8 flex flex-col items-start hover:shadow-md hover:border-slate-200 transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#BC0D2A] text-white flex items-center justify-center mb-10 shadow-sm">
              <MessageCircle size={22} strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg mb-2">
              Discuter avec les ventes
            </h3>
            <p className="text-slate-500 text-sm mb-6 flex-grow">
              Parlez à notre équipe sympathique.
            </p>
            <a href="mailto:maghreb@k-adriatica.ma" className="font-semibold text-[#BC0D2A] text-sm hover:underline">
              maghreb@k-adriatica.ma
            </a>
          </div>

          {/* Card 2: Office Visit */}
          <div className="bg-[#fcfbfc] border border-slate-100 rounded-2xl p-8 flex flex-col items-start hover:shadow-md hover:border-slate-200 transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#BC0D2A] text-white flex items-center justify-center mb-10 shadow-sm">
              <MapPin size={22} strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg mb-6 flex-grow">
              Visitez notre siège.
            </h3>
            <div className="text-[#BC0D2A] text-[13px] font-semibold leading-relaxed">
              MAGHREB ADRIATICA F S.A.R.L.A.U.<br />
              LIè des Cactus n.18-3eme étage n.6 Sidi<br />
              Bernoussi- Casablanca
            </div>
          </div>

          {/* Card 3: Phone */}
          <div className="bg-[#fcfbfc] border border-slate-100 rounded-2xl p-8 flex flex-col items-start hover:shadow-md hover:border-slate-200 transition-all">
            <div className="w-12 h-12 rounded-lg bg-[#BC0D2A] text-white flex items-center justify-center mb-10 shadow-sm">
              <Phone size={22} strokeWidth={2} />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg mb-2">
              Appelez-nous
            </h3>
            <p className="text-slate-500 text-[13px] mb-6 flex-grow">
              Du lundi au vendredi de 8h à 17h.
            </p>
            <a href="tel:+212522674723" className="font-semibold text-[#BC0D2A] text-[13px] hover:underline">
              +21 2522674723
            </a>
          </div>

        </div>

      </div>
    </section>
  );
}
