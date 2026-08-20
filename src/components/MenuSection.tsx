import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Apple,
  Dumbbell,
  SunMedium,
  UtensilsCrossed,
  Leaf,
  Sandwich,
  PackageCheck,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { FoodItem, MealCategory } from '../types';
import { FoodCard } from './FoodCard';

interface MenuSectionProps {
  items: FoodItem[];
  activeCategory: MealCategory;
  onSelectCategory: (cat: MealCategory) => void;
  onAddToCart: (food: FoodItem, quantity?: number) => void;
  onOpenDetails: (food: FoodItem) => void;
  cartItemIds: string[];
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onOpenDetails,
  cartItemIds,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');

  // Exact 7 Categories Requested
  const categories: { id: MealCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'fruit-bowls', label: 'Fresh Fruit Bowls', icon: <Apple className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'protein-meals', label: 'Protein Meals', icon: <Dumbbell className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'healthy-breakfast', label: 'Healthy Breakfast', icon: <SunMedium className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'healthy-lunch', label: 'Healthy Lunch', icon: <UtensilsCrossed className="w-3.5 h-3.5 text-orange-600" /> },
    { id: 'salads', label: 'Salads', icon: <Leaf className="w-3.5 h-3.5 text-teal-600" /> },
    { id: 'sandwiches-rolls', label: 'Sandwiches & Rolls', icon: <Sandwich className="w-3.5 h-3.5 text-amber-700" /> },
    { id: 'meal-packages', label: '3-Time Meal Packages', icon: <PackageCheck className="w-3.5 h-3.5 text-emerald-700" /> },
  ];

  const dietFilters = [
    { id: 'all', label: 'All Diets' },
    { id: 'veg', label: 'Pure Veg 🟢' },
    { id: 'egg', label: 'Egg 🟡' },
    { id: 'non-veg', label: 'Non-Veg 🔴' },
    { id: 'vegan', label: 'Vegan 🌿' },
  ];

  // Filtering logic
  const filteredItems = items.filter((item) => {
    // Category check
    let matchesCategory = true;
    if (activeCategory !== 'all') {
      matchesCategory = item.category === activeCategory;
    }

    // Diet check
    let matchesDiet = true;
    if (selectedDiet !== 'all') {
      matchesDiet = item.diet === selectedDiet;
    }

    // Search check
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.ingredients && item.ingredients.some((ing) => ing.toLowerCase().includes(q))) ||
        (item.badge && item.badge.toLowerCase().includes(q));
    }

    return matchesCategory && matchesDiet && matchesSearch;
  });

  const scrollToPackages = () => {
    const pkgEl = document.getElementById('packages');
    if (pkgEl) {
      const navOffset = 80;
      const elementPosition = pkgEl.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section id="menu" className="py-16 md:py-24 bg-[#FAF9F5] border-t border-[#1A2E26]/5 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            100% Fresh Daily Preparation • Thanjavur (TN 49)
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F2A1D] tracking-tight">
            Our Healthy Food Menu
          </h2>
          <p className="mt-2.5 text-base sm:text-lg text-[#1A2E26]/70">
            Fresh fruit bowls, protein-dense meals, wholesome breakfast, salads and complete daily packages.
          </p>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="space-y-4 mb-10">
          
          {/* Category Tabs (Scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar justify-start lg:justify-center">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-btn-${cat.id}`}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0F2A1D] text-white shadow-sm scale-102 ring-2 ring-[#0F2A1D]/20'
                      : 'bg-white text-[#1A2E26]/80 hover:bg-[#E8F8EE] border border-[#1A2E26]/10 shadow-2xs'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search bar & Diet toggle row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#1A2E26]/8 shadow-2xs">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#1A2E26]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="menu-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fruits, paneer, eggs, salads, rolls..."
                className="w-full pl-9.5 pr-4 py-2 bg-[#FAF9F5] rounded-xl text-xs sm:text-sm text-[#0F2A1D] placeholder:text-[#1A2E26]/45 border border-[#1A2E26]/10 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Diet pills */}
            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs font-semibold text-[#1A2E26]/50 mr-1 hidden lg:inline">Filter:</span>
              {dietFilters.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDiet(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    selectedDiet === d.id
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-[#FAF9F5] text-[#1A2E26]/75 hover:bg-emerald-50 border border-[#1A2E26]/8'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* 3-Time Meal Package Highlight Banner when category is meal-packages */}
        {activeCategory === 'meal-packages' && (
          <div className="mb-8 p-5 sm:p-6 bg-[#0F2A1D] text-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7BF587]">
                Monthly & Weekly Routine Plans
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                Subscribe to 3-Time Daily Nutrition Delivery
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100/70 max-w-xl">
                Breakfast, Lunch & Dinner delivered fresh to your home or office anywhere in Thanjavur.
              </p>
            </div>

            <button
              type="button"
              onClick={scrollToPackages}
              className="px-5 py-2.5 bg-[#7BF587] text-[#0F2A1D] font-bold text-xs sm:text-sm rounded-xl hover:bg-[#6ee079] transition-all flex items-center gap-1.5 shrink-0 shadow-md active:scale-95"
            >
              <span>Explore All Packages</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Food Items Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onAddToCart={onAddToCart}
                onOpenDetails={onOpenDetails}
                isInCart={cartItemIds.includes(food.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#1A2E26]/15 max-w-lg mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-2xl mb-4">
              🔍
            </div>
            <h3 className="font-serif text-xl font-bold text-[#0F2A1D]">No items found</h3>
            <p className="text-sm text-[#1A2E26]/70 mt-1">
              Try adjusting your search query or dietary filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDiet('all');
                onSelectCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-[#0F2A1D] text-white text-xs font-bold rounded-full"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
