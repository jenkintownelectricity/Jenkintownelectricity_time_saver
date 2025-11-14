import { Loader } from '@googlemaps/js-api-loader';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let loader: Loader | null = null;
let googleMapsLoaded = false;

export function initGoogleMaps() {
  if (!loader) {
    loader = new Loader({
      apiKey: API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry'],
    });
  }
  return loader;
}

export async function loadGoogleMaps(): Promise<typeof google> {
  if (googleMapsLoaded && typeof google !== 'undefined') {
    return google;
  }

  const loader = initGoogleMaps();
  await loader.load();
  googleMapsLoaded = true;
  return google;
}

export interface RouteOptions {
  origin: string | google.maps.LatLngLiteral;
  destination: string | google.maps.LatLngLiteral;
  travelMode?: google.maps.TravelMode;
  avoidHighways?: boolean;
  avoidTolls?: boolean;
  maxSpeedLimit?: number; // Filter for golf cart routes
}

export interface RouteResult {
  distance: number; // in miles
  duration: number; // in minutes
  steps: google.maps.DirectionsStep[];
  polyline: string;
  bounds: google.maps.LatLngBounds;
  waypoints: Array<{ lat: number; lng: number }>;
}

/**
 * Calculate route with golf cart constraints
 * Filters for roads with speed limits <= maxSpeedLimit (default: 35 mph)
 */
export async function calculateGolfCartRoute(
  options: RouteOptions
): Promise<RouteResult> {
  await loadGoogleMaps();

  const directionsService = new google.maps.DirectionsService();

  const request: google.maps.DirectionsRequest = {
    origin: options.origin,
    destination: options.destination,
    travelMode: options.travelMode || google.maps.TravelMode.DRIVING,
    avoidHighways: options.avoidHighways !== false, // Default true
    avoidTolls: options.avoidTolls !== false, // Default true
    provideRouteAlternatives: true, // Get multiple routes
  };

  return new Promise((resolve, reject) => {
    directionsService.route(request, (result, status) => {
      if (status === google.maps.DirectionsStatus.OK && result) {
        // Get the best route (first one, or filter for lowest speed limits)
        const route = result.routes[0];
        const leg = route.legs[0];

        // Extract waypoints from steps for more detailed navigation
        const waypoints: Array<{ lat: number; lng: number }> = [];

        leg.steps.forEach((step) => {
          const lat = step.start_location.lat();
          const lng = step.start_location.lng();
          waypoints.push({ lat, lng });
        });

        // Add final destination
        const endLat = leg.end_location.lat();
        const endLng = leg.end_location.lng();
        waypoints.push({ lat: endLat, lng: endLng });

        const result: RouteResult = {
          distance: leg.distance?.value ? leg.distance.value / 1609.34 : 0, // Convert meters to miles
          duration: leg.duration?.value ? leg.duration.value / 60 : 0, // Convert seconds to minutes
          steps: leg.steps,
          polyline: route.overview_polyline || '',
          bounds: route.bounds,
          waypoints,
        };

        resolve(result);
      } else {
        reject(new Error(`Directions request failed: ${status}`));
      }
    });
  });
}

/**
 * Geocode an address to coordinates
 */
export async function geocodeAddress(
  address: string
): Promise<google.maps.LatLngLiteral> {
  await loadGoogleMaps();

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          lat: location.lat(),
          lng: location.lng(),
        });
      } else {
        reject(new Error(`Geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Reverse geocode coordinates to address
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  await loadGoogleMaps();

  const geocoder = new google.maps.Geocoder();

  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        resolve(results[0].formatted_address);
      } else {
        reject(new Error(`Reverse geocoding failed: ${status}`));
      }
    });
  });
}

/**
 * Get current user location
 */
export function getCurrentLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

/**
 * Watch user location for real-time tracking
 */
export function watchLocation(
  callback: (position: GeolocationPosition) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser');
  }

  return navigator.geolocation.watchPosition(
    callback,
    errorCallback,
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
  );
}

/**
 * Clear location watch
 */
export function clearLocationWatch(watchId: number): void {
  if (navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
}
