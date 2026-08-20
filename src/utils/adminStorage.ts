import { AdminOrder, ConfirmedOrder, FoodItem, OrderPaymentStatus, OrderStatus } from '../types';
import { FOOD_ITEMS, WHATSAPP_NUMBER } from '../data/foodData';
import { INITIAL_SAMPLE_ORDERS } from '../data/sampleOrders';

const ADMIN_ORDERS_KEY = 'mfb_admin_orders_v1';
const ADMIN_MENU_KEY = 'mfb_admin_menu_v1';
const ADMIN_AUTH_KEY = 'mfb_admin_authenticated_v1';
const ADMIN_STORE_SETTINGS_KEY = 'mfb_admin_store_settings_v1';

// Default Admin Passcode / PIN
export const DEFAULT_ADMIN_PIN = '4949';
export const DEFAULT_ADMIN_PASSWORD = 'admin';

export interface StoreSettings {
  isStoreOpen: boolean;
  storeStatusNote: string;
  upiId: string;
  upiName: string;
  contactPhone: string;
  autoConfirmOrders: boolean;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  isStoreOpen: true,
  storeStatusNote: 'Accepting fresh orders in Thanjavur (7 AM - 9 PM)',
  upiId: '9345714473@okbizaxis',
  upiName: 'My Fruit Bowl TN 49',
  contactPhone: '+91 9345714473',
  autoConfirmOrders: false,
};

// ==========================================
// 1. ADMIN AUTHENTICATION
// ==========================================

export const checkIsAdminLoggedIn = (): boolean => {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
};

export const adminLogin = (pinOrPassword: string): boolean => {
  const clean = pinOrPassword.trim();
  if (clean === DEFAULT_ADMIN_PIN || clean.toLowerCase() === DEFAULT_ADMIN_PASSWORD) {
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } catch {
      // ignore
    }
    return true;
  }
  return false;
};

export const adminLogout = (): void => {
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
  } catch {
    // ignore
  }
};

// ==========================================
// 2. ORDER STORAGE & MANAGEMENT
// ==========================================

export const getAdminOrders = (): AdminOrder[] => {
  try {
    const saved = localStorage.getItem(ADMIN_ORDERS_KEY);
    if (saved) {
      const parsed: AdminOrder[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load admin orders, using defaults', e);
  }
  // Initialize with realistic sample orders
  saveAdminOrders(INITIAL_SAMPLE_ORDERS);
  return INITIAL_SAMPLE_ORDERS;
};

export const saveAdminOrders = (orders: AdminOrder[]): void => {
  try {
    localStorage.setItem(ADMIN_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save admin orders', e);
  }
};

/**
 * Record a new order submitted by a customer
 */
export const recordCustomerOrderToAdmin = (order: ConfirmedOrder): AdminOrder => {
  const currentOrders = getAdminOrders();
  
  // Check if orderId already exists
  const existingIdx = currentOrders.findIndex((o) => o.orderId === order.orderId);
  
  const adminOrder: AdminOrder = {
    ...order,
    status: 'New',
    paymentStatus: order.paymentDetails.isPaymentMarkedDone ? 'Paid' : 'Pending',
    updatedAt: new Date().toISOString(),
  };

  let updatedOrders: AdminOrder[];
  if (existingIdx >= 0) {
    updatedOrders = [...currentOrders];
    updatedOrders[existingIdx] = adminOrder;
  } else {
    // Put newest at the top
    updatedOrders = [adminOrder, ...currentOrders];
  }

  saveAdminOrders(updatedOrders);
  return adminOrder;
};

export const updateOrderStatus = (
  orderId: string,
  newStatus: OrderStatus,
  adminNotes?: string
): AdminOrder | null => {
  const currentOrders = getAdminOrders();
  const index = currentOrders.findIndex((o) => o.orderId === orderId);
  if (index === -1) return null;

  const order = currentOrders[index];
  
  // Auto-sync payment status for delivered orders if COD
  let updatedPaymentStatus = order.paymentStatus;
  if (newStatus === 'Delivered' && order.paymentDetails.method === 'cod' && order.paymentStatus === 'Pending') {
    updatedPaymentStatus = 'Paid';
  } else if (newStatus === 'Cancelled') {
    updatedPaymentStatus = 'Failed';
  }

  const updated: AdminOrder = {
    ...order,
    status: newStatus,
    paymentStatus: updatedPaymentStatus,
    adminNotes: adminNotes !== undefined ? adminNotes : order.adminNotes,
    updatedAt: new Date().toISOString(),
  };

  currentOrders[index] = updated;
  saveAdminOrders(currentOrders);
  return updated;
};

export const updateOrderPaymentStatus = (
  orderId: string,
  paymentStatus: OrderPaymentStatus
): AdminOrder | null => {
  const currentOrders = getAdminOrders();
  const index = currentOrders.findIndex((o) => o.orderId === orderId);
  if (index === -1) return null;

  const updated: AdminOrder = {
    ...currentOrders[index],
    paymentStatus,
    updatedAt: new Date().toISOString(),
  };

  currentOrders[index] = updated;
  saveAdminOrders(currentOrders);
  return updated;
};

export const resetSampleOrders = (): AdminOrder[] => {
  saveAdminOrders(INITIAL_SAMPLE_ORDERS);
  return INITIAL_SAMPLE_ORDERS;
};

// ==========================================
// 3. MENU STORAGE & MANAGEMENT
// ==========================================

export const getAdminMenuItems = (): FoodItem[] => {
  try {
    const saved = localStorage.getItem(ADMIN_MENU_KEY);
    if (saved) {
      const parsed: FoodItem[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load admin menu items', e);
  }
  // Initialize with default items with isAvailable = true
  const initial = FOOD_ITEMS.map((item) => ({
    ...item,
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
  }));
  saveAdminMenuItems(initial);
  return initial;
};

export const saveAdminMenuItems = (items: FoodItem[]): void => {
  try {
    localStorage.setItem(ADMIN_MENU_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save menu items', e);
  }
};

export const addMenuItem = (item: Omit<FoodItem, 'id'>): FoodItem => {
  const current = getAdminMenuItems();
  const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  const newItem: FoodItem = {
    ...item,
    id,
    isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
  };
  const updated = [newItem, ...current];
  saveAdminMenuItems(updated);
  return newItem;
};

export const updateMenuItem = (item: FoodItem): FoodItem => {
  const current = getAdminMenuItems();
  const index = current.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    current[index] = item;
    saveAdminMenuItems(current);
  }
  return item;
};

export const deleteMenuItem = (itemId: string): boolean => {
  const current = getAdminMenuItems();
  const filtered = current.filter((i) => i.id !== itemId);
  if (filtered.length !== current.length) {
    saveAdminMenuItems(filtered);
    return true;
  }
  return false;
};

export const toggleItemAvailability = (itemId: string): FoodItem | null => {
  const current = getAdminMenuItems();
  const item = current.find((i) => i.id === itemId);
  if (item) {
    item.isAvailable = item.isAvailable === false ? true : false;
    saveAdminMenuItems(current);
    return item;
  }
  return null;
};

export const resetMenuToDefaults = (): FoodItem[] => {
  const initial = FOOD_ITEMS.map((item) => ({
    ...item,
    isAvailable: true,
  }));
  saveAdminMenuItems(initial);
  return initial;
};

// ==========================================
// 4. STORE SETTINGS
// ==========================================

export const getStoreSettings = (): StoreSettings => {
  try {
    const saved = localStorage.getItem(ADMIN_STORE_SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_STORE_SETTINGS;
};

export const saveStoreSettings = (settings: StoreSettings): void => {
  try {
    localStorage.setItem(ADMIN_STORE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save store settings', e);
  }
};

// ==========================================
// 5. WHATSAPP CUSTOMER STATUS UPDATER
// ==========================================

export const generateCustomerStatusWhatsAppUrl = (
  order: AdminOrder,
  customNote?: string
): string => {
  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
  const recipient = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  let statusEmoji = '🥗';
  let statusMessage = '';

  switch (order.status) {
    case 'New':
      statusEmoji = '📥';
      statusMessage = 'We have received your order request at My Fruit Bowl TN 49 and our kitchen team is reviewing it.';
      break;
    case 'Confirmed':
      statusEmoji = '✅';
      statusMessage = 'Your order is CONFIRMED! Our chefs are preparing your fresh cuts and ingredients.';
      break;
    case 'Preparing':
      statusEmoji = '👨‍🍳';
      statusMessage = 'Your order is currently being freshly cut, prepared & packed under strict hygiene standards in our Thanjavur kitchen.';
      break;
    case 'Out for Delivery':
      statusEmoji = '🛵';
      statusMessage = 'Your order is OUT FOR DELIVERY! Our delivery partner is on the way to your Thanjavur address.';
      break;
    case 'Delivered':
      statusEmoji = '🎉';
      statusMessage = 'Your order has been DELIVERED! Enjoy your healthy fresh meal from My Fruit Bowl TN 49.';
      break;
    case 'Cancelled':
      statusEmoji = '⚠️';
      statusMessage = 'Your order has been cancelled as per request / kitchen update.';
      break;
  }

  const itemsList = order.items
    .map((it) => `• ${it.food.name} (Qty: ${it.quantity})`)
    .join('\n');

  const text = `*MY FRUIT BOWL TN 49 - ORDER UPDATE* ${statusEmoji}
---------------------------------
Hello *${order.customerName}*,

*Status:* *${order.status.toUpperCase()}*
*Order ID:* ${order.orderId}
*Total Amount:* ₹${order.totalAmount}
*Payment Method:* ${order.paymentDetails.methodLabel} (${order.paymentStatus})

*Items:*
${itemsList}

*Delivery Address:*
${order.deliveryAddress}

*Update:*
${statusMessage}
${customNote ? `\n*Kitchen Note:* ${customNote}` : ''}

For any assistance or questions, feel free to message us here on WhatsApp (+91 9345714473).

_Thank you for eating healthy with My Fruit Bowl TN 49!_`;

  return `https://wa.me/${recipient}?text=${encodeURIComponent(text)}`;
};
