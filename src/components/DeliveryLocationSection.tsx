import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  LocateFixed,
  Search,
  ExternalLink,
  Edit3,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { DeliveryLocation } from '../types';
import {
  THANJAVUR_DEFAULT_COORDS,
  THANJAVUR_POPULAR_LANDMARKS,
  createDeliveryLocation,
  reverseGeocodeCoords
} from '../utils/location';
import { getGoogleMapsUrl } from '../utils/order';
import { LocationPickerModal } from './LocationPickerModal';

interface DeliveryLocationSectionProps {
  location: DeliveryLocation | null;
  onLocationChange: (loc: DeliveryLocation) => void;
  instructions?: string;
  onInstructionsChange?: (inst: string) => void;
  error?: string;
  className?: string;
}

export const DeliveryLocationSection: React.FC<DeliveryLocationSectionProps> = ({
  location,
  onLocationChange,
  instructions = '',
  onInstructionsChange,
  error,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Quick 1-click GPS detection
  const handleQuickGps = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!navigator.geolocation) {
      setIsModalOpen(true);
      return;
    }

    setIsGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsGpsLoading(false);
        try {
          const res = await reverseGeocodeCoords(latitude, longitude);
          const newLoc = createDeliveryLocation(
            latitude,
            longitude,
            res.address,
            res.areaCity,
            instructions || location?.deliveryInstructions || '',
            'gps'
          );
          onLocationChange(newLoc);
        } catch {
          const newLoc = createDeliveryLocation(
            latitude,
            longitude,
            `Current Location (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`,
            'Thanjavur (TN 49)',
            instructions || location?.deliveryInstructions || '',
            'gps'
          );
          onLocationChange(newLoc);
        }
      },
      () => {
        setIsGpsLoading(false);
        setIsModalOpen(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSelectLandmarkQuick = (lm: typeof THANJAVUR_POPULAR_LANDMARKS[0], e: React.MouseEvent) => {
    e.stopPropagation();
    const newLoc = createDeliveryLocation(
      lm.lat,
      lm.lng,
      lm.address,
      `${lm.area}, Thanjavur (TN 49)`,
      instructions || location?.deliveryInstructions || '',
      'preset'
    );
    onLocationChange(newLoc);
  };

  const mapsLink = location
    ? location.mapsUrl || getGoogleMapsUrl(location.latitude, location.longitude)
    : '';

  return (
    <div className={`space-y-3 ${className}`} id="delivery-location-section">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-[#0F2A1D] uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <span>Delivery Location <span className="text-rose-500">*</span></span>
        </label>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          Thanjavur (TN 49)
        </span>
      </div>

      {location ? (
        /* Confirmed Location Display Card */
        <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 space-y-3 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{location.areaCity || 'Thanjavur Area'}</span>
              </div>
              <p className="text-xs text-stone-800 font-medium leading-relaxed pl-5.5">
                {location.address}
              </p>
            </div>

            {/* "Change Location" Button */}
            <button
              type="button"
              id="btn-change-location"
              onClick={() => setIsModalOpen(true)}
              className="text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer active:scale-95"
            >
              <Edit3 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Change Location</span>
            </button>
          </div>

          {/* Latitude, Longitude & Google Maps Link */}
          <div className="pt-2.5 border-t border-emerald-200/70 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-white px-2 py-0.5 rounded-md text-stone-700 font-mono text-[11px] border border-emerald-200 font-medium">
                Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
              </span>
              <span className="text-emerald-800 font-semibold text-[11px]">Pin Captured ✓</span>
            </div>

            {/* Google Maps Directions / Location Link */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-view-google-maps-link"
              className="text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-1 text-xs bg-white/80 hover:bg-white px-2.5 py-1 rounded-lg border border-emerald-200/80 transition-colors"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3 h-3 text-emerald-700" />
            </a>
          </div>
        </div>
      ) : (
        /* Empty / Select Location State Card */
        <div className="bg-[#FAF9F5] border-2 border-dashed border-emerald-900/20 rounded-2xl p-4 space-y-3 text-center">
          <p className="text-xs text-stone-700 font-medium">
            Please pin your delivery address in Thanjavur for precise doorstep dispatch:
          </p>

          {/* Primary "Choose Location on Map" Button */}
          <button
            type="button"
            id="btn-choose-location-on-map"
            onClick={() => setIsModalOpen(true)}
            className="w-full py-3 px-4 bg-[#0F2A1D] hover:bg-[#163e2b] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Choose Location on Map</span>
          </button>

          {/* Secondary Quick Location Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              id="btn-quick-my-gps"
              onClick={handleQuickGps}
              disabled={isGpsLoading}
              className="py-2 px-3 bg-white hover:bg-emerald-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 hover:text-emerald-900 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-emerald-600 ${isGpsLoading ? 'animate-spin' : ''}`} />
              <span>{isGpsLoading ? 'Locating...' : 'Use My GPS'}</span>
            </button>

            <button
              type="button"
              id="btn-quick-search-area"
              onClick={() => setIsModalOpen(true)}
              className="py-2 px-3 bg-white hover:bg-emerald-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 hover:text-emerald-900 flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-emerald-600" />
              <span>Search Area / Landmark</span>
            </button>
          </div>

          {/* Popular Landmark Chips */}
          <div className="pt-2 border-t border-stone-200/70 text-left">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
              Or pick popular Thanjavur landmark:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {THANJAVUR_POPULAR_LANDMARKS.slice(0, 4).map((lm, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleSelectLandmarkQuick(lm, e)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-stone-800 hover:text-emerald-950 border border-stone-200 transition-colors font-medium cursor-pointer shadow-2xs"
                >
                  📍 {lm.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Interactive Location Picker Modal */}
      <LocationPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectLocation={(newLoc) => {
          onLocationChange(newLoc);
          if (newLoc.deliveryInstructions && onInstructionsChange) {
            onInstructionsChange(newLoc.deliveryInstructions);
          }
        }}
        initialLocation={location}
      />
    </div>
  );
};
