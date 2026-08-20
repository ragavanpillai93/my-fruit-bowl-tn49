import React from 'react';
import { MessageCircle, Check, ArrowRight, Sparkles, Truck } from 'lucide-react';
import { getHeroWhatsAppUrl } from '../utils/whatsapp';

interface HeroProps {
  onExploreMenu: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMenu }) => {
  return (
    <section id="home" className="relative pt-6 pb-16 md:pt-12 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Text & CTAs */}
          <div className="lg:col-span-7 space-y-6 md:space-y-8">
            
            {/* Delivery Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F8EE] border border-emerald-200/60 text-emerald-900 text-xs sm:text-sm font-semibold tracking-tight shadow-2xs">
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Free Door Delivery in Thanjavur</span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#0F2A1D] leading-[1.08]">
              Eat Healthy. <br />
              <span className="text-[#0F2A1D]">Live Better.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl text-[#1A2E26]/75 max-w-xl font-normal leading-relaxed">
              Fresh fruit bowls, protein meals and healthy homemade food delivered directly to your door in Thanjavur.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
              <a
                id="hero-whatsapp-btn"
                href={getHeroWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-base font-semibold rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <MessageCircle className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                <span>Order Now on WhatsApp</span>
              </a>

              <button
                id="hero-explore-menu-btn"
                onClick={onExploreMenu}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-[#F3F2EB] text-[#0F2A1D] border border-[#0F2A1D]/30 text-base font-semibold rounded-full shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
              >
                <span>Explore Menu</span>
                <ArrowRight className="w-4 h-4 text-[#0F2A1D] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Highlights Under CTA */}
            <div className="pt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm font-medium text-[#1A2E26]/80">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Fresh Daily</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Hygienic</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
                <span>Home-style</span>
              </div>
            </div>

          </div>

          {/* Right Column: Hero Image with aesthetic squircle & badge */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-none">
              
              {/* Outer decorative soft glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-100/50 via-lime-100/30 to-amber-100/20 rounded-[2.5rem] filter blur-xl -z-10" />

              {/* Main Bowl Image */}
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white/80 aspect-4/3 sm:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=85"
                  alt="Fresh Protein and Fruit Bowl from My Fruit Bowl TN 49"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  loading="eager"
                />
                
                {/* Subtle bottom gradient overlay for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating pill over image */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-3 border border-white/40 shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0F2A1D] leading-tight">Freshly Prepared on Order</p>
                      <p className="text-[11px] text-emerald-800 font-medium">100% Home Kitchen Hygiene</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#0F2A1D] bg-emerald-100 px-2.5 py-1 rounded-md">
                    TN 49
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
