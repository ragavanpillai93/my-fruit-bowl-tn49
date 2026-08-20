/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CravingsSection } from './components/CravingsSection';
import { MenuSection } from './components/MenuSection';
import { PackagesSection } from './components/PackagesSection';
import { HowItWorks } from './components/HowItWorks';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { ItemDetailModal } from './components/ItemDetailModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { FloatingCartButton } from './components/FloatingCartButton';
import { LocationPickerModal } from './components/LocationPickerModal';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminAuthScreen } from './components/admin/AdminAuthScreen';
import { subscribeAdminAuthState, logoutAdmin } from './services/authService';
import { subscribeProducts } from './services/firestoreService';
import { getCurrentRoute, navigateToRoute, AppRoute } from './utils/routes';

import { FOOD_ITEMS } from './data/foodData';
import { FoodItem, MealCategory, CartItem, DeliveryLocation } from './types';
import { THANJAVUR_DEFAULT_COORDS, createDeliveryLocation } from './utils/location';

export default function App() {
  // Current active route ('store' | 'admin-login' | 'admin-dashboard')
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => getCurrentRoute());
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Subscribe to Firebase Authentication state
  useEffect(() => {
    const unsubscribeAuth = subscribeAdminAuthState((user) => {
      setAdminUser(user);
      setIsAuthChecking(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listen to popstate, hashchange, and custom route change events
  useEffect(() => {
    const handleRouteChange = () => {
      const route = getCurrentRoute();
      setCurrentRoute(route);
    };

    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('app-route-change', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('app-route-change', handleRouteChange);
    };
  }, []);

  // Handle automatic route redirection based on Firebase Auth state
  useEffect(() => {
    if (isAuthChecking) return;

    if (currentRoute === 'admin-dashboard' && !adminUser) {
      navigateToRoute('admin-login');
    } else if (currentRoute === 'admin-login' && adminUser) {
      navigateToRoute('admin-dashboard');
    }
  }, [currentRoute, adminUser, isAuthChecking]);

  // Menu items synchronized in real-time with Firestore 'products' collection
  const [menuItems, setMenuItems] = useState<FoodItem[]>(FOOD_ITEMS);

  useEffect(() => {
    const unsubscribeProducts = subscribeProducts(
      (realtimeItems) => {
        if (realtimeItems.length > 0) {
          setMenuItems(realtimeItems);
        } else {
          // If Firestore collection is not yet populated, safely render default menu
          setMenuItems(FOOD_ITEMS);
        }
      },
      (err) => {
        console.warn('Could not fetch Firestore products, using fallback data:', err);
      }
    );

    return () => unsubscribeProducts();
  }, []);

  const [activeCategory, setActiveCategory] = useState<MealCategory>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedFoodForDetails, setSelectedFoodForDetails] = useState<FoodItem | null>(null);
  
  // Delivery Location State with Local Storage persistence
  const [deliveryLocation, setDeliveryLocation] = useState<DeliveryLocation | null>(() => {
    try {
      const saved = localStorage.getItem('mfb_tn49_delivery_location');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse saved location', e);
    }
    // Default initial location in Thanjavur
    return createDeliveryLocation(
      THANJAVUR_DEFAULT_COORDS.lat,
      THANJAVUR_DEFAULT_COORDS.lng,
      THANJAVUR_DEFAULT_COORDS.address,
      THANJAVUR_DEFAULT_COORDS.area,
      '',
      'preset'
    );
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    if (deliveryLocation) {
      try {
        localStorage.setItem('mfb_tn49_delivery_location', JSON.stringify(deliveryLocation));
      } catch (e) {
        // ignore
      }
    }
  }, [deliveryLocation]);

  // Cart operations
  const handleAddToCart = (food: FoodItem, quantity: number = 1, note?: string) => {
    if (food.isAvailable === false) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                notes: note || item.notes,
              }
            : item
        );
      }
      return [...prev, { food, quantity, notes: note }];
    });
  };

  const handleOrderNowFromModal = (food: FoodItem, quantity: number = 1, note?: string) => {
    handleAddToCart(food, quantity, note);
    setSelectedFoodForDetails(null);
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(foodId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.food.id === foodId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (foodId: string) => {
    setCart((prev) => prev.filter((item) => item.food.id !== foodId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      const navOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSelectCategoryFromBento = (cat: MealCategory) => {
    setActiveCategory(cat);
    scrollToMenu();
  };

  const handleOpenAdminPortal = () => {
    navigateToRoute('admin-dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  };

  const handleBackToCustomerStore = () => {
    navigateToRoute('store');
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  };

  const handleAdminLogout = async () => {
    try {
      await logoutAdmin();
    } catch (err) {
      console.warn('Logout error:', err);
    }
    navigateToRoute('admin-login');
  };

  // =========================================================================
  // 1. ADMIN AUTH / PROTECTED VIEWS (/admin/login & /admin)
  // =========================================================================
  if (currentRoute === 'admin-login' || currentRoute === 'admin-dashboard') {
    // Show smooth checking state while Firebase Auth initializes
    if (isAuthChecking) {
      return (
        <div className="min-h-screen bg-[#081E14] flex flex-col items-center justify-center p-4 text-white">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-2xl shadow-inner mb-4 animate-pulse">
            🥗
          </div>
          <p className="text-sm font-semibold text-emerald-200">Verifying Admin Access...</p>
          <p className="text-xs text-emerald-100/50 mt-1">My Fruit Bowl TN 49</p>
        </div>
      );
    }

    // 1A. Route: /admin (Protected Admin Dashboard)
    if (currentRoute === 'admin-dashboard') {
      // If user is authenticated and authorized, show dashboard
      if (adminUser) {
        return (
          <AdminDashboard
            adminUser={adminUser}
            onBackToStore={handleBackToCustomerStore}
            onLogout={handleAdminLogout}
          />
        );
      }

      // If unauthenticated user opens /admin, redirect immediately to /admin/login
      return (
        <AdminAuthScreen
          onSuccess={() => {
            navigateToRoute('admin-dashboard');
          }}
          onBackToStore={handleBackToCustomerStore}
        />
      );
    }

    // 1B. Route: /admin/login (Dedicated Admin Login Page)
    if (currentRoute === 'admin-login') {
      // If user is ALREADY authenticated, redirect immediately to /admin
      if (adminUser) {
        return (
          <AdminDashboard
            adminUser={adminUser}
            onBackToStore={handleBackToCustomerStore}
            onLogout={handleAdminLogout}
          />
        );
      }

      // Show dedicated Admin Login page
      return (
        <AdminAuthScreen
          onSuccess={() => {
            navigateToRoute('admin-dashboard');
          }}
          onBackToStore={handleBackToCustomerStore}
        />
      );
    }
  }

  // =========================================================================
  // 2. CUSTOMER FACING WEBSITE (Public Store, Realtime Menu, WhatsApp Checkout)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A2E26] flex flex-col selection:bg-emerald-200 selection:text-emerald-900">
      {/* Sticky Top Navbar */}
      <Navbar
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
        deliveryLocation={deliveryLocation}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <Hero onExploreMenu={scrollToMenu} />

        {/* 2. Craving Selector (Bento Grid) */}
        <CravingsSection onSelectCategory={handleSelectCategoryFromBento} />

        {/* 3. Healthy Meals Menu Section (Synced in real-time with Firestore) */}
        <MenuSection
          items={menuItems}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onAddToCart={handleAddToCart}
          onOpenDetails={(food) => setSelectedFoodForDetails(food)}
          cartItemIds={cart.map((c) => c.food.id)}
        />

        {/* 4. Packages & Subscription Section */}
        <PackagesSection />

        {/* 5. How It Works Section */}
        <HowItWorks />

        {/* 6. About Us & Standards */}
        <AboutSection />

        {/* 7. CTA Lime Banner */}
        <CtaBanner />

        {/* 8. Contact & Location Section */}
        <ContactSection />
      </main>

      {/* Footer with Discreet Staff Portal Link */}
      <Footer onOpenAdmin={handleOpenAdminPortal} />

      {/* Cart / Meal Tray Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        deliveryLocation={deliveryLocation}
        onUpdateLocation={setDeliveryLocation}
      />

      {/* Food Item Details & Portion Modal */}
      <ItemDetailModal
        food={selectedFoodForDetails}
        onClose={() => setSelectedFoodForDetails(null)}
        onAddToCart={handleAddToCart}
        onOrderNow={handleOrderNowFromModal}
        deliveryLocation={deliveryLocation}
        onOpenLocationPicker={() => setIsLocationModalOpen(true)}
      />

      {/* Global Location Picker Modal */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={setDeliveryLocation}
        initialLocation={deliveryLocation}
      />

      {/* Floating Shopping Cart Button on bottom-right */}
      <FloatingCartButton
        cart={cart}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Persistent Floating WhatsApp Action */}
      <FloatingWhatsApp />
    </div>
  );
}
