import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  increment
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import {
  AdminOrder,
  AdminUserRecord,
  ConfirmedOrder,
  CustomerRecord,
  FoodItem,
  OrderPaymentStatus,
  OrderStatus
} from '../types';
import { FOOD_ITEMS } from '../data/foodData';

// Collection references
export const PRODUCTS_COLLECTION = 'products';
export const ORDERS_COLLECTION = 'orders';
export const CUSTOMERS_COLLECTION = 'customers';
export const ADMIN_USERS_COLLECTION = 'adminUsers';

export interface SeedResult {
  success: boolean;
  reason?: string;
  seededCount?: number;
}

// ==========================================
// 0. FIRESTORE SANITIZATION & SAFE HELPERS
// ==========================================

/**
 * Recursively cleans any object or array so that no field contains `undefined`,
 * `NaN`, or invalid values before being passed to Firestore `setDoc()` or `updateDoc()`.
 */
export const sanitizeForFirestore = <T = any>(data: T): T => {
  if (data === null || data === undefined) {
    return (null as unknown) as T;
  }

  // Numbers: Prevent NaN or Infinity
  if (typeof data === 'number') {
    if (isNaN(data) || !isFinite(data)) {
      return (0 as unknown) as T;
    }
    return data;
  }

  // Primitive strings, booleans
  if (typeof data === 'string' || typeof data === 'boolean') {
    return data;
  }

  // Preserve Firestore FieldValue instances (increment, arrayUnion, serverTimestamp, etc.)
  if (
    typeof data === 'object' &&
    data !== null &&
    (data as any)._methodName !== undefined
  ) {
    return data;
  }

  // Date objects to ISO string
  if (data instanceof Date) {
    if (isNaN(data.getTime())) {
      return (new Date().toISOString() as unknown) as T;
    }
    return (data.toISOString() as unknown) as T;
  }

  // Arrays: recursively sanitize all elements
  if (Array.isArray(data)) {
    return data.map((item) => {
      if (item === undefined) return null;
      return sanitizeForFirestore(item);
    }) as unknown as T;
  }

  // Plain objects
  if (typeof data === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) {
        cleanObj[key] = null;
      } else {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }

  return data;
};

/**
 * Helper to safely sanitize a cart item for Firestore
 */
export const sanitizeCartItem = (cartItem: any) => {
  const it = cartItem?.item || cartItem || {};
  return {
    quantity: Number(cartItem?.quantity) || 1,
    item: {
      id: it.id || '',
      name: it.name || 'Menu Item',
      category: it.category || 'fruit-bowls',
      diet: it.diet || 'Veg',
      description: it.description || '',
      price: Number(it.price) || 0,
      calories: it.calories || '',
      protein: it.protein || '',
      badge: it.badge || '',
      image: it.image || it.imageUrl || '',
      imageUrl: it.image || it.imageUrl || '',
      scheduleNote: it.scheduleNote || '',
      ingredients: Array.isArray(it.ingredients) ? it.ingredients : [],
      isFeatured: Boolean(it.isFeatured),
      isAvailable: it.isAvailable !== undefined ? Boolean(it.isAvailable) : true,
    },
    name: it.name || 'Menu Item',
    price: Number(it.price) || 0,
  };
};

// ==========================================
// 1. PRODUCTS COLLECTION
// ==========================================

/**
 * Converts a Firestore product doc to FoodItem
 */
export const docToFoodItem = (id: string, data: any): FoodItem => {
  return {
    id,
    name: data.name || 'Untitled Bowl',
    category: data.category || 'fruit-bowls',
    diet: data.diet || (data.foodType === 'veg' ? 'veg' : 'veg'),
    description: data.description || '',
    price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
    calories: data.calories,
    protein: data.protein,
    badge: data.badge,
    image: data.image || data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    scheduleNote: data.scheduleNote,
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    isFeatured: Boolean(data.isFeatured),
    isAvailable: data.isAvailable !== undefined ? Boolean(data.isAvailable) : true,
  };
};

/**
 * Subscribes to real-time updates for products (Public read)
 */
export const subscribeProducts = (
  onData: (items: FoodItem[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, PRODUCTS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        onData([]);
        return;
      }
      const items: FoodItem[] = snapshot.docs.map((d) => docToFoodItem(d.id, d.data()));
      onData(items);
    },
    (err) => {
      console.error('Error subscribing to products:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Seeds initial products into Firestore if the collection is empty.
 * Requires an authenticated admin session as per Firestore security rules.
 */
export const seedProductsIfEmpty = async (
  defaultItems: FoodItem[] = FOOD_ITEMS
): Promise<SeedResult> => {
  if (!auth.currentUser) {
    const errorMsg = 'Admin authentication required to seed products in Firestore.';
    console.warn(errorMsg);
    return { success: false, reason: errorMsg };
  }

  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const snap = await getDocs(colRef);
    if (snap.size > 0) {
      return { success: true, seededCount: 0, reason: 'Products already initialized in Firestore.' };
    }

    // Populate all initial dishes in a batch
    const batch = writeBatch(db);
    for (const item of defaultItems) {
      const docRef = doc(db, PRODUCTS_COLLECTION, item.id);
      const safeProduct = sanitizeForFirestore({
        name: item.name || 'Untitled Bowl',
        category: item.category || 'fruit-bowls',
        diet: item.diet || 'Veg',
        foodType: item.diet || 'Veg',
        description: item.description || '',
        price: Number(item.price) || 0,
        calories: item.calories || '',
        protein: item.protein || '',
        badge: item.badge || '',
        image: item.image || '',
        imageUrl: item.image || '',
        scheduleNote: item.scheduleNote || '',
        ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
        isFeatured: Boolean(item.isFeatured),
        isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      batch.set(docRef, safeProduct);
    }
    await batch.commit();
    return { success: true, seededCount: defaultItems.length };
  } catch (err: any) {
    console.error('Failed to seed products to Firestore:', err);
    return {
      success: false,
      reason: err?.message || 'Permission denied or network error during product seeding.'
    };
  }
};

/**
 * Adds a new product to Firestore (Admin only)
 */
export const addProductToFirestore = async (
  item: Omit<FoodItem, 'id'>
): Promise<FoodItem> => {
  if (!auth.currentUser) {
    throw new Error('Admin authentication required: Please log in to add products.');
  }

  const customId =
    item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  const docRef = doc(db, PRODUCTS_COLLECTION, customId);

  const payload = sanitizeForFirestore({
    name: item.name || 'Untitled Bowl',
    category: item.category || 'fruit-bowls',
    diet: item.diet || 'Veg',
    foodType: item.diet || 'Veg',
    description: item.description || '',
    price: Number(item.price) || 0,
    calories: item.calories || '',
    protein: item.protein || '',
    badge: item.badge || '',
    image: item.image || '',
    imageUrl: item.image || '',
    scheduleNote: item.scheduleNote || '',
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
    isFeatured: Boolean(item.isFeatured),
    isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  await setDoc(docRef, payload);
  return { ...item, id: customId };
};

/**
 * Updates an existing product in Firestore (Admin only)
 */
export const updateProductInFirestore = async (item: FoodItem): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Admin authentication required: Please log in to update products.');
  }

  const docRef = doc(db, PRODUCTS_COLLECTION, item.id);
  const updates = sanitizeForFirestore({
    name: item.name || '',
    category: item.category || 'fruit-bowls',
    diet: item.diet || 'Veg',
    foodType: item.diet || 'Veg',
    description: item.description || '',
    price: Number(item.price) || 0,
    calories: item.calories || '',
    protein: item.protein || '',
    badge: item.badge || '',
    image: item.image || '',
    imageUrl: item.image || '',
    scheduleNote: item.scheduleNote || '',
    ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
    isFeatured: Boolean(item.isFeatured),
    isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
    updatedAt: new Date().toISOString(),
  });
  await updateDoc(docRef, updates);
};

/**
 * Toggles product availability (Admin only)
 */
export const toggleProductAvailabilityInFirestore = async (
  itemId: string,
  newAvailability: boolean
): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Admin authentication required: Please log in to toggle dish availability.');
  }

  const docRef = doc(db, PRODUCTS_COLLECTION, itemId);
  await updateDoc(docRef, {
    isAvailable: Boolean(newAvailability),
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Deletes a product from Firestore (Admin only)
 */
export const deleteProductFromFirestore = async (itemId: string): Promise<void> => {
  if (!auth.currentUser) {
    throw new Error('Admin authentication required: Please log in to delete products.');
  }

  const docRef = doc(db, PRODUCTS_COLLECTION, itemId);
  await deleteDoc(docRef);
};

// ==========================================
// 2. ORDERS COLLECTION
// ==========================================

export const docToAdminOrder = (id: string, data: any): AdminOrder => {
  return {
    orderId: data.orderId || id,
    customerName: data.customerName || 'Anonymous',
    customerPhone: data.customerPhone || data.mobileNumber || '',
    deliveryAddress: data.deliveryAddress || '',
    items: Array.isArray(data.items) ? data.items : [],
    subtotal: Number(data.subtotal) || 0,
    deliveryFee: Number(data.deliveryFee ?? data.deliveryCharge) || 0,
    totalAmount: Number(data.totalAmount) || 0,
    deliveryDate: data.deliveryDate || 'Today',
    deliveryTime: data.deliveryTime || data.deliverySlot || 'ASAP',
    deliveryLocation: data.deliveryLocation || {
      address: data.deliveryAddress || '',
      areaCity: data.areaCity || 'Thanjavur',
      latitude: data.latitude || 10.7870,
      longitude: data.longitude || 79.1378,
      mapsUrl: data.googleMapsUrl || data.mapsUrl || '',
    },
    deliveryInstructions: data.deliveryInstructions || data.customerNotes || '',
    paymentDetails: data.paymentDetails || {
      method: data.paymentMethod || 'cod',
      methodLabel: data.paymentMethodLabel || (data.paymentMethod === 'upi' ? 'Direct UPI' : 'Cash on Delivery'),
      isPaymentMarkedDone: data.paymentStatus === 'Paid' || data.paymentStatus === 'Verified',
      utrTransactionId: data.utrTransactionId || '',
    },
    createdAt: data.createdAt || new Date().toISOString(),
    status: (data.status as OrderStatus) || (data.orderStatus as OrderStatus) || 'New',
    paymentStatus: (data.paymentStatus as OrderPaymentStatus) || 'Pending',
    adminNotes: data.adminNotes || '',
    updatedAt: data.updatedAt || '',
  };
};

/**
 * Subscribes to real-time orders for the admin dashboard
 */
export const subscribeOrders = (
  onData: (orders: AdminOrder[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, ORDERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => docToAdminOrder(d.id, d.data()));
      // Sort newest first
      orders.sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });
      onData(orders);
    },
    (err) => {
      console.error('Error subscribing to orders:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Saves a customer placed order directly into Firestore & updates customer collection.
 * Completely sanitizes all fields so no undefined/NaN values are sent to Firestore.
 */
export const saveCustomerOrderToFirestore = async (order: ConfirmedOrder): Promise<AdminOrder> => {
  const safeOrderId = order.orderId || `MFB-${Date.now()}`;
  const docRef = doc(db, ORDERS_COLLECTION, safeOrderId);

  const googleMapsUrl =
    order.deliveryLocation?.mapsUrl ||
    (typeof order.deliveryLocation?.latitude === 'number' && typeof order.deliveryLocation?.longitude === 'number'
      ? `https://www.google.com/maps/search/?api=1&query=${order.deliveryLocation.latitude},${order.deliveryLocation.longitude}`
      : '');

  const sanitizedItems = Array.isArray(order.items)
    ? order.items.map(sanitizeCartItem)
    : [];

  const totalQuantity = sanitizedItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);

  const rawPayload = {
    orderId: safeOrderId,
    customerName: (order.customerName || 'Customer').trim(),
    customerPhone: (order.customerPhone || '').trim(),
    mobileNumber: (order.customerPhone || '').trim(),
    items: sanitizedItems,
    quantities: totalQuantity,
    subtotal: Number(order.subtotal) || 0,
    deliveryCharge: Number(order.deliveryFee) || 0,
    deliveryFee: Number(order.deliveryFee) || 0,
    totalAmount: Number(order.totalAmount) || 0,
    paymentMethod: order.paymentDetails?.method || 'cod',
    paymentMethodLabel: order.paymentDetails?.methodLabel || (order.paymentDetails?.method === 'upi' ? 'Direct UPI' : 'Cash on Delivery'),
    paymentStatus: order.paymentDetails?.isPaymentMarkedDone ? 'Paid' : 'Pending',
    utrTransactionId: order.paymentDetails?.utrTransactionId || '',
    deliveryAddress: (order.deliveryAddress || order.deliveryLocation?.address || '').trim(),
    googleMapsUrl: googleMapsUrl || '',
    mapsUrl: googleMapsUrl || '',
    latitude: typeof order.deliveryLocation?.latitude === 'number' ? order.deliveryLocation.latitude : 10.7870,
    longitude: typeof order.deliveryLocation?.longitude === 'number' ? order.deliveryLocation.longitude : 79.1378,
    deliveryDate: order.deliveryDate || 'Today',
    deliveryTime: order.deliveryTime || 'ASAP',
    deliverySlot: `${order.deliveryDate || 'Today'} (${order.deliveryTime || 'ASAP'})`,
    customerNotes: order.deliveryInstructions || '',
    deliveryInstructions: order.deliveryInstructions || '',
    deliveryLocation: {
      address: order.deliveryLocation?.address || order.deliveryAddress || '',
      areaCity: order.deliveryLocation?.areaCity || 'Thanjavur',
      latitude: typeof order.deliveryLocation?.latitude === 'number' ? order.deliveryLocation.latitude : 10.7870,
      longitude: typeof order.deliveryLocation?.longitude === 'number' ? order.deliveryLocation.longitude : 79.1378,
      mapsUrl: googleMapsUrl || '',
      placeId: (order.deliveryLocation as any)?.placeId || '',
      deliveryInstructions: order.deliveryInstructions || '',
    },
    paymentDetails: {
      method: order.paymentDetails?.method || 'cod',
      methodLabel: order.paymentDetails?.methodLabel || (order.paymentDetails?.method === 'upi' ? 'Direct UPI' : 'Cash on Delivery'),
      isPaymentMarkedDone: Boolean(order.paymentDetails?.isPaymentMarkedDone),
      utrTransactionId: order.paymentDetails?.utrTransactionId || '',
    },
    status: 'New' as OrderStatus,
    orderStatus: 'New',
    adminNotes: '',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const payload = sanitizeForFirestore(rawPayload);

  await setDoc(docRef, payload);

  // Synchronize/Upsert customer record in background
  try {
    await recordCustomerInFirestore(order);
  } catch (custErr) {
    console.warn('Failed to update customer record:', custErr);
  }

  return {
    ...order,
    orderId: safeOrderId,
    status: 'New',
    paymentStatus: order.paymentDetails?.isPaymentMarkedDone ? 'Paid' : 'Pending',
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Updates order status in Firestore
 */
export const updateOrderStatusInFirestore = async (
  orderId: string,
  newStatus: OrderStatus,
  adminNotes?: string
): Promise<void> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  const updates: any = {
    status: newStatus,
    orderStatus: newStatus,
    updatedAt: new Date().toISOString(),
  };

  if (adminNotes !== undefined) {
    updates.adminNotes = adminNotes || '';
  }

  // Auto-sync payment status for COD upon delivery or cancellation
  if (newStatus === 'Cancelled') {
    updates.paymentStatus = 'Failed';
  }

  await updateDoc(docRef, sanitizeForFirestore(updates));
};

/**
 * Updates order payment status in Firestore
 */
export const updateOrderPaymentStatusInFirestore = async (
  orderId: string,
  paymentStatus: OrderPaymentStatus
): Promise<void> => {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  await updateDoc(docRef, sanitizeForFirestore({
    paymentStatus: paymentStatus || 'Pending',
    updatedAt: new Date().toISOString(),
  }));
};

// ==========================================
// 3. CUSTOMERS COLLECTION
// ==========================================

export const sanitizePhoneId = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * Records or updates customer profile metrics upon placing an order
 */
export const recordCustomerInFirestore = async (order: ConfirmedOrder): Promise<void> => {
  const cleanPhone = sanitizePhoneId(order.customerPhone || '');
  if (!cleanPhone) return;

  const docRef = doc(db, CUSTOMERS_COLLECTION, cleanPhone);

  const address = (order.deliveryAddress || order.deliveryLocation?.address || '').trim();
  const addressList = address ? [address] : [];

  const rawCustomer = {
    id: cleanPhone,
    customerName: order.customerName || 'Customer',
    customerPhone: order.customerPhone || cleanPhone,
    totalOrders: increment(1),
    totalSpent: increment(Number(order.totalAmount) || 0),
    lastOrderId: order.orderId || '',
    lastOrderDate: order.createdAt || new Date().toISOString(),
    addresses: addressList.length > 0 ? arrayUnion(...addressList) : arrayUnion('Thanjavur'),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, sanitizeForFirestore(rawCustomer), { merge: true });
};

/**
 * Subscribes to customer database in Firestore
 */
export const subscribeCustomers = (
  onData: (customers: CustomerRecord[]) => void,
  onError?: (err: Error) => void
) => {
  const colRef = collection(db, CUSTOMERS_COLLECTION);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const customers = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          customerName: data.customerName || 'Customer',
          customerPhone: data.customerPhone || d.id,
          totalOrders: Number(data.totalOrders) || 0,
          totalSpent: Number(data.totalSpent) || 0,
          lastOrderId: data.lastOrderId || '',
          lastOrderDate: data.lastOrderDate || '',
          firstOrderDate: data.firstOrderDate || '',
          addresses: Array.isArray(data.addresses) ? data.addresses : [],
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        } as CustomerRecord;
      });
      customers.sort((a, b) => b.totalSpent - a.totalSpent);
      onData(customers);
    },
    (err) => {
      console.error('Error subscribing to customers:', err);
      if (onError) onError(err);
    }
  );
};

// ==========================================
// 4. ADMIN USERS COLLECTION
// ==========================================

export const getAdminUser = async (uid: string): Promise<AdminUserRecord | null> => {
  try {
    const docRef = doc(db, ADMIN_USERS_COLLECTION, uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AdminUserRecord;
    }
    return null;
  } catch (err) {
    console.error('Error getting admin user:', err);
    return null;
  }
};

export const registerAdminUserRecord = async (
  uid: string,
  email: string,
  displayName?: string,
  role: 'superadmin' | 'kitchen_admin' | 'staff' = 'kitchen_admin'
): Promise<AdminUserRecord> => {
  const docRef = doc(db, ADMIN_USERS_COLLECTION, uid);
  const record: AdminUserRecord = {
    uid: uid || '',
    email: email || '',
    displayName: displayName || (email ? email.split('@')[0] : 'Admin User'),
    role: role || 'kitchen_admin',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };
  await setDoc(docRef, sanitizeForFirestore(record), { merge: true });
  return record;
};
