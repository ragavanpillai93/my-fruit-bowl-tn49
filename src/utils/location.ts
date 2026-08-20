import { DeliveryLocation } from '../types';
import { generateGoogleMapsLink } from './whatsapp';

// Default center: Thanjavur (TN 49), Tamil Nadu
export const THANJAVUR_DEFAULT_COORDS = {
  lat: 10.786999,
  lng: 79.137825,
  name: 'Thanjavur Town Center',
  address: 'Gandhiji Road, Old Bus Stand Area, Thanjavur, Tamil Nadu 613001',
  area: 'Thanjavur (TN 49)',
};

export const THANJAVUR_POPULAR_LANDMARKS: { name: string; area: string; lat: number; lng: number; address: string }[] = [
  {
    name: 'Medical College Road',
    area: 'Medical College Area',
    lat: 10.7601,
    lng: 79.1128,
    address: 'Medical College Road, Thanjavur, Tamil Nadu 613004',
  },
  {
    name: 'New Bus Stand Area',
    area: 'New Bus Stand',
    lat: 10.7712,
    lng: 79.1194,
    address: 'Near New Bus Stand, Trichy Road, Thanjavur, Tamil Nadu 613005',
  },
  {
    name: 'Old Bus Stand & Tower',
    area: 'Old Bus Stand',
    lat: 10.7874,
    lng: 79.1372,
    address: 'Gandhiji Road, Old Bus Stand, Thanjavur, Tamil Nadu 613001',
  },
  {
    name: 'Thanjavur Railway Junction',
    area: 'Junction Area',
    lat: 10.7785,
    lng: 79.1325,
    address: 'Railway Station Road, Thanjavur, Tamil Nadu 613001',
  },
  {
    name: 'Karanthai',
    area: 'Karanthai',
    lat: 10.8032,
    lng: 79.1411,
    address: 'Karanthai Main Road, Thanjavur, Tamil Nadu 613002',
  },
  {
    name: 'MC Road / Srinivasapuram',
    area: 'Srinivasapuram',
    lat: 10.7685,
    lng: 79.1245,
    address: 'MC Road, Srinivasapuram, Thanjavur, Tamil Nadu 613007',
  },
  {
    name: 'South Rampart (Thenvadavandhu)',
    area: 'South Rampart',
    lat: 10.7820,
    lng: 79.1390,
    address: 'South Rampart Road, Thanjavur, Tamil Nadu 613001',
  },
  {
    name: 'Rahman Nagar / Shivaji Nagar',
    area: 'Rahman Nagar',
    lat: 10.7745,
    lng: 79.1280,
    address: 'Rahman Nagar, MC Road, Thanjavur, Tamil Nadu 613004',
  },
  {
    name: 'Vallam Road / PMIST Area',
    area: 'Vallam',
    lat: 10.7225,
    lng: 79.0520,
    address: 'Vallam Main Road, Thanjavur, Tamil Nadu 613403',
  },
  {
    name: 'Brihadeeswarar Big Temple Area',
    area: 'Big Temple',
    lat: 10.7828,
    lng: 79.1318,
    address: 'Membalam Road, Near Big Temple, Thanjavur, Tamil Nadu 613007',
  },
];

export function getGoogleMapsApiKey(): string {
  const key = 
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  return key.trim();
}

export function hasValidGoogleMapsKey(): boolean {
  const key = getGoogleMapsApiKey();
  return Boolean(key) && key !== 'YOUR_API_KEY' && key.length > 10;
}

export async function reverseGeocodeCoords(lat: number, lng: number): Promise<{ address: string; areaCity: string }> {
  // If Google Maps API is loaded in window
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results.length > 0) {
        const topResult = response.results[0];
        let area = 'Thanjavur (TN 49)';
        
        // Find sublocality, locality or neighborhood
        for (const comp of topResult.address_components) {
          if (comp.types.includes('sublocality') || comp.types.includes('neighborhood')) {
            area = `${comp.long_name}, Thanjavur`;
            break;
          } else if (comp.types.includes('locality')) {
            area = comp.long_name;
          }
        }

        return {
          address: topResult.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}, Thanjavur`,
          areaCity: area,
        };
      }
    } catch (e) {
      console.warn('Google reverse geocode error, attempting fallback:', e);
    }
  }

  // Fallback to OpenStreetMap reverse geocoding or closest Thanjavur landmark
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const areaName = addr.suburb || addr.neighbourhood || addr.road || addr.city || addr.town || 'Thanjavur';
        return {
          address: data.display_name,
          areaCity: `${areaName}, Thanjavur`,
        };
      }
    }
  } catch (err) {
    console.warn('OSM geocoding fallback error:', err);
  }

  // Find closest landmark from our Thanjavur database
  let closest = THANJAVUR_POPULAR_LANDMARKS[0];
  let minDistance = Infinity;
  for (const lm of THANJAVUR_POPULAR_LANDMARKS) {
    const d = Math.hypot(lm.lat - lat, lm.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      closest = lm;
    }
  }

  return {
    address: `Near ${closest.name}, ${closest.address}`,
    areaCity: `${closest.area}, Thanjavur (TN 49)`,
  };
}

export function createDeliveryLocation(
  lat: number,
  lng: number,
  address: string,
  areaCity: string,
  deliveryInstructions?: string,
  source: 'gps' | 'map' | 'search' | 'preset' = 'map'
): DeliveryLocation {
  return {
    latitude: lat,
    longitude: lng,
    address,
    areaCity,
    mapsUrl: generateGoogleMapsLink(lat, lng),
    deliveryInstructions: deliveryInstructions || '',
    source,
  };
}
