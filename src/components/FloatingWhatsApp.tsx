import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { getHeroWhatsAppUrl } from '../utils/whatsapp';

export const FloatingWhatsApp: React.FC = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      {/* Tooltip speech bubble */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 bg-white text-[#0F2A1D] px-3.5 py-2 rounded-2xl shadow-xl border border-emerald-200 text-xs font-semibold animate-in fade-in slide-in-from-right-4 duration-300">
          <span>Need help or quick order? Chat now!</span>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-stone-400 hover:text-stone-700 p-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        id="floating-whatsapp-btn"
        href={getHeroWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl flex items-center justify-center transition-transform transform hover:scale-110 active:scale-95 ring-4 ring-white/80 group"
      >
        <MessageCircle className="w-8 h-8 fill-white text-[#25D366] group-hover:scale-105 transition-transform" />
      </a>
    </div>
  );
};
