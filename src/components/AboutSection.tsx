import React from 'react';
import { Heart, Sparkles, Shield, Utensils, CheckCircle2, MapPin, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const highlights = [
    {
      icon: <Sparkles className="w-5 h-5 text-emerald-700" />,
      title: 'Ozone Sanitized Fruits & Greens',
      desc: 'All seasonal fruits, lettuce, and greens undergo gentle multi-stage ozone washing to remove all impurities and pesticides.',
    },
    {
      icon: <Shield className="w-5 h-5 text-emerald-700" />,
      title: 'Zero Refined Oil & Zero Artificial Colors',
      desc: 'We cook using only cold-pressed oils, zero palm oil, and zero synthetic taste boosters. Real homemade nutrition.',
    },
    {
      icon: <Utensils className="w-5 h-5 text-emerald-700" />,
      title: 'High Protein & Macro Calculated',
      desc: 'Designed by certified nutritionists to fuel workouts, support fat loss, and maintain steady daytime energy.',
    },
    {
      icon: <Heart className="w-5 h-5 text-emerald-700" />,
      title: 'Freshly Prepared on Every Order',
      desc: 'No cold storage or mass batching. Your fruit bowl or meal is cut and assembled just minutes before dispatch.',
    },
  ];

  return (
    <section id="about" className="py-16 md:py-24 bg-white border-t border-[#1A2E26]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Story & Philosophy */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-emerald-700" />
              Thanjavur's Healthy Food Revolution
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0F2A1D] leading-tight">
              Crafted in Thanjavur, <br />
              <span className="text-emerald-800">Fresh from Our Kitchen to You.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#1A2E26]/75 leading-relaxed">
              At <strong>My Fruit Bowl TN 49</strong>, we believe good health begins with honest, unadulterated food. Born in Thanjavur, our mission is to make daily clean eating, vibrant fruit bowls, and gym-fueling high protein meals accessible, delicious, and hassle-free.
            </p>

            <p className="text-sm sm:text-base text-[#1A2E26]/75 leading-relaxed">
              Whether you are a fitness enthusiast aiming for daily protein targets, an office worker looking for a light nutritious lunch, or a family seeking immunity-boosting fresh fruit platters, we prepare every bowl with love and utmost hygiene.
            </p>

            {/* Quick Badges */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-[#0F2A1D]">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#1A2E26]/8">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>TN 49 Verified</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#1A2E26]/8">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Preservatives</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FAF9F5] border border-[#1A2E26]/8">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Home-Style Taste</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Key Value Cards */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#FAF9F5] border border-[#1A2E26]/8 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center mb-3.5">
                  {h.icon}
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0F2A1D] mb-1.5 leading-snug">
                  {h.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#1A2E26]/70 leading-relaxed">
                  {h.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
