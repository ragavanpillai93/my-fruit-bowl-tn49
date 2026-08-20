import React from 'react';
import {
  ShoppingBag,
  Clock,
  MapPin,
  FileText,
  User,
  Phone,
  ExternalLink,
  Sparkles,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2
} from 'lucide-react';
import { CartItem, DeliveryLocation, PaymentDetails } from '../types';
import { getGoogleMapsUrl } from '../utils/order';

interface OrderSummaryCardProps {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  totalAmount: number;
  deliveryDate?: string;
  deliveryTime: string;
  deliveryLocation: DeliveryLocation | null;
  deliveryInstructions?: string;
  paymentDetails?: PaymentDetails;
}

const DEFAULT_PAYMENT_DETAILS: PaymentDetails = {
  method: 'cod',
  methodLabel: 'Cash on Delivery',
  isPaymentMarkedDone: false,
  utrTransactionId: '',
};

export const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  orderId,
  customerName,
  customerPhone,
  deliveryAddress,
  items,
  subtotal,
  deliveryFee = 0,
  totalAmount,
  deliveryDate = 'Today',
  deliveryTime,
  deliveryLocation,
  deliveryInstructions,
  paymentDetails = DEFAULT_PAYMENT_DETAILS,
}) => {
  const mapsLink = deliveryLocation
    ? deliveryLocation.mapsUrl || getGoogleMapsUrl(deliveryLocation.latitude, deliveryLocation.longitude)
    : '';

  return (
    <div className="bg-[#FAF9F5] rounded-2xl border border-emerald-900/15 p-4 sm:p-5 space-y-4 shadow-xs text-[#1A2E26]" id="order-summary-card">
      
      {/* Header with Order ID */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 block">
            Order Reference
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-[#0F2A1D] tracking-wide">
            {orderId}
          </span>
        </div>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100/90 border border-emerald-300 text-emerald-900 text-[11px] font-bold">
          <Sparkles className="w-3 h-3 text-emerald-700" />
          <span>Ready to Order</span>
        </div>
      </div>

      {/* Customer Information Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-stone-200/70 shadow-2xs">
          <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-stone-500 block font-medium">Customer Name</span>
            <span className="font-bold text-stone-900 truncate block">
              {customerName || 'Not specified'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 bg-white rounded-xl border border-stone-200/70 shadow-2xs">
          <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-stone-500 block font-medium">Mobile Number</span>
            <span className="font-bold text-stone-900 font-mono block">
              {customerPhone || 'Not specified'}
            </span>
          </div>
        </div>
      </div>

      {/* Items Breakdown Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-stone-700 uppercase tracking-wider px-0.5">
          <div className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
            <span>Items Ordered ({items.reduce((s, i) => s + i.quantity, 0)})</span>
          </div>
          <span className="text-stone-500 font-medium">Price</span>
        </div>

        <div className="bg-white rounded-xl border border-stone-200/70 divide-y divide-stone-100 overflow-hidden text-xs shadow-2xs">
          {items.map((item) => (
            <div key={item.food.id} className="p-2.5 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="font-bold text-stone-900 truncate flex items-center gap-1.5">
                  <span className="text-stone-800">{item.food.name}</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  Qty: <span className="font-bold text-stone-800">{item.quantity}</span> × ₹{item.food.price} each
                </div>
                {item.notes && (
                  <p className="text-[10px] text-stone-500 italic mt-0.5 truncate">
                    Note: {item.notes}
                  </p>
                )}
              </div>

              <span className="font-bold text-stone-900 shrink-0 text-sm">
                ₹{item.food.price * item.quantity}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Schedule & Location Card */}
      <div className="space-y-2 text-xs">
        {/* Date & Time Slot */}
        <div className="p-2.5 bg-white rounded-xl border border-stone-200/70 flex items-start gap-2 shadow-2xs">
          <Calendar className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Delivery Schedule
            </span>
            <span className="font-bold text-[#0F2A1D] text-xs sm:text-sm">
              {deliveryDate} • {deliveryTime || 'ASAP'}
            </span>
          </div>
        </div>

        {/* Delivery Address & Maps Link */}
        <div className="p-2.5 bg-white rounded-xl border border-stone-200/70 flex items-start gap-2 shadow-2xs">
          <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
              Delivery Location (Thanjavur)
            </span>
            <span className="font-medium text-stone-800 text-xs block leading-relaxed">
              {deliveryAddress || (deliveryLocation ? deliveryLocation.address : 'Thanjavur (TN 49)')}
            </span>
            {deliveryLocation && (
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded font-mono">
                  {deliveryLocation.latitude.toFixed(5)}, {deliveryLocation.longitude.toFixed(5)}
                </span>
                {mapsLink && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    <span>Google Maps Link</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Optional Delivery Instructions */}
        {(deliveryInstructions || deliveryLocation?.deliveryInstructions) && (
          <div className="p-2.5 bg-white rounded-xl border border-stone-200/70 flex items-start gap-2 shadow-2xs">
            <FileText className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Delivery Instructions
              </span>
              <p className="text-xs text-stone-700 font-medium">
                {deliveryInstructions || deliveryLocation?.deliveryInstructions}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Payment Method Card */}
      <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-2xs space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-bold text-[#0F2A1D] uppercase tracking-wider text-[11px]">
              Selected Payment Method
            </span>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            paymentDetails.method === 'upi'
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : paymentDetails.method === 'cod'
              ? 'bg-stone-100 text-stone-800'
              : 'bg-amber-100 text-amber-900'
          }`}>
            {paymentDetails.method === 'cod' ? 'Cash on Delivery' : paymentDetails.method === 'upi' ? 'UPI' : 'Pay After Confirmation'}
          </span>
        </div>

        <div className="pl-6 space-y-1">
          {paymentDetails.method === 'cod' && (
            <p className="text-stone-600 text-xs font-medium">
              💵 <strong className="text-stone-800">Pay when your order is delivered</strong> (Cash or UPI to delivery partner).
            </p>
          )}

          {paymentDetails.method === 'upi' && (
            <div className="space-y-1 text-xs">
              <p className="text-stone-700 font-medium">
                📱 <strong className="text-stone-900">UPI Payment</strong> (GPay / PhonePe / Paytm)
              </p>
              {paymentDetails.isPaymentMarkedDone ? (
                <div className="inline-flex items-center gap-1 text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Marked as Paid by Customer</span>
                </div>
              ) : (
                <p className="text-[11px] text-stone-500">
                  Self-transfer to {paymentDetails.upiId || 'business UPI'}
                </p>
              )}
              {paymentDetails.utrTransactionId && (
                <p className="text-[11px] font-mono text-stone-600">
                  UTR / Ref: <strong className="text-stone-900">{paymentDetails.utrTransactionId}</strong>
                </p>
              )}
              <p className="text-[10px] text-stone-500 italic">
                * Note: Verification will be completed by the kitchen team upon order confirmation.
              </p>
            </div>
          )}

          {paymentDetails.method === 'pay-after-confirmation' && (
            <p className="text-stone-600 text-xs font-medium">
              ⏳ <strong className="text-stone-800">Pay after confirmation:</strong> Kitchen will verify availability and share payment link on WhatsApp.
            </p>
          )}
        </div>
      </div>

      {/* Pricing Bill Summary */}
      <div className="pt-3 border-t border-stone-200/80 space-y-2 text-xs">
        <div className="flex items-center justify-between text-stone-600">
          <span>Subtotal</span>
          <span className="font-semibold text-stone-900 text-sm">₹{subtotal.toLocaleString('en-IN')}</span>
        </div>

        <div className="flex items-center justify-between text-stone-600">
          <span>Delivery Charge</span>
          <span className="text-emerald-700 font-bold uppercase text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {deliveryFee === 0 ? 'FREE (Thanjavur)' : `₹${deliveryFee}`}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-2 border-t border-stone-200/90 font-bold text-[#0F2A1D]">
          <span className="font-serif text-base">Final Amount:</span>
          <span className="font-serif text-2xl text-emerald-900">
            ₹{totalAmount.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

    </div>
  );
};
