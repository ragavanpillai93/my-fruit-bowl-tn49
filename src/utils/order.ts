import { CartItem, DeliveryLocation, ConfirmedOrder, DeliveryTimeSlot, PaymentDetails } from '../types';
import { WHATSAPP_NUMBER } from '../data/foodData';

/**
 * Generate a unique, readable Order ID for My Fruit Bowl TN 49
 * e.g., MFB-49-8392
 */
export function generateOrderId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `MFB-TN49-${randomNum}`;
}

/**
 * Validate standard 10-digit Indian mobile number
 * Accepts formats: 9876543210, +91 9876543210, 98765-43210, 09876543210
 */
export function validateIndianMobile(phone: string): { isValid: boolean; error?: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Mobile number is required' };
  }

  // Remove spaces, hyphens, parentheses, and leading +91 or 91 or 0
  let clean = phone.trim().replace(/[\s\-()]/g, '');

  if (clean.startsWith('+91')) {
    clean = clean.slice(3);
  } else if (clean.startsWith('91') && clean.length === 12) {
    clean = clean.slice(2);
  } else if (clean.startsWith('0') && clean.length === 11) {
    clean = clean.slice(1);
  }

  // Check if exactly 10 digits and starts with 6, 7, 8, or 9
  const indianMobileRegex = /^[6-9]\d{9}$/;

  if (!indianMobileRegex.test(clean)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number (starts with 6, 7, 8, or 9)',
    };
  }

  return { isValid: true };
}

/**
 * Format Indian Mobile number for clean display
 */
export function formatDisplayPhone(phone: string): string {
  let clean = phone.trim().replace(/[\s\-()]/g, '');
  if (clean.startsWith('+91')) clean = clean.slice(3);
  if (clean.startsWith('91') && clean.length === 12) clean = clean.slice(2);
  if (clean.startsWith('0') && clean.length === 11) clean = clean.slice(1);

  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return phone;
}

/**
 * Generates the clean Google Maps link from lat/lng
 */
export function getGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Format order into clean, professional WhatsApp Message
 */
export function formatOrderWhatsAppMessage(order: {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee?: number;
  totalAmount: number;
  deliveryDate?: string;
  deliveryTime: string;
  deliveryLocation: DeliveryLocation;
  deliveryInstructions?: string;
  paymentDetails?: PaymentDetails;
}): string {
  const {
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
    paymentDetails = {
      method: 'cod',
      methodLabel: 'Cash on Delivery (COD)',
    },
  } = order;

  const mapsLink =
    deliveryLocation.mapsUrl ||
    getGoogleMapsUrl(deliveryLocation.latitude, deliveryLocation.longitude);

  let msg = `*NEW ORDER REQUEST - MY FRUIT BOWL TN 49*\n\n`;
  msg += `📋 *ORDER DETAILS*\n`;
  msg += `• *Order ID:* ${orderId}\n\n`;

  msg += `👤 *CUSTOMER DETAILS*\n`;
  msg += `• *Full Name:* ${customerName.trim()}\n`;
  msg += `• *Mobile Number:* ${customerPhone.trim()}\n`;
  msg += `• *Delivery Address:* ${deliveryAddress.trim() || deliveryLocation.address}\n\n`;

  msg += `📍 *LOCATION & MAPS PIN*\n`;
  msg += `• *Selected Area:* ${deliveryLocation.areaCity || 'Thanjavur (TN 49)'}\n`;
  msg += `• *Coordinates:* ${deliveryLocation.latitude.toFixed(6)}, ${deliveryLocation.longitude.toFixed(6)}\n`;
  msg += `• *Google Maps Location:* ${mapsLink}\n\n`;

  msg += `📅 *DELIVERY SCHEDULE*\n`;
  msg += `• *Preferred Date:* ${deliveryDate}\n`;
  msg += `• *Time Slot:* ${deliveryTime}\n\n`;

  msg += `🥗 *ORDERED ITEMS (${items.reduce((s, i) => s + i.quantity, 0)} total)*\n`;
  items.forEach((item, index) => {
    const itemTotal = item.food.price * item.quantity;
    const dietEmoji =
      item.food.diet === 'veg'
        ? '🟢'
        : item.food.diet === 'egg'
        ? '🟡'
        : item.food.diet === 'vegan'
        ? '🌿'
        : '🔴';
    msg += `${index + 1}. ${dietEmoji} *${item.food.name}*\n`;
    msg += `   ↳ Qty: ${item.quantity} × ₹${item.food.price} = *₹${itemTotal}*\n`;
    if (item.notes && item.notes.trim()) {
      msg += `   ↳ Note: ${item.notes.trim()}\n`;
    }
  });
  msg += `\n`;

  msg += `💳 *PAYMENT METHOD*\n`;
  if (paymentDetails.method === 'cod') {
    msg += `• *Method:* Cash on Delivery (Pay when delivered)\n`;
    msg += `• *Note:* Pay in cash or scan delivery partner's UPI QR at doorstep\n\n`;
  } else if (paymentDetails.method === 'upi') {
    msg += `• *Method:* UPI (GPay / PhonePe / Paytm)\n`;
    if (paymentDetails.isPaymentMarkedDone) {
      msg += `• *Customer Status:* Paid via UPI (Self-declared)\n`;
    }
    if (paymentDetails.utrTransactionId && paymentDetails.utrTransactionId.trim()) {
      msg += `• *UTR / Transaction Ref:* ${paymentDetails.utrTransactionId.trim()}\n`;
    }
    msg += `• *Payment Verification:* Pending kitchen verification upon order confirmation\n\n`;
  } else if (paymentDetails.method === 'pay-after-confirmation') {
    msg += `• *Method:* Pay After Confirmation\n`;
    msg += `• *Note:* Customer will pay online/cash once kitchen confirms availability and delivery ETA\n\n`;
  }

  msg += `💰 *ORDER SUMMARY & BILL*\n`;
  msg += `• Item Subtotal: ₹${subtotal}\n`;
  msg += `• Delivery Charge: ${deliveryFee === 0 ? 'FREE (Thanjavur)' : `₹${deliveryFee}`}\n`;
  msg += `• *Final Total: ₹${totalAmount}*\n`;
  msg += `• *Payment Mode:* ${paymentDetails.methodLabel}${
    paymentDetails.utrTransactionId ? ` (UTR: ${paymentDetails.utrTransactionId})` : ''
  }\n\n`;

  const instructions = deliveryInstructions || deliveryLocation.deliveryInstructions;
  if (instructions && instructions.trim()) {
    msg += `📝 *SPECIAL INSTRUCTIONS*\n`;
    msg += `• ${instructions.trim()}\n\n`;
  }

  msg += `Please confirm my order and share estimated preparation & delivery status. Thank you!`;

  return msg;
}

/**
 * Open WhatsApp with formatted text
 */
export function getOrderWhatsAppUrl(
  order: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    items: CartItem[];
    subtotal: number;
    deliveryFee?: number;
    totalAmount: number;
    deliveryDate?: string;
    deliveryTime: string;
    deliveryLocation: DeliveryLocation;
    deliveryInstructions?: string;
    paymentDetails?: PaymentDetails;
  },
  phone: string = WHATSAPP_NUMBER
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = formatOrderWhatsAppMessage(order);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
