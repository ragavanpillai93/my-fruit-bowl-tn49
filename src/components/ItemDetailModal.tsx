import React, { useState } from 'react';
import { X, MessageCircle, Plus, Sparkles, Flame, Check, Utensils, MapPin, Edit3 } from 'lucide-react';
import { FoodItem, DeliveryLocation } from '../types';
import { getFoodOrderWhatsAppUrl } from '../utils/whatsapp';

interface ItemDetailModalProps {
  food: FoodItem | null;
  onClose: () => void;
  onAddToCart: (food: FoodItem, quantity?: number, note?: string) => void;
  onOrderNow?: (food: FoodItem, quantity: number, note?: string) => void;
  deliveryLocation: DeliveryLocation | null;
  onOpenLocationPicker: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  food,
  onClose,
  onAddToCart,
  onOrderNow,
  deliveryLocation,
  onOpenLocationPicker,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [customNote, setCustomNote] = useState('');

  if (!food) return null;

  const handleOrderWhatsApp = () => {
    if (onOrderNow) {
      onOrderNow(food, quantity, customNote);
    } else {
      const url = getFoodOrderWhatsAppUrl(
        food, 
        quantity, 
        customNote,
        deliveryLocation
      );
      window.open(url, '_blank');
    }
  };

  const handleAddAndClose = () => {
    onAddToCart(food, quantity, customNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Container */}
      <div className="relative bg-white text-[#1A2E26] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl z-10 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Hero Image */}
        <div className="relative aspect-16/9 w-full overflow-hidden bg-stone-100 shrink-0">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          {food.badge && (
            <div className="absolute bottom-3 left-3 bg-[#0F2A1D]/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              {food.badge}
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#0F2A1D]">
                {food.name}
              </h3>
              <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider mt-0.5">
                {food.diet.toUpperCase()} • FRESH PREPARATION
              </p>
            </div>
            <div className="text-right">
              <span className="font-serif text-2xl font-bold text-[#0F2A1D]">
                ₹{food.price}
              </span>
              <span className="text-[10px] text-stone-500 block">per portion</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
            {food.description}
          </p>

          {/* Nutrition info cards */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF9F5] rounded-2xl border border-[#1A2E26]/8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Energy</span>
                <span className="text-xs font-bold text-[#0F2A1D]">{food.calories || 250} kcal</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Utensils className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">Protein</span>
                <span className="text-xs font-bold text-emerald-800">{food.protein || '18g'}</span>
              </div>
            </div>
          </div>

          {/* Ingredients list */}
          {food.ingredients && food.ingredients.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2A1D] mb-2">
                Ingredients & Fresh Produce
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {food.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-emerald-50/80 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-medium"
                  >
                    ✓ {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Delivery Location Indicator */}
          <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/70 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="min-w-0">
                <span className="font-bold text-emerald-950 block text-[11px]">
                  Delivering to:
                </span>
                <span className="text-stone-700 text-xs font-medium truncate block">
                  {deliveryLocation ? deliveryLocation.address : 'Thanjavur (TN 49)'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className="text-[11px] font-bold text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg shrink-0 shadow-2xs flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              <span>{deliveryLocation ? 'Change' : 'Set Location'}</span>
            </button>
          </div>

          {/* Quantity & Notes */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0F2A1D]">Select Quantity:</span>
              <div className="flex items-center gap-2 bg-[#FAF9F5] p-1 rounded-xl border border-stone-200">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm font-bold shadow-2xs hover:bg-stone-100"
                >
                  -
                </button>
                <span className="w-6 text-center text-xs font-bold text-[#0F2A1D]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-sm font-bold shadow-2xs hover:bg-stone-100"
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F2A1D] mb-1">
                Custom Notes / Delivery instruction
              </label>
              <input
                type="text"
                placeholder="e.g. Extra mint dip / deliver at 7:30 PM"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
              />
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#FAF9F5] border-t border-stone-200 flex items-center gap-2.5 shrink-0">
          <button
            onClick={handleAddAndClose}
            className="flex-1 py-3 px-4 rounded-xl border border-[#0F2A1D]/20 bg-white text-[#0F2A1D] text-xs font-bold hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Bowl Tray</span>
          </button>

          <button
            id="modal-direct-whatsapp-btn"
            onClick={handleOrderWhatsApp}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
            <span>Order (₹{food.price * quantity})</span>
          </button>
        </div>

      </div>
    </div>
  );
};

