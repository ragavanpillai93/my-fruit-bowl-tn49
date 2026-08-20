import React, { useState } from 'react';
import {
  Store,
  CreditCard,
  Phone,
  Clock,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Power
} from 'lucide-react';
import { getStoreSettings, saveStoreSettings, StoreSettings } from '../../utils/adminStorage';

interface AdminSettingsProps {
  onResetOrders: () => void;
  onResetMenu: () => void;
  onSettingsUpdated?: () => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  onResetOrders,
  onResetMenu,
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<StoreSettings>(getStoreSettings());
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings(settings);
    setIsSavedAlert(true);
    if (onSettingsUpdated) onSettingsUpdated();
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  return (
    <div className="max-w-3xl space-y-6" id="admin-settings-section">
      
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#0F2A1D]">
                Kitchen & Store Configuration
              </h3>
              <p className="text-xs text-stone-500">
                Manage live store availability, UPI details, WhatsApp numbers & test databases.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isSavedAlert && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Settings saved and updated successfully!</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSave} className="space-y-4">
        
        {/* 1. STORE STATUS & HOURS */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-100">
            <Power className="w-4 h-4 text-emerald-700" />
            <span>Store Open / Closed Status</span>
          </h4>

          <div className="flex items-center justify-between p-3.5 bg-[#FAF9F5] rounded-xl border border-stone-200">
            <div>
              <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <span>Accepting Customer Orders</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    settings.isStoreOpen
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}
                >
                  {settings.isStoreOpen ? 'Online / Open' : 'Offline / Closed'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Toggle to temporarily pause new customer orders during heavy kitchen peak hours.
              </p>
            </div>

            <button
              type="button"
              id="btn-toggle-store-open"
              onClick={() => setSettings({ ...settings, isStoreOpen: !settings.isStoreOpen })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                settings.isStoreOpen ? 'bg-emerald-700' : 'bg-stone-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  settings.isStoreOpen ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Store Notice / Timings Subtitle
            </label>
            <input
              type="text"
              value={settings.storeStatusNote}
              onChange={(e) => setSettings({ ...settings, storeStatusNote: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs text-stone-900 focus:ring-1 focus:ring-emerald-700"
            />
          </div>
        </div>

        {/* 2. PAYMENT & UPI ID CONFIGURATION */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-100">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <span>Business UPI & Bank Payment Receiver</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Business UPI ID (GPay / PhonePe / Paytm)
              </label>
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Business Display Name
              </label>
              <input
                type="text"
                value={settings.upiName}
                onChange={(e) => setSettings({ ...settings, upiName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* 3. CONTACT & NOTIFICATION PHONE */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-100">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>Contact & WhatsApp Number</span>
          </h4>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              WhatsApp Order Receiver Number
            </label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs text-stone-900 font-mono"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Customers will send WhatsApp messages directly to this number when placing orders.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            id="btn-save-settings"
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Save className="w-4 h-4 text-[#7BF587]" />
            <span>Save All Configuration</span>
          </button>
        </div>

      </form>

      {/* 4. DATABASE & DEMO DATA CONTROLS */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-2xs space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2 pb-2 border-b border-stone-100">
          <RotateCcw className="w-4 h-4 text-stone-500" />
          <span>Demo Data & Testing Utilities</span>
        </h4>

        <p className="text-xs text-stone-500 leading-relaxed">
          The application uses a persistent client-side data schema ready for backend API or Firestore plug-in. You can reset orders or menu items to test various flows anytime.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            id="btn-reset-sample-orders-settings"
            onClick={() => {
              if (window.confirm('Restore initial sample orders for Thanjavur?')) {
                onResetOrders();
                alert('Sample orders restored!');
              }
            }}
            className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-800 rounded-xl border border-stone-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>Reset Sample Orders</span>
          </button>

          <button
            type="button"
            id="btn-reset-sample-menu-settings"
            onClick={() => {
              onResetMenu();
            }}
            className="p-3 bg-stone-50 hover:bg-stone-100 text-stone-800 rounded-xl border border-stone-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-600" />
            <span>Sync / Seed Menu in Firestore</span>
          </button>
        </div>
      </div>

    </div>
  );
};
