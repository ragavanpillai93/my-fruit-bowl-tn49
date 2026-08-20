export type DietType = 'veg' | 'egg' | 'non-veg' | 'vegan';

export type MealCategory = 
  | 'all'
  | 'fruit-bowls'
  | 'protein-meals'
  | 'healthy-breakfast'
  | 'healthy-lunch'
  | 'salads'
  | 'sandwiches-rolls'
  | 'meal-packages';

export interface FoodItem {
  id: string;
  name: string;
  category: MealCategory;
  diet: DietType;
  description: string;
  price: number;
  calories?: number;
  protein?: string;
  badge?: string;
  image: string;
  scheduleNote?: string;
  ingredients?: string[];
  isFeatured?: boolean;
  isAvailable?: boolean;
}

export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type OrderPaymentStatus = 'Pending' | 'Paid' | 'Verified' | 'Failed';

export interface AdminOrder extends ConfirmedOrder {
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  adminNotes?: string;
  updatedAt?: string;
}

export type AdminTab = 'dashboard' | 'orders' | 'menu' | 'customers' | 'settings';

export interface CustomerRecord {
  id: string; // phone number sanitized
  customerName: string;
  customerPhone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderId: string;
  lastOrderDate: string;
  firstOrderDate: string;
  addresses: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  displayName?: string;
  role: 'superadmin' | 'kitchen_admin' | 'staff';
  createdAt: string;
  lastLoginAt?: string;
}

export interface PackagePlan {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  originalPrice?: number;
  period: string;
  mealsCount: string;
  features: string[];
  isPopular?: boolean;
  badge?: string;
  tagline?: string;
  bgColor?: string;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
  notes?: string;
}

export interface DeliveryLocation {
  address: string;
  areaCity: string;
  latitude: number;
  longitude: number;
  mapsUrl: string;
  deliveryInstructions?: string;
  source?: 'gps' | 'map' | 'search' | 'preset';
}

export type DeliveryTimeSlot = 
  | 'ASAP'
  | '8 AM – 10 AM'
  | '10 AM – 12 PM'
  | '12 PM – 2 PM'
  | '4 PM – 6 PM'
  | '6 PM – 8 PM';

export type DeliveryTimeOption = DeliveryTimeSlot;

export type PaymentMethodType = 'cod' | 'upi' | 'pay-after-confirmation';

export interface PaymentDetails {
  method: PaymentMethodType;
  methodLabel: string;
  upiId?: string;
  utrTransactionId?: string;
  isPaymentMarkedDone?: boolean;
}

export interface ConfirmedOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryDate: string;
  deliveryTime: string;
  deliveryLocation: DeliveryLocation;
  deliveryInstructions?: string;
  paymentDetails: PaymentDetails;
  createdAt: string;
}
