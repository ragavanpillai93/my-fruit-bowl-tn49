import React from 'react';
import { ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '1',
      title: 'Choose',
      description: 'Select your meal or subscription plan from our fresh, wholesome menu.',
      isHighlight: false,
    },
    {
      num: '2',
      title: 'Order',
      description: 'Send us a quick message on WhatsApp to confirm your preferred items or plan.',
      isHighlight: false,
    },
    {
      num: '3',
      title: 'Prepare',
      description: 'We freshly prepare your meal using hygienic, home-style methods and zero preservatives.',
      isHighlight: false,
    },
    {
      num: '4',
      title: 'Deliver',
      description: 'Enjoy free doorstep delivery anywhere across Thanjavur at your preferred slot.',
      isHighlight: true,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#FAF9F5] border-t border-[#1A2E26]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F2A1D] tracking-tight">
            How It Works
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-[#1A2E26]/70">
            Simple steps to a healthier lifestyle in Thanjavur.
          </p>
        </div>

        {/* 4 Steps Horizontal Flow */}
        <div className="relative">
          
          {/* Subtle connecting line across steps (desktop only) */}
          <div className="hidden lg:block absolute top-7 left-1/12 right-1/12 h-0.5 bg-[#1A2E26]/10 -z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 relative z-10">
            {steps.map((step, idx) => (
              <div
                key={idx}
                id={`how-it-works-step-${step.num}`}
                className="flex flex-col items-center text-center group"
              >
                {/* Step Number Circle */}
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-serif font-bold transition-transform duration-300 group-hover:scale-110 shadow-xs mb-5 ${
                    step.isHighlight
                      ? 'bg-[#7BF587] text-[#0F2A1D] ring-4 ring-emerald-200'
                      : 'bg-white border-2 border-[#1A2E26]/15 text-[#0F2A1D]'
                  }`}
                >
                  {step.num}
                </div>

                {/* Step Title */}
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F2A1D] mb-2">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="text-xs sm:text-sm text-[#1A2E26]/70 max-w-xs leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
