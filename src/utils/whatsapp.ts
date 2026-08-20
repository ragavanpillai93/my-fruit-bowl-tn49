import { FoodItem, PackagePlan, CartItem, DeliveryLocation } from '../types';
import { WHATSAPP_NUMBER, STORE_LOCATION } from '../data/foodData';

export function generateGoogleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

export function getWhatsAppUrl(text: string, phone: string = WHATSAPP_NUMBER): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text.trim())}`;
}

export function getHeroWhatsAppUrl(): string {
  return getWhatsAppUrl('Hi, I would like to order from My Fruit Bowl TN 49.');
}

export function getFoodOrderWhatsAppUrl(
  food: FoodItem, 
  quantity: number = 1, 
  notes?: string,
  location?: DeliveryLocation | null
): string {
  let msg = `Hi! I would like to order from My Fruit Bowl TN 49.\n\n`;
  msg += `Item: ${food.name}\n`;
  msg += `Quantity: ${quantity}\n`;
  msg += `Price: ₹${food.price * quantity}\n`;
  if (food.diet) {
    msg += `Type: ${food.diet.toUpperCase()}\n`;
  }
  if (notes && notes.trim()) {
    msg += `Special Note: ${notes.trim()}\n`;
  }

  if (location) {
    msg += `\nDelivery Location:\n`;
    msg += `Address: ${location.address || 'Thanjavur'}\n`;
    msg += `Google Maps Location: ${location.mapsUrl || generateGoogleMapsLink(location.latitude, location.longitude)}\n`;
    msg += `Latitude: ${location.latitude.toFixed(6)}\n`;
    msg += `Longitude: ${location.longitude.toFixed(6)}\n`;

    if (location.deliveryInstructions && location.deliveryInstructions.trim()) {
      msg += `\nDelivery Instructions:\n${location.deliveryInstructions.trim()}\n`;
    }
  } else {
    msg += `\nDelivery Location:\nAddress: Thanjavur (TN 49)\n`;
  }

  msg += `\nPlease confirm availability and delivery time.`;
  return getWhatsAppUrl(msg);
}

export function getPackageSubscriptionWhatsAppUrl(
  pkg: PackagePlan, 
  customerName?: string,
  location?: DeliveryLocation | null
): string {
  let msg = `Hi! I am interested in subscribing to the *${pkg.name}* plan at My Fruit Bowl TN 49.\n\n`;
  msg += `📦 Plan: ${pkg.name} (${pkg.subtitle})\n`;
  msg += `📊 Meals: ${pkg.mealsCount}\n`;
  msg += `💳 Price: ₹${pkg.price.toLocaleString('en-IN')}/${pkg.period}\n`;
  if (customerName && customerName.trim()) {
    msg += `👤 Name: ${customerName.trim()}\n`;
  }

  if (location) {
    msg += `\nDelivery Location:\n`;
    msg += `Address: ${location.address || 'Thanjavur'}\n`;
    msg += `Google Maps Location: ${location.mapsUrl || generateGoogleMapsLink(location.latitude, location.longitude)}\n`;
    msg += `Latitude: ${location.latitude.toFixed(6)}\n`;
    msg += `Longitude: ${location.longitude.toFixed(6)}\n`;

    if (location.deliveryInstructions && location.deliveryInstructions.trim()) {
      msg += `\nDelivery Instructions:\n${location.deliveryInstructions.trim()}\n`;
    }
  } else {
    msg += `\n📍 Location: Thanjavur (TN 49)\n`;
  }

  msg += `\nPlease let me know the start date and payment instructions.`;
  return getWhatsAppUrl(msg);
}

export function getCartOrderWhatsAppUrl(
  items: CartItem[], 
  customerName?: string, 
  location?: DeliveryLocation | null, 
  deliveryTime?: string,
  specialInstructions?: string
): string {
  if (items.length === 0) {
    return getHeroWhatsAppUrl();
  }

  const totalAmount = items.reduce((sum, item) => sum + (item.food.price * item.quantity), 0);

  let msg = `Hi! I would like to order from My Fruit Bowl TN 49.\n\n`;
  
  items.forEach((item, idx) => {
    msg += `Item ${idx + 1}: ${item.food.name}\n`;
    msg += `Quantity: ${item.quantity}\n`;
    msg += `Price: ₹${item.food.price * item.quantity} (₹${item.food.price} each)\n`;
    if (item.food.diet) {
      msg += `Type: ${item.food.diet.toUpperCase()}\n`;
    }
    if (item.notes) {
      msg += `Note: ${item.notes}\n`;
    }
    msg += `\n`;
  });

  msg += `Total Amount: ₹${totalAmount.toLocaleString('en-IN')}\n`;

  if (customerName && customerName.trim()) {
    msg += `Customer Name: ${customerName.trim()}\n`;
  }
  if (deliveryTime && deliveryTime.trim()) {
    msg += `Preferred Slot: ${deliveryTime.trim()}\n`;
  }

  if (location) {
    msg += `\nDelivery Location:\n`;
    msg += `Address: ${location.address || 'Thanjavur'}\n`;
    msg += `Google Maps Location: ${location.mapsUrl || generateGoogleMapsLink(location.latitude, location.longitude)}\n`;
    msg += `Latitude: ${location.latitude.toFixed(6)}\n`;
    msg += `Longitude: ${location.longitude.toFixed(6)}\n`;

    const instructions = location.deliveryInstructions || specialInstructions;
    if (instructions && instructions.trim()) {
      msg += `\nDelivery Instructions:\n${instructions.trim()}\n`;
    }
  } else {
    msg += `\nDelivery Location:\nAddress: Thanjavur (TN 49)\n`;
    if (specialInstructions && specialInstructions.trim()) {
      msg += `\nDelivery Instructions:\n${specialInstructions.trim()}\n`;
    }
  }

  msg += `\nPlease confirm availability and delivery time.`;

  return getWhatsAppUrl(msg);
}

