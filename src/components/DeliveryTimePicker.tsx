import React from 'react';
import { Clock, Calendar, Zap, Sun, CloudSun, Utensils, Coffee, Moon, CheckCircle2 } from 'lucide-react';
import { DeliveryTimeSlot } from '../types';

interface DeliveryTimePickerProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  selectedSlot: DeliveryTimeSlot;
  onSelectSlot: (slot: DeliveryTimeSlot) => void;
  deliveryInstructions?: string;
  onInstructionsChange?: (instructions: string) => void;
  error?: string;
}

const TIME_SLOTS: {
  id: DeliveryTimeSlot;
  label: string;
  period: string;
  badge?: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'ASAP',
    label: 'ASAP',
    period: 'Immediate preparation & delivery',
    badge: 'Fastest',
    icon: <Zap className="w-4 h-4 text-amber-500" />,
  },
  {
    id: '8 AM – 10 AM',
    label: '8 AM – 10 AM',
    period: 'Morning Fresh / Breakfast',
    icon: <Sun className="w-4 h-4 text-amber-500" />,
  },
  {
    id: '10 AM – 12 PM',
    label: '10 AM – 12 PM',
    period: 'Mid-Morning Boost',
    icon: <CloudSun className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: '12 PM – 2 PM',
    label: '12 PM – 2 PM',
    period: 'Healthy Lunch Hour',
    badge: 'Popular',
    icon: <Utensils className="w-4 h-4 text-orange-500" />,
  },
  {
    id: '4 PM – 6 PM',
    label: '4 PM – 6 PM',
    period: 'Evening Fitness & Snacks',
    icon: <Coffee className="w-4 h-4 text-teal-600" />,
  },
  {
    id: '6 PM – 8 PM',
    label: '6 PM – 8 PM',
    period: 'Night Dinner & Light Bowls',
    icon: <Moon className="w-4 h-4 text-indigo-500" />,
  },
];

export const DeliveryTimePicker: React.FC<DeliveryTimePickerProps> = ({
  selectedDate,
  onSelectDate,
  selectedSlot,
  onSelectSlot,
  deliveryInstructions = '',
  onInstructionsChange,
  error,
}) => {
  // Quick date helpers
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const formatDateLabel = (d: Date) => {
    return d.toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const todayLabel = `Today (${formatDateLabel(today)})`;
  const tomorrowLabel = `Tomorrow (${formatDateLabel(tomorrow)})`;

  return (
    <div className="space-y-4" id="delivery-time-section">
      
      {/* 1. PREFERRED DELIVERY DATE */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#0F2A1D] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Preferred Delivery Date <span className="text-rose-500">*</span></span>
          </label>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
            Thanjavur Daily Prep
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {/* Today Button */}
          <button
            type="button"
            id="btn-date-today"
            onClick={() => onSelectDate('Today')}
            className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              selectedDate === 'Today' || selectedDate.startsWith('Today')
                ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-2 ring-emerald-600/30'
                : 'bg-[#FAF9F5] border-stone-200/90 hover:border-stone-300 hover:bg-white text-stone-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-[#0F2A1D]">Today</span>
              {(selectedDate === 'Today' || selectedDate.startsWith('Today')) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">
              {formatDateLabel(today)}
            </span>
          </button>

          {/* Tomorrow Button */}
          <button
            type="button"
            id="btn-date-tomorrow"
            onClick={() => onSelectDate('Tomorrow')}
            className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
              selectedDate === 'Tomorrow' || selectedDate.startsWith('Tomorrow')
                ? 'bg-emerald-50 border-emerald-600 shadow-xs ring-2 ring-emerald-600/30'
                : 'bg-[#FAF9F5] border-stone-200/90 hover:border-stone-300 hover:bg-white text-stone-700'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-[#0F2A1D]">Tomorrow</span>
              {(selectedDate === 'Tomorrow' || selectedDate.startsWith('Tomorrow')) && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">
              {formatDateLabel(tomorrow)}
            </span>
          </button>

          {/* Specific Future Date Picker */}
          <div className="col-span-2 sm:col-span-1">
            <div
              className={`p-2 rounded-xl border flex flex-col justify-between transition-all ${
                selectedDate !== 'Today' && selectedDate !== 'Tomorrow' && !selectedDate.startsWith('Today') && !selectedDate.startsWith('Tomorrow')
                  ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/30'
                  : 'bg-[#FAF9F5] border-stone-200/90 hover:bg-white'
              }`}
            >
              <span className="text-[10px] font-bold text-stone-600 uppercase tracking-wider block mb-0.5">
                Pick Other Date
              </span>
              <input
                type="date"
                id="input-delivery-custom-date"
                min={today.toISOString().split('T')[0]}
                value={
                  selectedDate !== 'Today' && selectedDate !== 'Tomorrow'
                    ? selectedDate
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) {
                    onSelectDate(e.target.value);
                  }
                }}
                className="w-full text-xs font-semibold text-stone-900 bg-transparent focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. PREFERRED TIME SLOT */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#0F2A1D] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>Preferred Time Slot <span className="text-rose-500">*</span></span>
          </label>
          <span className="text-[11px] text-stone-500 font-medium">6 Slots Available</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TIME_SLOTS.map((slot) => {
            const isSelected = selectedSlot === slot.id;
            return (
              <button
                type="button"
                key={slot.id}
                id={`slot-btn-${slot.id.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => onSelectSlot(slot.id)}
                className={`p-3 rounded-xl border text-left transition-all relative flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-600 shadow-xs ring-2 ring-emerald-600/30'
                    : 'bg-[#FAF9F5] border-stone-200/80 hover:border-stone-300 hover:bg-white text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white shadow-2xs' : 'bg-stone-100'
                  }`}>
                    {slot.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold truncate ${
                        isSelected ? 'text-[#0F2A1D]' : 'text-stone-900'
                      }`}>
                        {slot.label}
                      </span>
                      {slot.badge && (
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-emerald-600 text-white' : 'bg-stone-200 text-stone-700'
                        }`}>
                          {slot.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 block truncate">
                      {slot.period}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 ml-2">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-stone-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <p className="text-[11px] text-rose-600 font-medium">{error}</p>
        )}
      </div>

    </div>
  );
};
