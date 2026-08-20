import React, { useState } from 'react';
import { Heart, MapPin, Phone, MessageCircle, X, ShieldCheck } from 'lucide-react';
import { DISPLAY_PHONE, STORE_LOCATION } from '../data/foodData';
import { getHeroWhatsAppUrl } from '../utils/whatsapp';

interface FooterProps {
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | 'shipping' | null>(null);

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenAdmin) {
      onOpenAdmin();
    } else {
      window.location.hash = 'admin';
    }
  };

  return (
    <>
      <footer className="bg-[#081E14] text-white py-14 md:py-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-12 border-b border-white/10">
            
            {/* Left Brand info */}
            <div className="space-y-2 max-w-md">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                  🥗
                </div>
                <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                  My Fruit Bowl TN 49
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed">
                Freshly Prepared with Love. Delivering healthy meals, protein bowls and fresh fruit cuts across Thanjavur.
              </p>
            </div>

            {/* Right Links */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-12 gap-y-3 text-xs sm:text-sm text-emerald-100/80 font-medium">
              <button
                id="footer-link-privacy"
                onClick={() => setActiveModal('privacy')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                id="footer-link-shipping"
                onClick={() => setActiveModal('shipping')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Shipping & Delivery Info
              </button>
              <button
                id="footer-link-terms"
                onClick={() => setActiveModal('terms')}
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <a
                id="footer-link-contact"
                href="#contact"
                className="text-left hover:text-white transition-colors cursor-pointer"
              >
                Contact Us
              </a>
            </div>

          </div>

          {/* Bottom Copyright & Discreet Staff Link */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-100/50">
            <p>© {new Date().getFullYear()} My Fruit Bowl TN 49. Freshly Prepared with Love in Thanjavur.</p>
            <div className="flex items-center gap-4">
              <span>FSSAI Hygiene Standard Certified</span>
              <span>•</span>
              <button
                type="button"
                id="footer-link-admin-portal"
                onClick={handleAdminClick}
                className="text-emerald-100/40 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                title="Kitchen Operations & Admin Dashboard"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Operations</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Info Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white text-[#1A2E26] rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900"
            >
              <X className="w-5 h-5" />
            </button>

            {activeModal === 'privacy' && (
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-bold text-[#0F2A1D]">Privacy Policy</h3>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  At My Fruit Bowl TN 49, we deeply respect your personal privacy. When you place an order or subscribe to a monthly meal plan via WhatsApp or direct call, we only collect essential details such as your delivery location in Thanjavur, phone number, and dietary preferences.
                </p>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  We never share, sell, or disclose your contact details to any third-party marketing services. All orders are handled securely with end-to-end communication on WhatsApp.
                </p>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-bold text-[#0F2A1D]">Terms of Service</h3>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  <strong>Monthly Subscriptions:</strong> Monthly meal plans require pre-booking. Due to our fresh ingredient procurement from local farmers, subscription plans are non-refundable once the delivery cycle commences.
                </p>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  <strong>Pause & Resume:</strong> Subscribers can pause deliveries for up to 3 days per month by informing our WhatsApp support at least 12 hours in advance.
                </p>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  <strong>Freshness Guarantee:</strong> All meals are freshly cut and prepared using natural ingredients, zero artificial colors, and zero palm oil.
                </p>
              </div>
            )}

            {activeModal === 'shipping' && (
              <div className="space-y-3">
                <h3 className="font-serif text-2xl font-bold text-[#0F2A1D]">Shipping & Delivery Information</h3>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  <strong>Delivery Coverage:</strong> We provide free door delivery across all major locations in Thanjavur town including Medical College Road, New & Old Bus Stand areas, MC Road, Karanthai, Srinivasapuram, South Rampart, and Vallam.
                </p>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  <strong>Slots:</strong> Morning slots (7:00 AM - 9:30 AM), Lunch slots (12:00 PM - 1:30 PM), and Dinner slots (6:30 PM - 8:30 PM).
                </p>
                <p className="text-xs sm:text-sm text-[#1A2E26]/80 leading-relaxed">
                  Meals are dispatched in eco-friendly, sanitized food-grade packaging to keep ingredients crisp and fresh.
                </p>
              </div>
            )}

            <div className="pt-4 mt-6 border-t border-stone-200">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-[#0F2A1D] text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
