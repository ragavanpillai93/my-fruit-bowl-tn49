import React from 'react';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { CartItem } from '../types';

interface FloatingCartButtonProps {
  cart: CartItem[];
  onOpenCart: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  cart,
  onOpenCart,
}) => {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);

  return (
    <div className="fixed bottom-22 sm:bottom-24 right-6 z-40 flex flex-col items-end gap-2">
      <button
        type="button"
        id="floating-cart-btn"
        onClick={onOpenCart}
        aria-label={`View Cart with ${totalCount} items`}
        className={`group flex items-center gap-3 px-4 py-3.5 rounded-full shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-white/20 cursor-pointer ${
          totalCount > 0
            ? 'bg-[#0F2A1D] text-white ring-4 ring-[#7BF587]/30 hover:bg-[#163e2b]'
            : 'bg-white/95 backdrop-blur-md text-[#0F2A1D] ring-4 ring-black/5 hover:bg-stone-50 border-stone-200'
        }`}
      >
        <div className="relative">
          <ShoppingBag className="w-6 h-6 text-emerald-400 group-hover:rotate-6 transition-transform" />
          {totalCount > 0 && (
            <span
              id="floating-cart-count-badge"
              className="absolute -top-2.5 -right-2.5 w-5.5 h-5.5 rounded-full bg-[#7BF587] text-[#0F2A1D] text-xs font-black flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200"
            >
              {totalCount}
            </span>
          )}
        </div>

        <div className="flex flex-col text-left pr-1">
          <span className="text-xs font-bold leading-tight flex items-center gap-1">
            <span>{totalCount > 0 ? `${totalCount} Item${totalCount > 1 ? 's' : ''}` : 'Cart'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </span>
          {totalCount > 0 && (
            <span className="text-[11px] font-extrabold text-[#7BF587]">
              ₹{subtotal}
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
