import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  MessageCircle,
  ShoppingBag,
  MapPin,
  Clock,
  AlertCircle,
  User,
  Phone,
  FileText,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  CreditCard
} from 'lucide-react';
import { CartItem, DeliveryLocation, DeliveryTimeSlot, ConfirmedOrder, PaymentDetails } from '../types';
import { DeliveryLocationSection } from './DeliveryLocationSection';
import { DeliveryTimePicker } from './DeliveryTimePicker';
import { PaymentMethodSection } from './PaymentMethodSection';
import { OrderSummaryCard } from './OrderSummaryCard';
import { OrderSuccessScreen } from './OrderSuccessScreen';
import { DEFAULT_BUSINESS_UPI_ID } from '../data/foodData';
import { recordCustomerOrderToAdmin } from '../utils/adminStorage';
import { saveCustomerOrderToFirestore } from '../services/firestoreService';
import {
  generateOrderId,
  validateIndianMobile,
  formatOrderWhatsAppMessage,
  getOrderWhatsAppUrl,
  formatDisplayPhone
} from '../utils/order';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (foodId: string, quantity: number) => void;
  onRemoveItem: (foodId: string) => void;
  onClearCart: () => void;
  deliveryLocation: DeliveryLocation | null;
  onUpdateLocation: (location: DeliveryLocation) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  deliveryLocation,
  onUpdateLocation,
}) => {
  // Navigation step in checkout drawer: 'tray' | 'details' | 'summary' | 'success'
  const [activeStep, setActiveStep] = useState<'tray' | 'details' | 'summary' | 'success'>('tray');

  // Customer details
  const [customerName, setCustomerName] = useState(() => {
    try {
      return localStorage.getItem('mfb_customer_name') || '';
    } catch {
      return '';
    }
  });

  const [customerPhone, setCustomerPhone] = useState(() => {
    try {
      return localStorage.getItem('mfb_customer_phone') || '';
    } catch {
      return '';
    }
  });

  const [deliveryAddress, setDeliveryAddress] = useState(() => {
    try {
      return localStorage.getItem('mfb_delivery_address') || '';
    } catch {
      return '';
    }
  });

  // Delivery Schedule
  const [deliveryDate, setDeliveryDate] = useState<string>('Today');
  const [deliverySlot, setDeliverySlot] = useState<DeliveryTimeSlot>('ASAP');

  // Delivery Instructions
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    deliveryLocation?.deliveryInstructions || ''
  );

  // Payment Details
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>(() => {
    return {
      method: 'cod',
      methodLabel: 'Cash on Delivery',
      upiId: DEFAULT_BUSINESS_UPI_ID,
      isPaymentMarkedDone: false,
      utrTransactionId: '',
    };
  });

  // Auto-generated Order ID
  const [currentOrderId, setCurrentOrderId] = useState(() => generateOrderId());

  // Confirmed Order result for Success Screen
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  // Validation Error mapping
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    location?: string;
    slot?: string;
    payment?: string;
    general?: string;
  }>({});

  // Sync delivery address when location is picked on map
  useEffect(() => {
    if (deliveryLocation?.address && !deliveryAddress) {
      setDeliveryAddress(deliveryLocation.address);
    }
  }, [deliveryLocation]);

  // Sync delivery instructions if location changes
  useEffect(() => {
    if (deliveryLocation?.deliveryInstructions && !deliveryInstructions) {
      setDeliveryInstructions(deliveryLocation.deliveryInstructions);
    }
  }, [deliveryLocation]);

  // If new items are added to cart, ensure success screen doesn't block the cart tray
  useEffect(() => {
    if (cart.length > 0 && activeStep === 'success') {
      setActiveStep('tray');
      setConfirmedOrder(null);
    }
  }, [cart]);

  // If cart is cleared or emptied while on details/summary, reset step appropriately
  useEffect(() => {
    if (cart.length === 0 && (activeStep === 'details' || activeStep === 'summary')) {
      setActiveStep('tray');
    }
  }, [cart.length, activeStep]);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.food.price * item.quantity, 0);
  const deliveryFee = 0; // Free delivery in Thanjavur
  const totalAmount = subtotal + deliveryFee;

  // Validation Handler
  const validateDetails = (): boolean => {
    const errors: {
      name?: string;
      phone?: string;
      address?: string;
      location?: string;
      slot?: string;
      payment?: string;
      general?: string;
    } = {};

    // 1. Full Name
    if (!customerName.trim()) {
      errors.name = 'Please enter your full name.';
    }

    // 2. Mobile Number (Valid Indian Number)
    const phoneValidation = validateIndianMobile(customerPhone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.error || 'Please enter a valid 10-digit Indian mobile number.';
    }

    // 3. Delivery Address
    if (!deliveryAddress.trim() && (!deliveryLocation || !deliveryLocation.address)) {
      errors.address = 'Please enter your delivery address / street details.';
    }

    // 4. Delivery Location on Map
    if (!deliveryLocation || !deliveryLocation.address) {
      errors.location = 'Please pin your delivery location on the map.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const errorMsg = Object.values(errors)[0];
      errors.general = errorMsg;
      return false;
    }

    return true;
  };

  const handleProceedToSummary = () => {
    if (validateDetails()) {
      // Persist details for convenience
      try {
        localStorage.setItem('mfb_customer_name', customerName.trim());
        localStorage.setItem('mfb_customer_phone', customerPhone.trim());
        localStorage.setItem('mfb_delivery_address', deliveryAddress.trim());
      } catch {
        // ignore
      }
      setFieldErrors({});
      setActiveStep('summary');
    }
  };

  // WhatsApp Order Confirmation Handler
  const handleConfirmOrderWhatsApp = async () => {
    if (!validateDetails()) {
      setActiveStep('details');
      return;
    }

    const orderIdToUse = currentOrderId || generateOrderId();

    const orderData: ConfirmedOrder = {
      orderId: orderIdToUse,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryAddress: deliveryAddress.trim() || deliveryLocation!.address,
      items: cart,
      subtotal: subtotal,
      deliveryFee: deliveryFee,
      totalAmount: totalAmount,
      deliveryDate: deliveryDate,
      deliveryTime: deliverySlot,
      deliveryLocation: {
        ...deliveryLocation!,
        address: deliveryAddress.trim() || deliveryLocation!.address,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      },
      deliveryInstructions: deliveryInstructions.trim() || undefined,
      paymentDetails: paymentDetails,
      createdAt: new Date().toISOString(),
    };

    setConfirmedOrder(orderData);

    // 1. Save order to Firestore cloud database
    try {
      await saveCustomerOrderToFirestore(orderData);
    } catch (err) {
      console.warn('Could not save to Firestore directly, keeping offline fallback:', err);
    }

    // 2. Save order to local storage backup
    try {
      recordCustomerOrderToAdmin(orderData);
    } catch (err) {
      console.warn('Failed to record order to admin storage', err);
    }

    // 3. Clear cart items for fresh subsequent orders
    onClearCart();

    // 4. Generate WhatsApp URL & open
    const url = getOrderWhatsAppUrl(orderData);
    window.open(url, '_blank');

    // 5. Transition to Order Success Screen
    setActiveStep('success');
  };

  // Handlers for Success Screen Actions
  const handleContinueShoppingFromSuccess = () => {
    setConfirmedOrder(null);
    setActiveStep('tray');
    setCurrentOrderId(generateOrderId());
    setFieldErrors({});
    onClose();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCloseSuccess = () => {
    setConfirmedOrder(null);
    setActiveStep('tray');
    setCurrentOrderId(generateOrderId());
    setFieldErrors({});
    onClose();
  };

  const handleContinueShopping = () => {
    onClose();
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" id="cart-drawer-container">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-2 sm:pl-10">
        <div className="w-screen max-w-lg bg-[#FAF9F5] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="px-4 sm:px-6 py-3.5 bg-white border-b border-[#1A2E26]/10 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F2A1D] flex items-center gap-2 truncate">
                  <span>
                    {activeStep === 'success'
                      ? 'Order Status'
                      : activeStep === 'summary'
                      ? 'Order Summary & Confirm'
                      : activeStep === 'details'
                      ? 'Customer & Delivery Details'
                      : 'Cart Review'}
                  </span>
                  {(activeStep === 'details' || activeStep === 'summary') && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold shrink-0">
                      {currentOrderId}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-[#1A2E26]/60 font-medium">
                  {activeStep === 'success'
                    ? 'Dispatched to WhatsApp'
                    : `${cart.reduce((s, i) => s + i.quantity, 0)} items in Thanjavur Tray`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {cart.length > 0 && activeStep === 'tray' && (
                <button
                  type="button"
                  id="btn-clear-cart"
                  onClick={onClearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  Clear Tray
                </button>
              )}
              <button
                type="button"
                id="btn-close-cart-drawer"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Checkout Steps Progress Bar */}
          {cart.length > 0 && activeStep !== 'success' && (
            <div className="bg-white px-4 py-2 border-b border-stone-200/80 flex items-center justify-between text-xs font-semibold shrink-0">
              {/* Step 1: Cart Review */}
              <button
                type="button"
                id="step-tab-tray"
                onClick={() => setActiveStep('tray')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeStep === 'tray'
                    ? 'bg-[#0F2A1D] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>1. Cart Review</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

              {/* Step 2: Customer & Delivery Details */}
              <button
                type="button"
                id="step-tab-details"
                onClick={() => setActiveStep('details')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeStep === 'details'
                    ? 'bg-[#0F2A1D] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>2. Delivery & Payment</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />

              {/* Step 3: Summary & Order */}
              <button
                type="button"
                id="step-tab-summary"
                onClick={() => {
                  if (validateDetails()) {
                    setActiveStep('summary');
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  activeStep === 'summary'
                    ? 'bg-[#0F2A1D] text-white shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>3. Summary</span>
              </button>
            </div>
          )}

          {/* Drawer Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            
            {/* STEP 1: Empty State */}
            {cart.length === 0 && activeStep !== 'success' && (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-3xl flex items-center justify-center mx-auto shadow-inner">
                  🥗
                </div>
                <h4 className="font-serif text-xl font-bold text-[#0F2A1D]">Your meal tray is empty</h4>
                <p className="text-xs text-[#1A2E26]/70 max-w-xs mx-auto leading-relaxed">
                  Browse our fresh fruit bowls, protein meals, salads, and healthy breakfast options in Thanjavur to get started.
                </p>
                <button
                  type="button"
                  id="btn-empty-cart-browse"
                  onClick={handleContinueShopping}
                  className="mt-2 px-6 py-2.5 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs font-bold rounded-full shadow-sm transition-all cursor-pointer"
                >
                  Browse Fresh Menu
                </button>
              </div>
            )}

            {/* STEP 1: Cart Review Tray */}
            {cart.length > 0 && activeStep === 'tray' && (
              <div className="space-y-4 animate-in fade-in duration-200" id="step-content-tray">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0F2A1D] uppercase tracking-wider">
                    Selected Items ({cart.reduce((s, i) => s + i.quantity, 0)})
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Fresh Daily Prep
                  </span>
                </div>

                {/* Items List */}
                <div className="space-y-2.5">
                  {cart.map((item) => (
                    <div
                      key={item.food.id}
                      className="bg-white p-3.5 rounded-2xl border border-[#1A2E26]/8 shadow-2xs flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.food.image}
                        alt={item.food.name}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#0F2A1D] truncate">
                          {item.food.name}
                        </h4>
                        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs">
                          <span className="text-[11px] text-stone-500 font-medium">
                            Unit: <strong className="text-stone-700">₹{item.food.price}</strong>
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-xs text-emerald-800 font-bold">
                            Total: ₹{item.food.price * item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5 bg-[#FAF9F5] p-1 rounded-xl border border-[#1A2E26]/10 shrink-0">
                        <button
                          type="button"
                          id={`btn-cart-minus-${item.food.id}`}
                          onClick={() => onUpdateQuantity(item.food.id, item.quantity - 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-[#0F2A1D] hover:bg-stone-200 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold text-[#0F2A1D]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          id={`btn-cart-plus-${item.food.id}`}
                          onClick={() => onUpdateQuantity(item.food.id, item.quantity + 1)}
                          className="w-6 h-6 rounded-lg bg-white shadow-2xs flex items-center justify-center text-[#0F2A1D] hover:bg-stone-200 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Item */}
                      <button
                        type="button"
                        id={`btn-cart-remove-${item.food.id}`}
                        onClick={() => onRemoveItem(item.food.id)}
                        className="text-stone-400 hover:text-rose-600 p-1.5 transition-colors cursor-pointer shrink-0 rounded-lg hover:bg-rose-50"
                        title="Remove item from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Delivery Perks Banner */}
                <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-bold text-emerald-950 block text-[11px]">
                        Doorstep Delivery in Thanjavur:
                      </span>
                      <span className="text-stone-700 text-xs truncate block">
                        {deliveryLocation ? deliveryLocation.address : 'Thanjavur City & Surroundings (TN 49)'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-emerald-900 bg-white px-2.5 py-1 rounded-md border border-emerald-200 shrink-0 shadow-2xs">
                    Free Delivery
                  </span>
                </div>
              </div>
            )}

            {/* STEP 2: Customer Details, Location, Schedule & Payment Method */}
            {cart.length > 0 && activeStep === 'details' && (
              <div className="space-y-4 animate-in fade-in duration-200" id="step-content-details">
                
                {/* 1. CUSTOMER DETAILS */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A2E26]/10 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-700" />
                      <span className="text-xs font-bold text-[#0F2A1D] uppercase tracking-wider">
                        Customer Details <span className="text-rose-500">*</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 font-medium">Contact Info</span>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="input-customer-full-name"
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (fieldErrors.name) {
                          setFieldErrors({ ...fieldErrors, name: undefined, general: undefined });
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 bg-[#FAF9F5] rounded-xl text-xs sm:text-sm border ${
                        fieldErrors.name
                          ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/40'
                          : 'border-[#1A2E26]/15 focus:ring-1 focus:ring-emerald-600'
                      } focus:outline-none text-stone-900`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.name}</span>
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex rounded-xl overflow-hidden border border-[#1A2E26]/15 focus-within:ring-1 focus-within:ring-emerald-600 bg-[#FAF9F5]">
                      <div className="px-3 py-2.5 bg-stone-100 border-r border-stone-200 flex items-center gap-1 text-xs font-bold text-stone-700 shrink-0">
                        <span>🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        id="input-customer-phone-number"
                        placeholder="98765 43210"
                        maxLength={14}
                        value={customerPhone}
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          if (fieldErrors.phone) {
                            setFieldErrors({ ...fieldErrors, phone: undefined, general: undefined });
                          }
                        }}
                        className={`w-full px-3 py-2 text-xs sm:text-sm bg-transparent focus:outline-none text-stone-900 ${
                          fieldErrors.phone ? 'bg-rose-50/40' : ''
                        }`}
                      />
                    </div>
                    {fieldErrors.phone ? (
                      <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.phone}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-stone-500 mt-1">
                        Order confirmation and live kitchen status will be sent to this WhatsApp number.
                      </p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                      Delivery Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="input-customer-delivery-address"
                      rows={2}
                      placeholder="Door / Flat No., Building Name, Street / Road, Area in Thanjavur..."
                      value={deliveryAddress}
                      onChange={(e) => {
                        setDeliveryAddress(e.target.value);
                        if (fieldErrors.address) {
                          setFieldErrors({ ...fieldErrors, address: undefined, general: undefined });
                        }
                      }}
                      className={`w-full px-3.5 py-2 bg-[#FAF9F5] rounded-xl text-xs sm:text-sm border ${
                        fieldErrors.address
                          ? 'border-rose-400 ring-1 ring-rose-400 bg-rose-50/40'
                          : 'border-[#1A2E26]/15 focus:ring-1 focus:ring-emerald-600'
                      } focus:outline-none text-stone-900 resize-none`}
                    />
                    {fieldErrors.address && (
                      <p className="text-[11px] text-rose-600 mt-0.5 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* 2. DELIVERY LOCATION ON MAP */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A2E26]/10 shadow-2xs space-y-3">
                  <DeliveryLocationSection
                    location={deliveryLocation}
                    onLocationChange={(loc) => {
                      if (fieldErrors.location) {
                        setFieldErrors({ ...fieldErrors, location: undefined, general: undefined });
                      }
                      onUpdateLocation(loc);
                      if (!deliveryAddress) {
                        setDeliveryAddress(loc.address);
                      }
                    }}
                    instructions={deliveryInstructions}
                    error={fieldErrors.location}
                  />
                </div>

                {/* 3. PREFERRED DELIVERY DATE & TIME SLOTS */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A2E26]/10 shadow-2xs space-y-3">
                  <DeliveryTimePicker
                    selectedDate={deliveryDate}
                    onSelectDate={setDeliveryDate}
                    selectedSlot={deliverySlot}
                    onSelectSlot={(slot) => {
                      setDeliverySlot(slot);
                      if (fieldErrors.slot) {
                        setFieldErrors({ ...fieldErrors, slot: undefined, general: undefined });
                      }
                    }}
                    deliveryInstructions={deliveryInstructions}
                    onInstructionsChange={setDeliveryInstructions}
                    error={fieldErrors.slot}
                  />

                  {/* Optional Delivery Instructions */}
                  <div className="pt-2 border-t border-stone-100">
                    <label className="block text-[11px] font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-stone-500" />
                      <span>Optional Delivery Instructions</span>
                    </label>
                    <input
                      type="text"
                      id="input-delivery-notes-optional"
                      placeholder="e.g. Ring bell, Leave at reception, Near medical shop..."
                      value={deliveryInstructions}
                      onChange={(e) => {
                        setDeliveryInstructions(e.target.value);
                        if (deliveryLocation) {
                          onUpdateLocation({
                            ...deliveryLocation,
                            deliveryInstructions: e.target.value,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-[#FAF9F5] rounded-xl text-xs border border-stone-200 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-stone-900"
                    />
                  </div>
                </div>

                {/* 4. PAYMENT METHOD SECTION */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#1A2E26]/10 shadow-2xs space-y-3">
                  <PaymentMethodSection
                    paymentDetails={paymentDetails}
                    onPaymentChange={(newDetails) => {
                      setPaymentDetails(newDetails);
                      if (fieldErrors.payment) {
                        setFieldErrors({ ...fieldErrors, payment: undefined, general: undefined });
                      }
                    }}
                    totalAmount={totalAmount}
                    orderId={currentOrderId}
                    error={fieldErrors.payment}
                  />
                </div>

                {/* Validation Error Alert Banner */}
                {fieldErrors.general && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-2xl flex items-start gap-2.5 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Please complete missing details:</strong>
                      <span>{fieldErrors.general}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Order Summary & Confirm */}
            {cart.length > 0 && activeStep === 'summary' && (
              <div className="space-y-4 animate-in fade-in duration-200" id="step-content-summary">
                
                <OrderSummaryCard
                  orderId={currentOrderId}
                  customerName={customerName}
                  customerPhone={customerPhone}
                  deliveryAddress={deliveryAddress}
                  items={cart}
                  subtotal={subtotal}
                  deliveryFee={deliveryFee}
                  totalAmount={totalAmount}
                  deliveryDate={deliveryDate}
                  deliveryTime={deliverySlot}
                  deliveryLocation={deliveryLocation}
                  deliveryInstructions={deliveryInstructions}
                  paymentDetails={paymentDetails}
                />

                {/* Fast Summary Note */}
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/90 text-xs text-emerald-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>
                    Clicking below will format your order with payment mode ({paymentDetails.methodLabel}) and open WhatsApp directly with our kitchen.
                  </span>
                </div>
              </div>
            )}

            {/* STEP 4: Success Screen */}
            {activeStep === 'success' && confirmedOrder && (
              <OrderSuccessScreen
                order={confirmedOrder}
                onContinueShopping={handleContinueShoppingFromSuccess}
                onClose={handleCloseSuccess}
              />
            )}

          </div>

          {/* Drawer Footer Actions */}
          {cart.length > 0 && activeStep !== 'success' && (
            <div className="p-4 sm:p-5 bg-white border-t border-[#1A2E26]/10 space-y-3 shrink-0">
              
              {/* STEP 1 FOOTER: Proceed to Details & Continue Shopping */}
              {activeStep === 'tray' && (
                <>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-[#1A2E26]/70">Delivery in Thanjavur:</span>
                    <span className="text-emerald-700 font-bold text-xs uppercase bg-emerald-100 px-2 py-0.5 rounded-md">
                      FREE DELIVERY
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between">
                    <span className="font-serif text-base font-bold text-[#0F2A1D]">Grand Total:</span>
                    <span className="font-serif text-2xl font-bold text-[#0F2A1D]">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      id="btn-proceed-to-details"
                      onClick={() => {
                        setFieldErrors({});
                        setActiveStep('details');
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-sm font-bold rounded-2xl shadow-lg transition-all transform active:scale-98 cursor-pointer"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      id="btn-continue-shopping-tray"
                      onClick={handleContinueShopping}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-100 hover:bg-stone-200 text-[#0F2A1D] text-xs sm:text-sm font-semibold rounded-2xl transition-all cursor-pointer"
                    >
                      <span>Continue Shopping</span>
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2 FOOTER: Proceed to Summary */}
              {activeStep === 'details' && (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      id="btn-back-to-tray"
                      onClick={() => setActiveStep('tray')}
                      className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Cart Review</span>
                    </button>
                    <span className="font-serif text-base font-bold text-emerald-900">
                      Total: ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    type="button"
                    id="btn-review-order-summary"
                    onClick={handleProceedToSummary}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-sm font-bold rounded-2xl shadow-lg transition-all transform active:scale-98 cursor-pointer"
                  >
                    <span>Review Order Summary</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* STEP 3 FOOTER: Confirm & Order via WhatsApp */}
              {activeStep === 'summary' && (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      id="btn-back-to-details"
                      onClick={() => setActiveStep('details')}
                      className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Edit Details & Payment</span>
                    </button>
                    <span className="font-serif text-lg font-bold text-emerald-900">
                      Final Total: ₹{totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Large "Confirm & Order via WhatsApp" Button */}
                  <button
                    type="button"
                    id="btn-confirm-order-whatsapp-main"
                    onClick={handleConfirmOrderWhatsApp}
                    className="w-full flex items-center justify-center gap-2.5 py-4 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-base font-bold rounded-2xl shadow-xl transition-all transform active:scale-98 cursor-pointer group"
                  >
                    <MessageCircle className="w-5 h-5 text-[#7BF587] fill-[#7BF587] shrink-0 group-hover:scale-110 transition-transform" />
                    <span>Confirm & Order via WhatsApp</span>
                  </button>

                  <p className="text-[10px] text-center text-stone-500 font-medium">
                    Payment Mode: <strong className="text-stone-700">{paymentDetails.methodLabel}</strong> • Instant dispatch to My Fruit Bowl TN 49 kitchen.
                  </p>
                </>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
