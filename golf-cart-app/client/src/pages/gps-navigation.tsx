import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateGolfCartRoute, getCurrentLocation, watchLocation, clearLocationWatch, type RouteResult } from '@/lib/google-maps';
import { formatDistance, formatDuration, calculateDistance } from '@/lib/utils';

export function GPSNavigationPage() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentWaypointIndex, setCurrentWaypointIndex] = useState(0);
  const watchIdRef = useRef<number | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [maxSpeedLimit] = useState(35); // mph - golf cart limit

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation()
      .then((position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        initializeMap(location);
      })
      .catch((err) => {
        console.error('Error getting location:', err);
        // Default to Jenkintown, PA
        const defaultLocation = { lat: 40.0951, lng: -75.1268 };
        setCurrentLocation(defaultLocation);
        initializeMap(defaultLocation);
      });

    return () => {
      if (watchIdRef.current !== null) {
        clearLocationWatch(watchIdRef.current);
      }
    };
  }, []);

  const initializeMap = async (center: { lat: number; lng: number }) => {
    if (!mapContainerRef.current) return;

    try {
      const google = await import('@/lib/google-maps').then((m) => m.loadGoogleMaps());

      const map = new google.maps.Map(mapContainerRef.current, {
        center,
        zoom: 14,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });

      mapRef.current = map;

      // Add current location marker
      new google.maps.Marker({
        position: center,
        map,
        title: 'Current Location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4CAF50',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });
    } catch (err) {
      console.error('Error initializing map:', err);
    }
  };

  const handleCalculateRoute = async () => {
    if (!origin || !destination) {
      setError('Please enter both origin and destination');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const routeResult = await calculateGolfCartRoute({
        origin,
        destination,
        avoidHighways: true,
        avoidTolls: true,
        maxSpeedLimit,
      });

      setRoute(routeResult);

      // Display route on map
      if (mapRef.current) {
        const google = await import('@/lib/google-maps').then((m) => m.loadGoogleMaps());

        // Clear existing polylines
        // ... (simplified for now)

        // Draw route
        const routePath = routeResult.steps.flatMap((step) => {
          const path = step.path || [];
          return path.map((point) => ({
            lat: point.lat(),
            lng: point.lng(),
          }));
        });

        new google.maps.Polyline({
          path: routePath,
          geodesic: true,
          strokeColor: '#22c55e',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map: mapRef.current,
        });

        // Fit bounds
        mapRef.current.fitBounds(routeResult.bounds);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate route');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleStartNavigation = () => {
    if (!route) return;

    setIsNavigating(true);
    setCurrentWaypointIndex(0);

    // Start watching location
    watchIdRef.current = watchLocation((position) => {
      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCurrentLocation(newLocation);

      // Check if reached current waypoint
      if (route.waypoints[currentWaypointIndex]) {
        const waypoint = route.waypoints[currentWaypointIndex];
        const distance = calculateDistance(
          newLocation.lat,
          newLocation.lng,
          waypoint.lat,
          waypoint.lng
        );

        // Advance to next waypoint if within 0.02 miles (~100 feet)
        if (distance < 0.02 && currentWaypointIndex < route.waypoints.length - 1) {
          setCurrentWaypointIndex((prev) => prev + 1);
        }
      }
    });
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    if (watchIdRef.current !== null) {
      clearLocationWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const openInGoogleMaps = () => {
    if (!origin || !destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">GPS Navigation</h1>
        <p className="text-lg text-muted-foreground">
          Golf cart optimized routing with ≤{maxSpeedLimit} mph speed limit filtering
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Route Planning */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plan Your Route</CardTitle>
              <CardDescription>
                Enter addresses or use "Current Location"
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Starting Point</Label>
                <Input
                  id="origin"
                  placeholder="123 Main St, Jenkintown, PA"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
                {currentLocation && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOrigin(`${currentLocation.lat},${currentLocation.lng}`)}
                  >
                    Use Current Location
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="456 Oak Ave, Abington, PA"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <Button
                onClick={handleCalculateRoute}
                disabled={isCalculating || !origin || !destination}
                className="w-full"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Navigation className="mr-2 h-4 w-4" />
                    Calculate Route
                  </>
                )}
              </Button>

              {error && (
                <div className="flex items-start space-x-2 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Route Info */}
          {route && (
            <Card>
              <CardHeader>
                <CardTitle>Route Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Distance</span>
                  <span className="font-semibold">{formatDistance(route.distance)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-semibold">{formatDuration(route.duration)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Max Speed</span>
                  <Badge variant="secondary">{maxSpeedLimit} mph</Badge>
                </div>

                <div className="pt-4 space-y-2">
                  {!isNavigating ? (
                    <>
                      <Button onClick={handleStartNavigation} className="w-full">
                        <MapPin className="mr-2 h-4 w-4" />
                        Start Navigation
                      </Button>
                      <Button
                        onClick={openInGoogleMaps}
                        variant="outline"
                        className="w-full"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open in Google Maps
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleStopNavigation}
                      variant="destructive"
                      className="w-full"
                    >
                      Stop Navigation
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Safety Info */}
          <Card className="bg-secondary/30">
            <CardHeader>
              <CardTitle className="text-base">Safety Requirements</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>✓ Valid driver's license required</p>
              <p>✓ Maximum speed: {maxSpeedLimit} mph</p>
              <p>✓ Headlights and tail lights mandatory</p>
              <p>✓ Stay on designated roads and paths</p>
            </CardContent>
          </Card>
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <div ref={mapContainerRef} className="w-full h-full rounded-lg" />
            </CardContent>
          </Card>

          {/* Turn-by-turn directions */}
          {route && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Directions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {route.steps.slice(0, 10).map((step, index) => (
                    <div
                      key={index}
                      className={`flex items-start space-x-3 p-3 rounded-lg ${
                        isNavigating && index === currentWaypointIndex
                          ? 'bg-primary/10 border border-primary'
                          : 'bg-secondary/30'
                      }`}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div
                          dangerouslySetInnerHTML={{ __html: step.instructions }}
                          className="text-sm"
                        />
                        <div className="text-xs text-muted-foreground mt-1">
                          {step.distance?.text}
                        </div>
                      </div>
                    </div>
                  ))}
                  {route.steps.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center">
                      + {route.steps.length - 10} more steps
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
