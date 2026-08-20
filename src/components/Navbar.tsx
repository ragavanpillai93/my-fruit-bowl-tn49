import React, { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, MessageCircle, Phone, MapPin, Sparkles, ChevronDown } from 'lucide-react';
import { getHeroWhatsAppUrl } from '../utils/whatsapp';
import { CartItem, DeliveryLocation } from '../types';

interface NavbarProps {
  cart: CartItem[];
  onOpenCart: () => void;
  deliveryLocation: DeliveryLocation | null;
  onOpenLocationPicker: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cart,
  onOpenCart,
  deliveryLocation,
  onOpenLocationPicker,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF9F5]/95 backdrop-blur-md shadow-xs border-b border-[#1A2E26]/5 py-2.5'
          : 'bg-[#FAF9F5] py-3.5 md:py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <button
              id="nav-logo-btn"
              onClick={() => scrollTo('home')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#0F2A1D] flex items-center justify-center text-white shadow-xs overflow-hidden border border-emerald-700/30 group-hover:scale-105 transition-transform shrink-0">
                <span className="text-lg sm:text-xl">🥗</span>
              </div>
              <div>
                <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-[#0F2A1D] block">
                  My Fruit Bowl TN 49
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 tracking-wider uppercase block -mt-1">
                  Thanjavur • Fresh & Healthy
                </span>
              </div>
            </button>

            {/* Quick Location Picker Pill (Desktop & Tablet) */}
            <button
              type="button"
              id="nav-location-pill-btn"
              onClick={onOpenLocationPicker}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-emerald-50 border border-[#1A2E26]/10 text-stone-700 hover:text-emerald-950 transition-colors shadow-2xs text-xs font-medium group"
              title="Set Delivery Location in Thanjavur"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] text-stone-500 font-normal">Deliver to:</span>
              <span className="font-bold text-stone-800 group-hover:text-emerald-900 max-w-[140px] truncate">
                {deliveryLocation ? (deliveryLocation.areaCity || deliveryLocation.address) : 'Thanjavur (TN 49)'}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400" />
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7 text-[14px] font-medium text-[#1A2E26]/80">
            <button
              id="nav-link-home"
              onClick={() => scrollTo('home')}
              className="hover:text-[#0F2A1D] transition-colors cursor-pointer py-1"
            >
              Home
            </button>
            <button
              id="nav-link-menu"
              onClick={() => scrollTo('menu')}
              className="hover:text-[#0F2A1D] transition-colors cursor-pointer py-1"
            >
              Menu
            </button>
            <button
              id="nav-link-plans"
              onClick={() => scrollTo('packages')}
              className="hover:text-[#0F2A1D] transition-colors cursor-pointer py-1"
            >
              Meal Plans
            </button>
            <button
              id="nav-link-how"
              onClick={() => scrollTo('how-it-works')}
              className="hover:text-[#0F2A1D] transition-colors cursor-pointer py-1"
            >
              How it Works
            </button>
            <button
              id="nav-link-about"
              onClick={() => scrollTo('about')}
              className="hover:text-[#0F2A1D] transition-colors cursor-pointer py-1"
            >
              About
            </button>
            <button
              id="nav-link-contact"
              onClick={() => scrollTo('contact')}
              className="hover:text-[#0F2A1D] transition-colors cursor-pointer py-1"
            >
              Contact
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Cart Tray Button */}
            <button
              id="nav-cart-btn"
              onClick={onOpenCart}
              className="relative p-2.5 rounded-full bg-white border border-[#1A2E26]/10 text-[#0F2A1D] hover:bg-[#E8F8EE] transition-colors shadow-xs"
              title="View Meal Bowl Tray"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Order via WhatsApp */}
            <a
              id="nav-whatsapp-cta"
              href={getHeroWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs sm:text-sm font-semibold rounded-full shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span>Order via WhatsApp</span>
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              type="button"
              onClick={onOpenLocationPicker}
              className="p-2 rounded-full bg-white border border-[#1A2E26]/10 text-emerald-800"
              title="Change Delivery Location"
            >
              <MapPin className="w-4 h-4" />
            </button>

            <button
              id="nav-mobile-cart-btn"
              onClick={onOpenCart}
              className="relative p-2 rounded-full bg-white border border-[#1A2E26]/10 text-[#0F2A1D]"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              id="nav-mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-[#0F2A1D] hover:bg-[#E8F8EE] focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#FAF9F5] border-b border-[#1A2E26]/10 px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top-3 duration-200">
          {/* Mobile Location bar */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenLocationPicker();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-200 text-xs font-semibold text-emerald-950"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="truncate">
                {deliveryLocation ? deliveryLocation.address : 'Select Delivery Location in Thanjavur'}
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
              Change
            </span>
          </button>

          <div className="grid grid-cols-2 gap-2 text-sm font-medium">
            <button
              id="mobile-nav-home"
              onClick={() => scrollTo('home')}
              className="text-left px-3 py-2.5 rounded-lg bg-white/70 hover:bg-[#E8F8EE] text-[#0F2A1D] font-semibold"
            >
              🏡 Home
            </button>
            <button
              id="mobile-nav-menu"
              onClick={() => scrollTo('menu')}
              className="text-left px-3 py-2.5 rounded-lg bg-white/70 hover:bg-[#E8F8EE] text-[#0F2A1D] font-semibold"
            >
              🥗 Menu
            </button>
            <button
              id="mobile-nav-plans"
              onClick={() => scrollTo('packages')}
              className="text-left px-3 py-2.5 rounded-lg bg-white/70 hover:bg-[#E8F8EE] text-[#0F2A1D] font-semibold"
            >
              📦 Meal Plans
            </button>
            <button
              id="mobile-nav-how"
              onClick={() => scrollTo('how-it-works')}
              className="text-left px-3 py-2.5 rounded-lg bg-white/70 hover:bg-[#E8F8EE] text-[#0F2A1D] font-semibold"
            >
              ✨ How it Works
            </button>
            <button
              id="mobile-nav-about"
              onClick={() => scrollTo('about')}
              className="text-left px-3 py-2.5 rounded-lg bg-white/70 hover:bg-[#E8F8EE] text-[#0F2A1D] font-semibold"
            >
              ℹ️ About
            </button>
            <button
              id="mobile-nav-contact"
              onClick={() => scrollTo('contact')}
              className="text-left px-3 py-2.5 rounded-lg bg-white/70 hover:bg-[#E8F8EE] text-[#0F2A1D] font-semibold"
            >
              📞 Contact
            </button>
          </div>

          <div className="pt-2 border-t border-[#1A2E26]/10 flex flex-col gap-2.5">
            <a
              id="mobile-nav-whatsapp"
              href={getHeroWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#0F2A1D] text-white text-sm font-semibold rounded-xl shadow-xs"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400 fill-emerald-400" />
              <span>Order Now on WhatsApp</span>
            </a>
            
            <div className="flex items-center justify-between text-xs text-[#1A2E26]/70 px-1 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Thanjavur (TN 49)
              </span>
              <span className="text-emerald-800 font-semibold">
                7:00 AM - 9:30 PM
              </span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

