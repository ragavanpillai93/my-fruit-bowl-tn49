import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Navigation,
  Search,
  Check,
  X,
  Compass,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  LocateFixed,
  Building2,
  FileText
} from 'lucide-react';
import { DeliveryLocation } from '../types';
import {
  THANJAVUR_DEFAULT_COORDS,
  THANJAVUR_POPULAR_LANDMARKS,
  createDeliveryLocation,
  reverseGeocodeCoords,
  hasValidGoogleMapsKey
} from '../utils/location';
import { generateGoogleMapsLink } from '../utils/whatsapp';
import { InteractiveMapPicker } from './InteractiveMapPicker';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: DeliveryLocation) => void;
  initialLocation?: DeliveryLocation | null;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
}) => {
  const [activeTab, setActiveTab] = useState<'gps' | 'map' | 'search'>('map');
  const [lat, setLat] = useState<number>(
    initialLocation?.latitude || THANJAVUR_DEFAULT_COORDS.lat
  );
  const [lng, setLng] = useState<number>(
    initialLocation?.longitude || THANJAVUR_DEFAULT_COORDS.lng
  );
  const [address, setAddress] = useState<string>(
    initialLocation?.address || THANJAVUR_DEFAULT_COORDS.address
  );
  const [areaCity, setAreaCity] = useState<string>(
    initialLocation?.areaCity || THANJAVUR_DEFAULT_COORDS.area
  );
  const [instructions, setInstructions] = useState<string>(
    initialLocation?.deliveryInstructions || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsSuccess, setGpsSuccess] = useState<boolean>(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState<boolean>(false);

  // Sync with initialLocation when opened
  useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        setLat(initialLocation.latitude);
        setLng(initialLocation.longitude);
        setAddress(initialLocation.address);
        setAreaCity(initialLocation.areaCity);
        setInstructions(initialLocation.deliveryInstructions || '');
      }
      setGpsError(null);
      setGpsSuccess(false);
    }
  }, [isOpen, initialLocation]);

  // Handler for GPS detection
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsError(null);
    setGpsSuccess(false);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setLat(userLat);
        setLng(userLng);
        setIsDetectingGps(false);
        setGpsSuccess(true);
        setIsResolvingAddress(true);

        try {
          const res = await reverseGeocodeCoords(userLat, userLng);
          setAddress(res.address);
          setAreaCity(res.areaCity);
        } catch (e) {
          setAddress(`Current Location (${userLat.toFixed(5)}, ${userLng.toFixed(5)})`);
          setAreaCity('Thanjavur (TN 49)');
        } finally {
          setIsResolvingAddress(false);
        }
      },
      (error) => {
        setIsDetectingGps(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission denied. Please allow location access or choose on map below.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('Location information is unavailable. Please select your area manually.');
            break;
          case error.TIMEOUT:
            setGpsError('Location request timed out. Please try again or choose on map.');
            break;
          default:
            setGpsError('Unable to detect location. Please choose on map.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // When marker/map position updates
  const handlePositionChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
  };

  const handleAddressResolved = (newAddress: string, newArea: string) => {
    setAddress(newAddress);
    setAreaCity(newArea);
  };

  // Landmark search filtering
  const filteredLandmarks = THANJAVUR_POPULAR_LANDMARKS.filter((lm) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      lm.name.toLowerCase().includes(q) ||
      lm.area.toLowerCase().includes(q) ||
      lm.address.toLowerCase().includes(q)
    );
  });

  const handleSelectLandmark = (lm: typeof THANJAVUR_POPULAR_LANDMARKS[0]) => {
    setLat(lm.lat);
    setLng(lm.lng);
    setAddress(lm.address);
    setAreaCity(`${lm.area}, Thanjavur (TN 49)`);
    setSearchQuery('');
    setActiveTab('map');
  };

  const handleConfirm = () => {
    const loc = createDeliveryLocation(
      lat,
      lng,
      address.trim() || 'Thanjavur, Tamil Nadu',
      areaCity.trim() || 'Thanjavur (TN 49)',
      instructions.trim(),
      activeTab === 'gps' ? 'gps' : activeTab === 'search' ? 'search' : 'map'
    );
    onSelectLocation(loc);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-stone-100 flex flex-col max-h-[92vh]"
          id="delivery-location-modal"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-serif">
                  Delivery Location
                </h3>
                <p className="text-xs text-stone-500">
                  Select your exact delivery address in Thanjavur (TN 49)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode Selector Tabs */}
          <div className="p-3 bg-stone-50 border-b border-stone-100">
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-stone-200/60 rounded-xl">
              <button
                type="button"
                id="btn-tab-gps"
                onClick={() => {
                  setActiveTab('gps');
                  handleUseCurrentLocation();
                }}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'gps'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <LocateFixed className={`w-3.5 h-3.5 ${activeTab === 'gps' ? 'text-emerald-700' : ''}`} />
                <span className="truncate">Current Location</span>
              </button>

              <button
                type="button"
                id="btn-tab-map"
                onClick={() => setActiveTab('map')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'map'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Compass className={`w-3.5 h-3.5 ${activeTab === 'map' ? 'text-emerald-700' : ''}`} />
                <span className="truncate">Choose on Map</span>
              </button>

              <button
                type="button"
                id="btn-tab-search"
                onClick={() => setActiveTab('search')}
                className={`py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'search'
                    ? 'bg-white text-emerald-800 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Search className={`w-3.5 h-3.5 ${activeTab === 'search' ? 'text-emerald-700' : ''}`} />
                <span className="truncate">Search Area</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
            {/* GPS Feedback Banner */}
            {activeTab === 'gps' && (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isDetectingGps ? (
                    <div className="w-7 h-7 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin shrink-0" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      {isDetectingGps
                        ? 'Acquiring high-accuracy GPS coordinates...'
                        : gpsSuccess
                        ? 'GPS Location successfully detected!'
                        : 'Using GPS Geolocation'}
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      {lat.toFixed(5)}, {lng.toFixed(5)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isDetectingGps}
                  className="text-xs font-bold bg-white text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors shrink-0 shadow-xs"
                >
                  {isDetectingGps ? 'Locating...' : 'Refresh GPS'}
                </button>
              </div>
            )}

            {/* GPS Error Message */}
            {gpsError && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-amber-900 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Location access notice: </span>
                  {gpsError}
                </div>
              </div>
            )}

            {/* Search Input (When Search Tab Active) */}
            {activeTab === 'search' && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    id="search-landmark-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search street, landmark, area in Thanjavur (e.g. Medical College Rd, MC Road)..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all text-stone-900 placeholder:text-stone-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Filtered Landmarks List */}
                <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                  {filteredLandmarks.map((lm, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLandmark(lm)}
                      className="w-full text-left p-2.5 rounded-xl border border-stone-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 group-hover:bg-emerald-100 text-stone-600 group-hover:text-emerald-800 flex items-center justify-center shrink-0 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-stone-900 group-hover:text-emerald-950">
                            {lm.name}
                          </div>
                          <div className="text-[11px] text-stone-500 line-clamp-1">
                            {lm.address}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-700 transition-colors shrink-0" />
                    </button>
                  ))}
                  {filteredLandmarks.length === 0 && (
                    <div className="p-4 text-center text-xs text-stone-500 bg-stone-50 rounded-xl">
                      No matching landmarks found. You can pan on the map or enter your address below.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick Popular Area Chips */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
                <span>Popular Areas in Thanjavur</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {THANJAVUR_POPULAR_LANDMARKS.slice(0, 6).map((lm, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectLandmark(lm)}
                    className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 transition-colors font-medium border border-stone-200/70"
                  >
                    {lm.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Map Component */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-stone-600">
                <span className="font-semibold flex items-center gap-1 text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Map Pin Placement
                </span>
                <span className="text-[11px] text-stone-500">
                  Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                </span>
              </div>

              <div className="h-56 sm:h-64 w-full">
                <InteractiveMapPicker
                  latitude={lat}
                  longitude={lng}
                  onPositionChange={handlePositionChange}
                  onAddressResolved={handleAddressResolved}
                  interactive={true}
                />
              </div>
            </div>

            {/* Selected Address Details Card */}
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1">
                  Delivery Address / Landmark:
                </label>
                <input
                  type="text"
                  id="delivery-address-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Door No 14, 2nd Cross, Medical College Road"
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-xl border border-stone-200/60">
                  <span className="text-[10px] text-stone-400 uppercase font-bold block">
                    Area / City
                  </span>
                  <span className="font-semibold text-stone-800 truncate block">
                    {areaCity || 'Thanjavur (TN 49)'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-200/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      Google Maps Link
                    </span>
                    <span className="font-semibold text-emerald-700 text-[11px] block">
                      Verified Coordinates
                    </span>
                  </div>
                  <a
                    href={generateGoogleMapsLink(lat, lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stone-400 hover:text-emerald-700 p-1"
                    title="Preview in Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Delivery Instructions Field */}
              <div>
                <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3 text-stone-500" />
                  Delivery Instructions (Optional):
                </label>
                <textarea
                  id="delivery-instructions-input"
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="House number, floor, landmark, gate instructions (e.g. Leave with security, 2nd floor red gate)..."
                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-stone-400"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="px-5 py-3.5 border-t border-stone-100 bg-stone-50/70 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-200/60 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              id="btn-confirm-delivery-location"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Confirm Location</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
