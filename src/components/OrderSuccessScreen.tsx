import React from 'react';
import {
  CheckCircle,
  MapPin,
  Clock,
  ExternalLink,
  ShoppingBag,
  MessageCircle,
  Sparkles,
  Phone,
  CreditCard,
  Utensils,
  X
} from 'lucide-react';
import { ConfirmedOrder } from '../types';
import { getGoogleMapsUrl } from '../utils/order';
import { WHATSAPP_NUMBER } from '../data/foodData';

interface OrderSuccessScreenProps {
  order: ConfirmedOrder;
  onContinueShopping: () => void;
  onClose: () => void;
}

export const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  order,
  onContinueShopping,
  onClose,
}) => {
  const mapsLink =
    order.deliveryLocation.mapsUrl ||
    getGoogleMapsUrl(order.deliveryLocation.latitude, order.deliveryLocation.longitude);

  return (
    <div
      className="p-5 sm:p-7 bg-[#FAF9F5] rounded-3xl border border-emerald-900/10 shadow-xl max-w-lg w-full mx-auto space-y-5 text-center animate-in zoom-in-95 duration-200"
      id="order-success-screen"
    >
      {/* 1. SUCCESS BADGE & ORDER ID */}
      <div className="flex flex-col items-center justify-center space-y-2.5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner ring-8 ring-emerald-50">
          <CheckCircle className="w-9 h-9 text-emerald-600 animate-in spin-in-180 duration-300" />
        </div>
        
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0F2A1D] tracking-tight">
          Order Request Sent Successfully 🎉
        </h2>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#0F2A1D] text-white text-xs font-mono font-bold rounded-full shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#7BF587]" />
          <span>Order ID: {order.orderId}</span>
        </div>
      </div>

      {/* WhatsApp Order Status Banner */}
      <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-3 flex items-center gap-2.5 text-left">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
          <MessageCircle className="w-4 h-4" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
            WhatsApp Order Status
          </span>
          <p className="text-xs font-semibold text-[#0F2A1D] truncate">
            Dispatched to Kitchen WhatsApp • Awaiting Confirmation
          </p>
        </div>
      </div>

      {/* 2. DETAILED ORDER RECEIPT CARD */}
      <div className="bg-white rounded-2xl border border-stone-200/80 p-4 text-left space-y-3.5 shadow-2xs">
        
        {/* Customer & Total Bill */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
          <div>
            <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider block">Customer Name</span>
            <span className="font-bold text-stone-900 text-sm">{order.customerName}</span>
            <span className="text-stone-600 font-mono text-[11px] block">{order.customerPhone}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider block">Final Total</span>
            <span className="font-serif text-lg font-bold text-emerald-900">
              ₹{order.totalAmount.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold block">Free Delivery</span>
          </div>
        </div>

        {/* Payment Mode */}
        <div className="flex items-center justify-between py-1.5 px-3 bg-[#FAF9F5] rounded-xl border border-stone-200/70 text-xs">
          <div className="flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
            <span className="text-stone-600 font-medium">Payment Mode:</span>
            <span className="font-bold text-stone-900">
              {order.paymentDetails?.method === 'cod'
                ? 'Cash on Delivery (COD)'
                : order.paymentDetails?.method === 'upi'
                ? 'Direct UPI'
                : 'Pay After Confirmation'}
            </span>
          </div>
          {order.paymentDetails?.utrTransactionId && (
            <span className="font-mono text-[10px] text-stone-500">
              Ref: {order.paymentDetails.utrTransactionId}
            </span>
          )}
        </div>

        {/* Delivery Schedule */}
        <div className="flex items-start gap-2.5 text-xs">
          <Clock className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Delivery Schedule
            </span>
            <span className="font-bold text-stone-900 text-xs sm:text-sm">
              {order.deliveryDate} • {order.deliveryTime}
            </span>
          </div>
        </div>

        {/* Delivery Address & Maps Pin */}
        <div className="flex items-start gap-2.5 text-xs">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Delivery Location (Thanjavur)
            </span>
            <span className="font-medium text-stone-800 text-xs block leading-relaxed">
              {order.deliveryAddress || order.deliveryLocation.address}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] text-stone-500 font-mono">
                {order.deliveryLocation.latitude.toFixed(4)}, {order.deliveryLocation.longitude.toFixed(4)}
              </span>
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5"
              >
                <span>View on Maps</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Ordered Items Summary */}
        <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-700">
          <div className="flex items-center gap-1.5 min-w-0">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="font-medium truncate">
              {order.items.map((it) => `${it.food.name} (×${it.quantity})`).join(', ')}
            </span>
          </div>
        </div>

      </div>

      {/* 3. ACTION BUTTONS: Continue Shopping & Close */}
      <div className="space-y-2.5 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Continue Shopping Button */}
          <button
            type="button"
            id="btn-success-continue-shopping"
            onClick={onContinueShopping}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Utensils className="w-4 h-4 text-[#7BF587]" />
            <span>Continue Shopping</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            id="btn-success-close-drawer"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white hover:bg-stone-100 text-[#0F2A1D] text-xs sm:text-sm font-bold rounded-2xl border border-stone-300 transition-colors shadow-2xs cursor-pointer active:scale-98"
          >
            <X className="w-4 h-4 text-stone-700" />
            <span>Close</span>
          </button>
        </div>

        {/* Direct WhatsApp Follow-up Support */}
        <div className="pt-1">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Need assistance? Chat directly on WhatsApp (+91 9345714473)</span>
          </a>
        </div>
      </div>

    </div>
  );
};

