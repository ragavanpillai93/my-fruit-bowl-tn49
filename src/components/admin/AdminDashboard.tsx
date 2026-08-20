import React, { useState, useEffect } from 'react';
import {
  Store,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ChefHat,
  Bike,
  UtensilsCrossed,
  Settings as SettingsIcon,
  LayoutDashboard,
  ShieldCheck,
  Bell,
  RefreshCw,
  Sparkles,
  ExternalLink,
  MapPin,
  TrendingUp,
  CreditCard,
  Plus,
  Users,
  Database,
  CloudCheck
} from 'lucide-react';
import {
  AdminOrder,
  AdminTab,
  CustomerRecord,
  FoodItem,
  OrderPaymentStatus,
  OrderStatus
} from '../../types';
import {
  subscribeOrders,
  subscribeProducts,
  subscribeCustomers,
  updateOrderStatusInFirestore,
  updateOrderPaymentStatusInFirestore,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  toggleProductAvailabilityInFirestore,
  seedProductsIfEmpty
} from '../../services/firestoreService';
import { logoutAdmin } from '../../services/authService';
import {
  getStoreSettings,
  saveStoreSettings,
  StoreSettings,
  DEFAULT_STORE_SETTINGS
} from '../../utils/adminStorage';
import { AdminSummaryCards } from './AdminSummaryCards';
import { AdminOrdersList } from './AdminOrdersList';
import { AdminOrderDetailsModal } from './AdminOrderDetailsModal';
import { AdminMenuManagement } from './AdminMenuManagement';
import { AdminCustomersList } from './AdminCustomersList';
import { AdminSettings } from './AdminSettings';
import { FOOD_ITEMS } from '../../data/foodData';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onLogout?: () => void;
  adminUser?: any;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onLogout,
  adminUser
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [menuItems, setMenuItems] = useState<FoodItem[]>([]);
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(getStoreSettings());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusText, setSyncStatusText] = useState('Connected to Firestore');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setActionFeedback({ type, message });
    setTimeout(() => {
      setActionFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Real-time Firestore subscriptions for Orders, Products, and Customers
  useEffect(() => {
    setIsSyncing(true);

    // 1. Subscribe Orders
    const unsubOrders = subscribeOrders(
      (realtimeOrders) => {
        setOrders(realtimeOrders);
        setIsSyncing(false);
        setSyncStatusText('Real-time sync active');
      },
      (err) => {
        console.error('Error in orders subscription:', err);
        setIsSyncing(false);
        setSyncStatusText('Sync error, retrying...');
      }
    );

    // 2. Subscribe Products
    const unsubProducts = subscribeProducts(
      async (realtimeProducts) => {
        if (realtimeProducts.length === 0) {
          // Auto-seed default food items if cloud products collection is blank
          const seedResult = await seedProductsIfEmpty(FOOD_ITEMS);
          if (seedResult.success && seedResult.seededCount && seedResult.seededCount > 0) {
            showFeedback('success', `Initialized ${seedResult.seededCount} healthy dishes in Cloud Firestore.`);
          }
        } else {
          setMenuItems(realtimeProducts);
        }
      },
      (err) => {
        console.error('Error in products subscription:', err);
        showFeedback('error', `Firestore products sync error: ${err.message}`);
      }
    );

    // 3. Subscribe Customers
    const unsubCustomers = subscribeCustomers(
      (realtimeCustomers) => {
        setCustomers(realtimeCustomers);
      },
      (err) => {
        console.error('Error in customers subscription:', err);
      }
    );

    // Clock ticker
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);

    return () => {
      unsubOrders();
      unsubProducts();
      unsubCustomers();
      clearInterval(interval);
    };
  }, []);

  // Synchronize modal order details when list updates
  useEffect(() => {
    if (selectedOrder) {
      const match = orders.find((o) => o.orderId === selectedOrder.orderId);
      if (match) {
        setSelectedOrder(match);
      }
    }
  }, [orders]);

  // Order Handlers (Write to Cloud Firestore)
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    adminNotes?: string
  ) => {
    try {
      await updateOrderStatusInFirestore(orderId, status, adminNotes);
      showFeedback('success', `Order #${orderId} updated to "${status}".`);
    } catch (err: any) {
      console.error('Failed to update order status in Firestore:', err);
      showFeedback('error', err.message || 'Failed to update order status in Firestore.');
    }
  };

  const handleUpdatePaymentStatus = async (
    orderId: string,
    paymentStatus: OrderPaymentStatus
  ) => {
    try {
      await updateOrderPaymentStatusInFirestore(orderId, paymentStatus);
      showFeedback('success', `Order #${orderId} payment marked as "${paymentStatus}".`);
    } catch (err: any) {
      console.error('Failed to update payment status in Firestore:', err);
      showFeedback('error', err.message || 'Failed to update payment status in Firestore.');
    }
  };

  // Menu Handlers (Write to Cloud Firestore)
  const handleAddItem = async (item: Omit<FoodItem, 'id'>) => {
    try {
      await addProductToFirestore(item);
      showFeedback('success', `Added "${item.name}" to Cloud Firestore menu.`);
    } catch (err: any) {
      console.error('Failed to add dish to Firestore:', err);
      showFeedback('error', err.message || 'Failed to add dish to Firestore.');
    }
  };

  const handleUpdateItem = async (item: FoodItem) => {
    try {
      await updateProductInFirestore(item);
      showFeedback('success', `Updated "${item.name}" in Cloud Firestore.`);
    } catch (err: any) {
      console.error('Failed to update dish in Firestore:', err);
      showFeedback('error', err.message || 'Failed to update dish in Firestore.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteProductFromFirestore(itemId);
      showFeedback('success', 'Dish removed from Cloud Firestore.');
    } catch (err: any) {
      console.error('Failed to delete dish from Firestore:', err);
      showFeedback('error', err.message || 'Failed to delete dish from Firestore.');
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (!item) return;
    try {
      const willBeAvailable = item.isAvailable === false;
      await toggleProductAvailabilityInFirestore(itemId, willBeAvailable);
      showFeedback(
        'success',
        `"${item.name}" is now marked as ${willBeAvailable ? 'In Stock' : 'Out of Stock'}.`
      );
    } catch (err: any) {
      console.error('Failed to toggle availability in Firestore:', err);
      showFeedback('error', err.message || 'Failed to toggle dish availability.');
    }
  };

  const handleResetMenu = async () => {
    try {
      const res = await seedProductsIfEmpty(FOOD_ITEMS);
      if (res.success && res.seededCount && res.seededCount > 0) {
        showFeedback('success', `Seeded ${res.seededCount} dishes to Cloud Firestore menu.`);
      } else if (res.success) {
        showFeedback('success', res.reason || 'Menu is already up to date.');
      } else {
        showFeedback('error', res.reason || 'Failed to seed dishes to Firestore.');
      }
    } catch (err: any) {
      console.error('Failed to reset menu in Firestore:', err);
      showFeedback('error', err.message || 'Failed to initialize menu in Firestore.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.warn('Logout warning:', err);
    }
    if (onLogout) {
      onLogout();
    } else {
      onBackToStore();
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === 'New').length;
  const preparingOrdersCount = orders.filter((o) => o.status === 'Preparing').length;
  const outForDeliveryCount = orders.filter((o) => o.status === 'Out for Delivery').length;

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 flex flex-col selection:bg-[#7BF587] selection:text-[#0F2A1D]">
      
      {/* 1. TOP ADMIN NAVBAR */}
      <header className="sticky top-0 z-40 bg-[#0F2A1D] text-white border-b border-emerald-500/20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
            
            {/* Left: Brand & Hub Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 shadow-inner">
                🥗
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                    My Fruit Bowl TN 49
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#7BF587] text-[#0F2A1D] px-2 py-0.5 rounded-full shadow-xs">
                    Admin Portal
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-100/70 hidden sm:flex">
                  <span>Thanjavur Kitchen & Delivery</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7BF587] animate-pulse" />
                    <span>Firestore Connected</span>
                  </span>
                  {adminUser?.email && (
                    <>
                      <span>•</span>
                      <span className="text-emerald-200 font-medium truncate max-w-[160px]" title={adminUser.email}>
                        👤 {adminUser.email}
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span>{currentTime || 'Live'}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions (Store status, Return to Customer Store, Logout) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Store Status Indicator */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#7BF587] animate-pulse" />
                <span className="text-emerald-200 text-[11px] font-semibold">
                  {storeSettings.isStoreOpen ? 'Kitchen Open' : 'Kitchen Paused'}
                </span>
              </div>

              {/* Return to Customer Store button */}
              <button
                type="button"
                id="btn-nav-view-store"
                onClick={onBackToStore}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-[#7BF587] border border-emerald-400/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
                title="View Customer Facing Store"
              >
                <Store className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">View Customer Store</span>
              </button>

              {/* Logout button */}
              <button
                type="button"
                id="btn-admin-logout"
                onClick={handleLogout}
                className="p-2 sm:px-3 sm:py-2 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-500/20"
                title="Logout of Admin Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>

        {/* 2. SUB-NAV TABS BAR */}
        <div className="bg-[#081E14] border-t border-white/5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-2">
            
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Tab 1: Dashboard Overview */}
              <button
                type="button"
                id="tab-admin-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-[#7BF587] text-[#0F2A1D] shadow-xs'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              {/* Tab 2: Orders Management */}
              <button
                type="button"
                id="tab-admin-orders"
                onClick={() => setActiveTab('orders')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer relative ${
                  activeTab === 'orders'
                    ? 'bg-[#7BF587] text-[#0F2A1D] shadow-xs'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Orders Management</span>
                {pendingOrdersCount > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      activeTab === 'orders'
                        ? 'bg-[#0F2A1D] text-[#7BF587]'
                        : 'bg-amber-500 text-white animate-pulse'
                    }`}
                  >
                    {pendingOrdersCount} new
                  </span>
                )}
              </button>

              {/* Tab 3: Menu Management */}
              <button
                type="button"
                id="tab-admin-menu"
                onClick={() => setActiveTab('menu')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'menu'
                    ? 'bg-[#7BF587] text-[#0F2A1D] shadow-xs'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <UtensilsCrossed className="w-3.5 h-3.5" />
                <span>Menu Management</span>
                <span className="text-[10px] text-emerald-300/80 bg-white/10 px-1.5 py-0.2 rounded-full">
                  {menuItems.length}
                </span>
              </button>

              {/* Tab 4: Customers Directory */}
              <button
                type="button"
                id="tab-admin-customers"
                onClick={() => setActiveTab('customers')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'customers'
                    ? 'bg-[#7BF587] text-[#0F2A1D] shadow-xs'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Customers</span>
                <span className="text-[10px] text-emerald-300/80 bg-white/10 px-1.5 py-0.2 rounded-full">
                  {customers.length}
                </span>
              </button>

              {/* Tab 5: Store Settings */}
              <button
                type="button"
                id="tab-admin-settings"
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#7BF587] text-[#0F2A1D] shadow-xs'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Store Settings</span>
              </button>
            </div>

            {/* Quick Status / Seed Menu Button */}
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <span className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-[#7BF587] text-[10px] font-mono font-semibold">
                <Database className="w-3 h-3" />
                <span>Firestore DB</span>
              </span>
            </div>

          </div>
        </div>
      </header>

      {/* Action Feedback Banner (Success / Error) */}
      {actionFeedback && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full animate-in fade-in slide-in-from-top-2">
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-semibold shadow-xs ${
              actionFeedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">{actionFeedback.type === 'success' ? '✅' : '⚠️'}</span>
              <span>{actionFeedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback(null)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN DASHBOARD CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Operational Summary Cards */}
            <AdminSummaryCards
              orders={orders}
              activeStatusFilter={activeStatusFilter}
              onSelectStatusFilter={(st) => {
                setActiveStatusFilter(st);
                setActiveTab('orders');
              }}
            />

            {/* Active Kitchen Pipeline Quick Peek */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Recent Priority Orders */}
              <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#0F2A1D]">
                      Live Incoming Orders
                    </h3>
                    <p className="text-xs text-stone-500">
                      Real-time Firestore pipeline from Thanjavur customers
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStatusFilter('all');
                      setActiveTab('orders');
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Orders ({orders.length})</span>
                    <span>→</span>
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-stone-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-stone-300" />
                    <p className="text-sm font-semibold text-stone-600">No orders received yet today</p>
                    <p className="text-xs text-stone-400">
                      Orders placed on the customer store will appear here in real-time.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {orders.slice(0, 6).map((order) => (
                      <div
                        key={order.orderId}
                        onClick={() => setSelectedOrder(order)}
                        className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/80 p-2 rounded-xl transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                            {order.items.reduce((s, i) => s + i.quantity, 0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-stone-900">
                                {order.orderId}
                              </span>
                              <span className="font-bold text-xs text-stone-800 truncate">
                                • {order.customerName}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 truncate mt-0.5">
                              {order.items.map((i) => i.food.name).join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-serif font-bold text-sm text-stone-900">
                            ₹{order.totalAmount}
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                              order.status === 'New'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                : order.status === 'Confirmed'
                                ? 'bg-blue-100 text-blue-900'
                                : order.status === 'Preparing'
                                ? 'bg-purple-100 text-purple-900'
                                : order.status === 'Out for Delivery'
                                ? 'bg-indigo-100 text-indigo-900'
                                : order.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-900'
                                : 'bg-rose-100 text-rose-900'
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right 1 Col: Thanjavur Hub Activity & Quick Stats */}
              <div className="space-y-4">
                
                {/* Kitchen Status Card */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <ChefHat className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Kitchen Operations</span>
                  </span>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60">
                      <span className="font-semibold text-amber-950">Pending Confirmation</span>
                      <strong className="font-mono text-sm text-amber-900">{pendingOrdersCount}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-purple-50/70 rounded-xl border border-purple-200/60">
                      <span className="font-semibold text-purple-950">In Kitchen Prep</span>
                      <strong className="font-mono text-sm text-purple-900">{preparingOrdersCount}</strong>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-200/60">
                      <span className="font-semibold text-indigo-950">On The Road (Riders)</span>
                      <strong className="font-mono text-sm text-indigo-900">{outForDeliveryCount}</strong>
                    </div>
                  </div>
                </div>

                {/* Popular Delivery Areas */}
                <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Active Delivery Hubs (TN 49)</span>
                  </span>

                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 font-medium">
                      Medical College Road
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 font-medium">
                      South Rampart
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 font-medium">
                      Karanthai
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 font-medium">
                      Srinivasapuram
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 font-medium">
                      New Bus Stand
                    </span>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200 font-medium">
                      Vallam Road
                    </span>
                  </div>
                </div>

                {/* Quick Manage CTA */}
                <div className="p-4 bg-linear-to-br from-[#0F2A1D] to-[#163e2b] text-white rounded-2xl shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-bold">Cloud Products</span>
                    <span className="text-xs text-[#7BF587] font-mono">{menuItems.length} Dishes</span>
                  </div>
                  <p className="text-[11px] text-emerald-100/70 leading-relaxed">
                    Update seasonal fruit bowl pricing or toggle items out of stock in Firestore.
                  </p>
                  <button
                    type="button"
                    id="btn-quick-manage-menu"
                    onClick={() => setActiveTab('menu')}
                    className="w-full py-2 bg-[#7BF587] hover:bg-[#6ee07a] text-[#0F2A1D] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Manage Cloud Menu</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AdminOrdersList
              orders={orders}
              onSelectOrder={(order) => setSelectedOrder(order)}
              onUpdateStatus={handleUpdateOrderStatus}
              onUpdatePaymentStatus={handleUpdatePaymentStatus}
              activeStatusFilter={activeStatusFilter}
              onStatusFilterChange={(st) => setActiveStatusFilter(st)}
            />
          </div>
        )}

        {/* VIEW 3: MENU MANAGEMENT */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AdminMenuManagement
              items={menuItems}
              onAddItem={handleAddItem}
              onUpdateItem={handleUpdateItem}
              onDeleteItem={handleDeleteItem}
              onToggleAvailability={handleToggleAvailability}
              onResetMenu={handleResetMenu}
            />
          </div>
        )}

        {/* VIEW 4: CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AdminCustomersList customers={customers} />
          </div>
        )}

        {/* VIEW 5: STORE SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <AdminSettings
              onResetOrders={() => {}}
              onResetMenu={handleResetMenu}
              onSettingsUpdated={() => setStoreSettings(getStoreSettings())}
            />
          </div>
        )}

      </main>

      {/* 4. MODAL: ORDER DETAILS MODAL */}
      <AdminOrderDetailsModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateOrderStatus}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
      />

    </div>
  );
};
