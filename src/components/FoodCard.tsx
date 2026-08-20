import React, { useState } from 'react';
import { Plus, Minus, Check, ShoppingBag, Sparkles, Flame } from 'lucide-react';
import { FoodItem } from '../types';

interface FoodCardProps {
  food: FoodItem;
  onAddToCart: (food: FoodItem, quantity?: number) => void;
  onOpenDetails: (food: FoodItem) => void;
  isInCart?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  onAddToCart,
  onOpenDetails,
  isInCart = false,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState<boolean>(false);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => Math.min(20, q + 1));
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(food, quantity);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  const getDietBadge = (diet: string) => {
    switch (diet) {
      case 'veg':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block ring-2 ring-emerald-200" />
            <span>Pure Veg</span>
          </span>
        );
      case 'egg':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block ring-2 ring-amber-200" />
            <span>Contains Egg</span>
          </span>
        );
      case 'non-veg':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600 inline-block ring-2 ring-rose-200" />
            <span>Non-Veg</span>
          </span>
        );
      case 'vegan':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-teal-900 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-600 inline-block ring-2 ring-teal-200" />
            <span>100% Vegan</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`food-card-${food.id}`}
      className="group bg-white rounded-3xl overflow-hidden border border-[#1A2E26]/8 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1"
    >
      {/* 1. FOOD IMAGE & BADGES */}
      <div
        className="relative aspect-4/3 w-full overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => onOpenDetails(food)}
      >
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex flex-col gap-1">
            {food.badge && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#E8F8EE]/95 backdrop-blur-md text-[#0F2A1D] border border-emerald-300 shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-700" />
                {food.badge}
              </span>
            )}
            {food.scheduleNote && (
              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500 text-white shadow-2xs">
                {food.scheduleNote}
              </span>
            )}
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xs">
            {getDietBadge(food.diet)}
          </div>
        </div>

        {/* Nutrition stats pill over bottom image */}
        {(food.calories || food.protein) && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[11px] font-medium flex items-center gap-2">
            {food.calories && (
              <span className="flex items-center gap-0.5">
                <Flame className="w-3 h-3 text-amber-400" /> {food.calories} kcal
              </span>
            )}
            {food.protein && (
              <span className="text-emerald-300 font-bold border-l border-white/20 pl-1.5">
                {food.protein} protein
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. ITEM CONTENT (Name, Description, Ingredients) */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={() => onOpenDetails(food)}
            className="font-serif text-lg sm:text-xl font-bold text-[#0F2A1D] group-hover:text-emerald-900 transition-colors cursor-pointer leading-snug"
          >
            {food.name}
          </h3>

          <p className="text-[#1A2E26]/70 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          {/* Key ingredients pill tags */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {food.ingredients.slice(0, 3).map((ing, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-[#FAF9F5] text-[#1A2E26]/75 px-2 py-0.5 rounded-md border border-[#1A2E26]/6 font-medium"
                >
                  {ing}
                </span>
              ))}
              {food.ingredients.length > 3 && (
                <span className="text-[10px] text-emerald-800 font-semibold px-1 py-0.5">
                  +{food.ingredients.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* 3. PRICE, QUANTITY SELECTOR & ADD TO CART BUTTON */}
        <div className="mt-4 pt-3.5 border-t border-[#1A2E26]/8 space-y-3">
          
          {/* Price & Quantity Selector Row */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#1A2E26]/60 block">Price</span>
              <span className="text-xl sm:text-2xl font-bold text-[#0F2A1D]">
                ₹{food.price}
              </span>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center bg-[#FAF9F5] rounded-xl border border-[#1A2E26]/12 p-0.5 shadow-2xs">
              <button
                type="button"
                id={`btn-qty-minus-${food.id}`}
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  quantity <= 1
                    ? 'text-stone-300 cursor-not-allowed'
                    : 'text-[#0F2A1D] hover:bg-white hover:shadow-2xs active:scale-95'
                }`}
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              
              <span className="w-7 text-center text-xs font-bold text-[#0F2A1D] select-none">
                {quantity}
              </span>

              <button
                type="button"
                id={`btn-qty-plus-${food.id}`}
                onClick={handleIncrement}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#0F2A1D] hover:bg-white hover:shadow-2xs active:scale-95 transition-colors"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Prominent Add to Cart Button */}
          {food.isAvailable === false ? (
            <div className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-stone-100 text-stone-500 text-center border border-stone-200 cursor-not-allowed">
              Currently Out of Stock
            </div>
          ) : (
            <button
              type="button"
              id={`btn-add-to-cart-${food.id}`}
              onClick={handleAddClick}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all transform active:scale-98 shadow-xs cursor-pointer ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : isInCart
                  ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-950 border border-emerald-300'
                  : 'bg-[#0F2A1D] hover:bg-[#163e2b] text-white hover:shadow-md'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Added to Tray ({quantity})!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart {quantity > 1 ? `(${quantity})` : ''}</span>
                </>
              )}
            </button>
          )}

        </div>

      </div>
    </div>
  );
};
