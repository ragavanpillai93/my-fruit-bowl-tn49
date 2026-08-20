import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';
import { getHeroWhatsAppUrl } from '../utils/whatsapp';
import { DISPLAY_PHONE } from '../data/foodData';

export const CtaBanner: React.FC = () => {
  return (
    <section className="py-12 md:py-16 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Curved Lime Green Banner Card */}
        <div className="bg-[#86EFAC] rounded-3xl md:rounded-4xl p-8 sm:p-12 md:p-16 text-center text-[#0F2A1D] shadow-lg relative overflow-hidden">
          
          {/* Subtle background decorative shapes */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-700/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F2A1D]">
              Ready to Eat Healthy?
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-[#0F2A1D]/80 font-medium">
              Join hundreds of others in Thanjavur prioritizing their health.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              {/* WhatsApp Us Now */}
              <a
                id="cta-whatsapp-now-btn"
                href={getHeroWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-sm sm:text-base font-bold rounded-full shadow-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <span>WhatsApp Us Now</span>
              </a>

              {/* Phone Direct Call */}
              <a
                id="cta-phone-call-btn"
                href={`tel:${DISPLAY_PHONE.replace(/\s+/g, '')}`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-white hover:bg-[#FAF9F5] text-[#0F2A1D] text-sm sm:text-base font-bold rounded-full shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <Phone className="w-4 h-4 text-[#0F2A1D]" />
                <span>{DISPLAY_PHONE}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
