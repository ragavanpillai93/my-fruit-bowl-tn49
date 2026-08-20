import React, { useState } from 'react';
import { Check, MessageCircle, Sparkles, ShieldCheck, Clock, Award } from 'lucide-react';
import { PackagePlan } from '../types';
import { SUBSCRIPTION_PLANS } from '../data/packageData';
import { getPackageSubscriptionWhatsAppUrl } from '../utils/whatsapp';

interface PackagesSectionProps {
  onSelectPlan?: (plan: PackagePlan) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = () => {
  const [viewMode, setViewMode] = useState<'featured' | 'all'>('featured');

  // Featured 3 plans matching image
  const featuredPlanIds = ['protein-breakfast', '2-meals-day', '3-meals-day'];
  const displayPlans = viewMode === 'featured' 
    ? SUBSCRIPTION_PLANS.filter(p => featuredPlanIds.includes(p.id))
    : SUBSCRIPTION_PLANS;

  return (
    <section id="packages" className="py-20 md:py-28 bg-[#0D2B1D] text-white relative overflow-hidden">
      
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Your Healthy Routine Starts Here
          </h2>
          <p className="mt-3 text-sm sm:text-base text-emerald-200/80 font-medium tracking-wide">
            Monthly plans • Pre-booking required • Non-refundable
          </p>

          {/* View Mode Toggle */}
          <div className="inline-flex p-1 bg-white/10 backdrop-blur-md rounded-full mt-6 border border-white/15">
            <button
              onClick={() => setViewMode('featured')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'featured'
                  ? 'bg-white text-[#0D2B1D] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Featured Plans
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white text-[#0D2B1D] shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              All Packages ({SUBSCRIPTION_PLANS.length})
            </button>
          </div>
        </div>

        {/* Pricing & Plan Cards Grid */}
        <div className={`grid gap-6 md:gap-8 items-stretch ${
          viewMode === 'featured'
            ? 'grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        }`}>
          {displayPlans.map((plan) => {
            const isFeaturedLime = plan.id === '2-meals-day';

            return (
              <div
                key={plan.id}
                id={`package-card-${plan.id}`}
                className={`relative rounded-3xl p-7 md:p-8 flex flex-col justify-between transition-all duration-300 transform hover:-translate-y-1.5 shadow-xl ${
                  isFeaturedLime
                    ? 'bg-[#7BF587] text-[#0F2A1D] ring-4 ring-[#7BF587]/40 z-10 scale-100 md:scale-105'
                    : 'bg-white text-[#0F2A1D] border border-white/10'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0F2A1D] text-white text-[11px] font-extrabold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}

                <div>
                  {/* Plan Name & Tag */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
                      {plan.name}
                    </h3>
                    {!isFeaturedLime && plan.badge && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Short Subtitle / Description */}
                  <p className={`text-xs sm:text-sm mt-1 leading-relaxed ${
                    isFeaturedLime ? 'text-[#0F2A1D]/80 font-medium' : 'text-[#1A2E26]/70'
                  }`}>
                    {plan.description}
                  </p>

                  {/* Price Tag */}
                  <div className="mt-5 pb-5 border-b border-current/15">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs font-semibold uppercase ${
                        isFeaturedLime ? 'text-[#0F2A1D]/70' : 'text-[#1A2E26]/60'
                      }`}>
                        / month
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-xs font-medium ${
                        isFeaturedLime ? 'text-[#0F2A1D]/85 font-bold' : 'text-emerald-700 font-semibold'
                      }`}>
                        {plan.mealsCount}
                      </span>
                      {plan.originalPrice && (
                        <span className={`text-xs line-through ${
                          isFeaturedLime ? 'text-[#0F2A1D]/50' : 'text-[#1A2E26]/40'
                        }`}>
                          ₹{plan.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="mt-6 space-y-3.5">
                    {plan.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isFeaturedLime ? 'bg-[#0F2A1D] text-[#7BF587]' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-8 pt-4">
                  <a
                    id={`btn-subscribe-whatsapp-${plan.id}`}
                    href={getPackageSubscriptionWhatsAppUrl(plan)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all transform active:scale-98 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                    <span>Subscribe via WhatsApp</span>
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Subscription Guarantee Notes */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Daily Timely Delivery</p>
              <p className="text-[11px] text-emerald-200/70">Morning slot 7:00 AM - 9:00 AM</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">100% Home Kitchen Hygiene</p>
              <p className="text-[11px] text-emerald-200/70">Prepared fresh with zero preservatives</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Free Doorstep Delivery</p>
              <p className="text-[11px] text-emerald-200/70">Delivered across all areas in Thanjavur</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
