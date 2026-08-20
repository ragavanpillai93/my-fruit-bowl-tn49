import React from 'react';
import { Dumbbell, Leaf, Sunrise, UtensilsCrossed, ArrowRight } from 'lucide-react';
import { MealCategory } from '../types';

interface CravingsSectionProps {
  onSelectCategory: (category: MealCategory) => void;
}

export const CravingsSection: React.FC<CravingsSectionProps> = ({ onSelectCategory }) => {
  return (
    <section className="py-12 md:py-16 bg-[#FAF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F2A1D] tracking-tight">
            What Are You Craving Today?
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-[#1A2E26]/70">
            Explore our fresh, homemade selections.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6">
          
          {/* Large Left Card: Signature Fruit Bowls */}
          <div
            id="craving-card-fruit-bowls"
            onClick={() => onSelectCategory('fruit-bowls')}
            className="md:col-span-6 lg:col-span-6 relative group rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 min-h-[280px] md:min-h-[340px] flex flex-col justify-end p-6 md:p-8"
          >
            {/* Background Image */}
            <img
              src="https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?auto=format&fit=crop&w=1000&q=80"
              alt="Signature Fruit Bowls at My Fruit Bowl TN 49"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-90"
            />
            {/* Dark vignette gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F2A1D]/90 via-[#0F2A1D]/40 to-transparent" />

            {/* Content */}
            <div className="relative z-10 space-y-2">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full uppercase tracking-wider mb-1">
                Fresh & Juicy
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white leading-tight">
                Signature Fruit Bowls
              </h3>
              <p className="text-white/85 text-sm sm:text-base max-w-sm">
                Loaded with seasonal goodness and immunity boosters.
              </p>
              <div className="pt-2">
                <button
                  id="btn-explore-fruit-bowls"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-white/25 hover:bg-white/35 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 transition-all group-hover:px-5"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 2x2 Grid */}
          <div className="md:col-span-6 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
            
            {/* Protein Bowls */}
            <div
              id="craving-card-protein"
              onClick={() => onSelectCategory('protein-meals')}
              className="group bg-white/90 hover:bg-white p-5 md:p-6 rounded-2xl border border-[#1A2E26]/8 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <Dumbbell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-[#0F2A1D] group-hover:text-emerald-800 transition-colors">
                  Protein Bowls
                </h4>
                <p className="text-xs sm:text-sm text-[#1A2E26]/70 mt-1">
                  Fuel your workouts.
                </p>
              </div>
            </div>

            {/* Healthy Salads */}
            <div
              id="craving-card-salads"
              onClick={() => onSelectCategory('salads')}
              className="group bg-white/90 hover:bg-white p-5 md:p-6 rounded-2xl border border-[#1A2E26]/8 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-[#0F2A1D] group-hover:text-teal-800 transition-colors">
                  Healthy Salads
                </h4>
                <p className="text-xs sm:text-sm text-[#1A2E26]/70 mt-1">
                  Crisp and refreshing.
                </p>
              </div>
            </div>

            {/* Breakfast */}
            <div
              id="craving-card-breakfast"
              onClick={() => onSelectCategory('healthy-breakfast')}
              className="group bg-white/90 hover:bg-white p-5 md:p-6 rounded-2xl border border-[#1A2E26]/8 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Sunrise className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-[#0F2A1D] group-hover:text-amber-800 transition-colors">
                  Healthy Breakfast
                </h4>
                <p className="text-xs sm:text-sm text-[#1A2E26]/70 mt-1">
                  Kickstart your day.
                </p>
              </div>
            </div>

            {/* Lunch */}
            <div
              id="craving-card-lunch"
              onClick={() => onSelectCategory('healthy-lunch')}
              className="group bg-white/90 hover:bg-white p-5 md:p-6 rounded-2xl border border-[#1A2E26]/8 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5"
            >
              <div className="w-11 h-11 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-lg sm:text-xl font-bold text-[#0F2A1D] group-hover:text-emerald-800 transition-colors">
                  Healthy Lunch
                </h4>
                <p className="text-xs sm:text-sm text-[#1A2E26]/70 mt-1">
                  Balanced & filling.
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
