import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  MapPin,
  Clock,
  CreditCard,
  ExternalLink,
  ShoppingBag,
  MessageCircle,
  FileText,
  Copy,
  Check,
  Bike,
  ChefHat,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { AdminOrder, OrderPaymentStatus, OrderStatus } from '../../types';
import { getGoogleMapsUrl } from '../../utils/order';
import { generateCustomerStatusWhatsAppUrl } from '../../utils/adminStorage';

interface AdminOrderDetailsModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => void;
  onUpdatePaymentStatus: (orderId: string, paymentStatus: OrderPaymentStatus) => void;
}

export const AdminOrderDetailsModal: React.FC<AdminOrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
  onUpdatePaymentStatus,
}) => {
  const [adminNotes, setAdminNotes] = useState('');
  const [isCopiedCoords, setIsCopiedCoords] = useState(false);
  const [customWhatsAppNote, setCustomWhatsAppNote] = useState('');
  const [showWhatsAppComposer, setShowWhatsAppComposer] = useState(false);

  // Sync state when order changes
  React.useEffect(() => {
    if (order) {
      setAdminNotes(order.adminNotes || '');
      setShowWhatsAppComposer(false);
      setCustomWhatsAppNote('');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const mapsUrl =
    order.deliveryLocation.mapsUrl ||
    getGoogleMapsUrl(order.deliveryLocation.latitude, order.deliveryLocation.longitude);

  const handleCopyCoords = () => {
    const coords = `${order.deliveryLocation.latitude}, ${order.deliveryLocation.longitude}`;
    navigator.clipboard.writeText(coords);
    setIsCopiedCoords(true);
    setTimeout(() => setIsCopiedCoords(false), 2000);
  };

  const handleStatusChange = (newStatus: OrderStatus) => {
    onUpdateStatus(order.orderId, newStatus, adminNotes);
  };

  const handleSaveNotes = () => {
    onUpdateStatus(order.orderId, order.status, adminNotes);
  };

  const handleOpenWhatsAppCustomer = () => {
    const url = generateCustomerStatusWhatsAppUrl(order, customWhatsAppNote || undefined);
    window.open(url, '_blank');
  };

  const allStatuses: OrderStatus[] = [
    'New',
    'Confirmed',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Confirmed':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'Preparing':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Out for Delivery':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-900 border-rose-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6" id="admin-order-details-modal">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Dialog Box */}
      <div className="relative w-full max-w-3xl bg-[#FAF9F5] rounded-3xl border border-[#1A2E26]/15 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-white border-b border-stone-200/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F2A1D] text-[#7BF587] flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              TN49
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-base sm:text-lg font-bold text-[#0F2A1D]">
                  Order #{order.orderId}
                </h3>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-medium">
                Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.deliveryDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-close-order-modal"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 text-stone-900 text-xs sm:text-sm">
          
          {/* 1. STATUS PROGRESSION WORKFLOW */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Update Order Pipeline</span>
              </span>
              <span className="text-[11px] text-stone-500 font-medium">Single-click status update</span>
            </div>

            {/* Status Button Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {allStatuses.map((st) => {
                const isActive = order.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    id={`btn-set-status-${st.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => handleStatusChange(st)}
                    className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                      isActive
                        ? `${getStatusBadgeStyle(st)} ring-2 ring-emerald-700 shadow-xs scale-102`
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    {isActive && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. CUSTOMER & DELIVERY SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Contact Box */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Customer Details</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-sm text-[#0F2A1D]">
                  {order.customerName}
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="font-mono font-medium">{order.customerPhone}</span>
                </div>
              </div>

              {/* Action Contact Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${order.customerPhone}`}
                  className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-stone-200"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Call Customer</span>
                </a>
                <button
                  type="button"
                  id="btn-whatsapp-customer-quick"
                  onClick={() => setShowWhatsAppComposer(!showWhatsAppComposer)}
                  className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp Update</span>
                </button>
              </div>

              {/* WhatsApp Message Preview Drawer */}
              {showWhatsAppComposer && (
                <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                    <span>Send WhatsApp Status Notification</span>
                    <span className="text-emerald-800">Status: {order.status}</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Optional kitchen note (e.g. Rider Murugan is 5 mins away)"
                    value={customWhatsAppNote}
                    onChange={(e) => setCustomWhatsAppNote(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white rounded-lg text-xs border border-emerald-300 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleOpenWhatsAppCustomer}
                    className="w-full py-2 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#7BF587]" />
                    <span>Open WhatsApp with Update</span>
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Schedule & Slot */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Delivery Schedule</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Thanjavur Door Delivery
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-stone-500 block uppercase font-medium">Preferred Slot</span>
                <div className="font-bold text-sm text-[#0F2A1D]">
                  {order.deliveryDate} • {order.deliveryTime}
                </div>
              </div>

              {order.deliveryInstructions && (
                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 space-y-0.5">
                  <span className="text-[10px] font-bold uppercase text-amber-900 flex items-center gap-1">
                    <FileText className="w-3 h-3 text-amber-700" />
                    <span>Customer Instructions</span>
                  </span>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {order.deliveryInstructions}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* 3. GOOGLE MAPS LOCATION CARD & BUTTON */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Delivery Address & Google Maps Coordinates
                </span>
              </div>
              <span className="text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded uppercase">
                Source: {order.deliveryLocation.source || 'map'}
              </span>
            </div>

            <div className="p-3 bg-[#FAF9F5] rounded-xl border border-stone-200 space-y-2">
              <div>
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Street Address</span>
                <p className="font-medium text-stone-900 text-xs sm:text-sm leading-relaxed">
                  {order.deliveryAddress || order.deliveryLocation.address}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-200/70 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-stone-500">Coordinates:</span>
                  <code className="font-mono bg-white px-2 py-0.5 rounded border border-stone-300 text-stone-800 font-bold">
                    {order.deliveryLocation.latitude.toFixed(5)}, {order.deliveryLocation.longitude.toFixed(5)}
                  </code>
                  <button
                    type="button"
                    id="btn-copy-coords"
                    onClick={handleCopyCoords}
                    className="p-1 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                    title="Copy coordinates"
                  >
                    {isCopiedCoords ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <span className="text-stone-500 font-medium">
                  Area: <strong className="text-stone-800">{order.deliveryLocation.areaCity || 'Thanjavur'}</strong>
                </span>
              </div>
            </div>

            {/* Prominent "Open Location in Google Maps" Button */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-open-in-google-maps"
              className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <MapPin className="w-4 h-4 text-[#7BF587]" />
              <span>Open Location in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* 4. ITEMS ORDERED BREAKDOWN */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-700" />
                <span>Ordered Items ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
              </span>
              <span className="text-stone-500 text-xs font-medium">Kitchen Bill</span>
            </div>

            <div className="divide-y divide-stone-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.food.image}
                      alt={item.food.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-stone-900 truncate">
                        {item.food.name}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Qty: <strong className="text-stone-800">{item.quantity}</strong> × ₹{item.food.price}
                      </div>
                      {item.notes && (
                        <div className="text-[10px] text-amber-800 italic">
                          Note: {item.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="font-bold text-stone-900 text-sm shrink-0 font-mono">
                    ₹{item.food.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Financial Totals */}
            <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">₹{order.subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-stone-600">
                <span>Delivery Charge</span>
                <span className="text-emerald-700 font-bold">FREE (Thanjavur)</span>
              </div>
              <div className="flex items-baseline justify-between pt-2 border-t border-stone-200 font-bold text-sm sm:text-base text-[#0F2A1D]">
                <span>Total Amount:</span>
                <span className="font-serif text-xl text-emerald-900">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* 5. PAYMENT INFORMATION & VERIFICATION */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Payment Information</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                order.paymentStatus === 'Verified' || order.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  : order.paymentStatus === 'Pending'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-rose-100 text-rose-900'
              }`}>
                Payment: {order.paymentStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Method</span>
                <span className="font-bold text-stone-900 block mt-0.5">
                  {order.paymentDetails.methodLabel}
                </span>
                {order.paymentDetails.utrTransactionId && (
                  <span className="text-[11px] font-mono text-stone-600 block mt-1">
                    UTR/Ref: <strong className="text-stone-900">{order.paymentDetails.utrTransactionId}</strong>
                  </span>
                )}
              </div>

              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200/70 flex flex-col justify-between">
                <span className="text-[10px] text-stone-500 font-bold uppercase block">Payment Verification</span>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    id="btn-mark-payment-verified"
                    onClick={() => onUpdatePaymentStatus(order.orderId, 'Verified')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      order.paymentStatus === 'Verified'
                        ? 'bg-emerald-700 text-white'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Mark Verified
                  </button>
                  <button
                    type="button"
                    id="btn-mark-payment-paid"
                    onClick={() => onUpdatePaymentStatus(order.orderId, 'Paid')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-blue-700 text-white'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Mark Paid
                  </button>
                  <button
                    type="button"
                    id="btn-mark-payment-pending"
                    onClick={() => onUpdatePaymentStatus(order.orderId, 'Pending')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      order.paymentStatus === 'Pending'
                        ? 'bg-amber-700 text-white'
                        : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 6. INTERNAL KITCHEN NOTES */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center justify-between">
              <span>Internal Kitchen / Delivery Notes</span>
              <span className="text-[10px] text-stone-400 font-normal">Visible to staff only</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                id="input-admin-notes"
                placeholder="e.g. Assigned to Rider Murugan, Packed in Box #2..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="flex-1 px-3 py-2 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700 text-stone-900"
              />
              <button
                type="button"
                id="btn-save-admin-notes"
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
              >
                Save
              </button>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-stone-200/80 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-open-whatsapp-footer"
              onClick={handleOpenWhatsAppCustomer}
              className="px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-300"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>Send WhatsApp Update</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
