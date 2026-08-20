import React, { useState, useEffect, useRef, useCallback } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { MapPin, Navigation, Compass, AlertCircle, Sparkles, Check, Search } from 'lucide-react';
import { getGoogleMapsApiKey, hasValidGoogleMapsKey, THANJAVUR_DEFAULT_COORDS, reverseGeocodeCoords } from '../utils/location';

interface InteractiveMapPickerProps {
  latitude: number;
  longitude: number;
  onPositionChange: (lat: number, lng: number) => void;
  onAddressResolved?: (address: string, area: string) => void;
  interactive?: boolean;
}

// Inner helper component for Google Maps events
function GoogleMapController({
  latitude,
  longitude,
  onPositionChange,
  onAddressResolved,
}: {
  latitude: number;
  longitude: number;
  onPositionChange: (lat: number, lng: number) => void;
  onAddressResolved?: (address: string, area: string) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (map) {
      map.panTo({ lat: latitude, lng: longitude });
    }
  }, [map, latitude, longitude]);

  const handleMarkerDragEnd = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        onPositionChange(newLat, newLng);
        if (onAddressResolved) {
          const res = await reverseGeocodeCoords(newLat, newLng);
          onAddressResolved(res.address, res.areaCity);
        }
      }
    },
    [onPositionChange, onAddressResolved]
  );

  return (
    <AdvancedMarker
      position={{ lat: latitude, lng: longitude }}
      draggable={true}
      onDragEnd={handleMarkerDragEnd}
      title="Delivery Location (Drag to adjust)"
    >
      <Pin
        background="#15803d"
        borderColor="#166534"
        glyphColor="#ffffff"
        scale={1.2}
      />
    </AdvancedMarker>
  );
}

// Fallback Interactive Tile Map (works anywhere even without API key)
function FallbackTileMap({
  latitude,
  longitude,
  onPositionChange,
  onAddressResolved,
}: {
  latitude: number;
  longitude: number;
  onPositionChange: (lat: number, lng: number) => void;
  onAddressResolved?: (address: string, area: string) => void;
}) {
  const [zoom, setZoom] = useState(15);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; lat: number; lng: number } | null>(null);

  // Convert lat/lng to tile numbers
  const latRad = (latitude * Math.PI) / 180;
  const n = Math.pow(2, zoom);
  const xTileFloat = ((longitude + 180) / 360) * n;
  const yTileFloat = ((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n;

  const centerTileX = Math.floor(xTileFloat);
  const centerTileY = Math.floor(yTileFloat);
  const offsetX = (xTileFloat - centerTileX) * 256;
  const offsetY = (yTileFloat - centerTileY) * 256;

  // Generate 3x3 grid of surrounding tiles for smooth panning
  const tiles: { x: number; y: number; left: number; top: number }[] = [];
  for (let dx = -2; dx <= 2; dx++) {
    for (let dy = -2; dy <= 2; dy++) {
      tiles.push({
        x: centerTileX + dx,
        y: centerTileY + dy,
        left: (dx * 256) - offsetX + 128,
        top: (dy * 256) - offsetY + 128,
      });
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      lat: latitude,
      lng: longitude,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    // Convert pixel delta to lat/lng degrees based on zoom
    const degPerPixelLng = 360 / (256 * Math.pow(2, zoom));
    const degPerPixelLat = (360 / (256 * Math.pow(2, zoom))) * Math.cos((dragStart.lat * Math.PI) / 180);

    const newLng = dragStart.lng - deltaX * degPerPixelLng;
    const newLat = dragStart.lat + deltaY * degPerPixelLat;

    onPositionChange(newLat, newLng);
  };

  const handleMouseUp = async () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      if (onAddressResolved) {
        const res = await reverseGeocodeCoords(latitude, longitude);
        onAddressResolved(res.address, res.areaCity);
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX,
        y: touch.clientY,
        lat: latitude,
        lng: longitude,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStart || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    const degPerPixelLng = 360 / (256 * Math.pow(2, zoom));
    const degPerPixelLat = (360 / (256 * Math.pow(2, zoom))) * Math.cos((dragStart.lat * Math.PI) / 180);

    const newLng = dragStart.lng - deltaX * degPerPixelLng;
    const newLat = dragStart.lat + deltaY * degPerPixelLat;

    onPositionChange(newLat, newLng);
  };

  const handleTouchEnd = async () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      if (onAddressResolved) {
        const res = await reverseGeocodeCoords(latitude, longitude);
        onAddressResolved(res.address, res.areaCity);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      id="fallback-interactive-map"
      className="relative w-full h-full overflow-hidden bg-stone-100 select-none cursor-grab active:cursor-grabbing rounded-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Map Tile Grid */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {tiles.map((t) => (
          <img
            key={`${zoom}-${t.x}-${t.y}`}
            src={`https://tile.openstreetmap.org/${zoom}/${t.x}/${t.y}.png`}
            alt="Map Tile"
            className="absolute w-64 h-64 max-w-none transition-opacity duration-200"
            style={{
              transform: `translate(${t.left}px, ${t.top}px)`,
            }}
            loading="lazy"
          />
        ))}
      </div>

      {/* Center Fixed Pin */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
        <div className="flex flex-col items-center -translate-y-6">
          <div className="bg-emerald-800 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 animate-bounce mb-1 border border-emerald-600">
            <MapPin className="w-3.5 h-3.5 text-amber-300" />
            <span>Deliver Here</span>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 bg-emerald-600/20 rounded-full animate-ping absolute" />
            <div className="w-9 h-9 bg-emerald-700 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold">
              <MapPin className="w-5 h-5 text-white fill-emerald-500" />
            </div>
          </div>
          <div className="w-2.5 h-1 bg-black/40 rounded-full mt-0.5 blur-xs" />
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-md rounded-xl overflow-hidden bg-white/95 backdrop-blur-xs p-1 border border-stone-200">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 1, 18))}
          className="w-8 h-8 flex items-center justify-center text-stone-700 font-bold hover:bg-stone-100 rounded-lg transition-colors text-base"
          title="Zoom In"
        >
          +
        </button>
        <div className="h-px bg-stone-200" />
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 1, 10))}
          className="w-8 h-8 flex items-center justify-center text-stone-700 font-bold hover:bg-stone-100 rounded-lg transition-colors text-base"
          title="Zoom Out"
        >
          -
        </button>
      </div>

      {/* Drag & Placement Guide Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
        <div className="bg-stone-900/85 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md border border-white/10">
          <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Pan the map to position pin accurately</span>
        </div>
      </div>
    </div>
  );
}

export const InteractiveMapPicker: React.FC<InteractiveMapPickerProps> = ({
  latitude,
  longitude,
  onPositionChange,
  onAddressResolved,
  interactive = true,
}) => {
  const apiKey = getGoogleMapsApiKey();
  const hasKey = hasValidGoogleMapsKey();

  if (hasKey) {
    return (
      <div className="relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={{ lat: latitude, lng: longitude }}
            defaultZoom={15}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapId="my_fruit_bowl_map_id"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            style={{ width: '100%', height: '100%', minHeight: '280px' }}
          >
            <GoogleMapController
              latitude={latitude}
              longitude={longitude}
              onPositionChange={onPositionChange}
              onAddressResolved={onAddressResolved}
            />
          </Map>
        </APIProvider>
      </div>
    );
  }

  // Fallback high-performance interactive tile map for preview & standalone usage
  return (
    <div className="relative w-full h-full min-h-[280px] rounded-2xl overflow-hidden border border-stone-200 shadow-inner">
      <FallbackTileMap
        latitude={latitude}
        longitude={longitude}
        onPositionChange={onPositionChange}
        onAddressResolved={onAddressResolved}
      />
    </div>
  );
};
