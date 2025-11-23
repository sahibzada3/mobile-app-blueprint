import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MapPin, Navigation, Clock, Cloud, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Spot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  best_time: string;
  scene_types: string[];
  weather_types: string[];
  image_url: string | null;
  distance?: number;
  matchScore?: number;
}

export default function NearbySpots() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(50);
  const [currentWeather, setCurrentWeather] = useState<string>("sunny");
  const [currentTime, setCurrentTime] = useState<string>("anytime");
  const [locationStatus, setLocationStatus] = useState<"detecting" | "granted" | "denied" | "unavailable">("detecting");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      getUserLocation();
    });
  }, [navigate]);

  useEffect(() => {
    if (userLocation) {
      fetchNearbySpots();
    }
  }, [userLocation, radius]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
      fetchAllSpots();
      return;
    }

    setLocationStatus("detecting");
    toast.info("Detecting your location...", { duration: 2000 });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLocationStatus("granted");
        toast.success(`Location detected! Finding spots near you...`, { duration: 2000 });
        detectCurrentConditions();
      },
      (error) => {
        console.error("Location error:", error);
        setLocationStatus("denied");
        
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please enable location access in your browser settings to see nearby spots.", { duration: 5000 });
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          toast.error("Location unavailable. Showing all spots.", { duration: 3000 });
        } else {
          toast.error("Location timeout. Showing all spots.", { duration: 3000 });
        }
        
        fetchAllSpots();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const detectCurrentConditions = () => {
    const hour = new Date().getHours();
    
    // Determine time of day
    if ((hour >= 5 && hour <= 7) || (hour >= 17 && hour <= 19)) {
      setCurrentTime("golden_hour");
    } else if ((hour >= 4 && hour < 5) || (hour >= 19 && hour <= 21)) {
      setCurrentTime("blue_hour");
    } else if (hour >= 21 || hour < 4) {
      setCurrentTime("night");
    } else {
      setCurrentTime("anytime");
    }

    // Weather would ideally come from weather API, but for now we'll use a simple detection
    // You can integrate with your existing weather service
    setCurrentWeather("sunny");
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateMatchScore = (spot: Spot): number => {
    let score = 0;
    
    // Time match (40 points)
    if (spot.best_time === currentTime || spot.best_time === "anytime") {
      score += 40;
    } else if (spot.best_time === "golden_hour" && currentTime === "blue_hour") {
      score += 20; // Similar lighting conditions
    }
    
    // Weather match (30 points)
    if (spot.weather_types.includes(currentWeather)) {
      score += 30;
    }
    
    // Distance factor (30 points) - closer is better
    if (spot.distance) {
      if (spot.distance <= 2) score += 30;
      else if (spot.distance <= 5) score += 20;
      else if (spot.distance <= 10) score += 10;
    }
    
    return score;
  };

  const fetchNearbySpots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("photography_spots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data && userLocation) {
        // Calculate distances and filter by radius
        const spotsWithDistance = data
          .map(spot => ({
            ...spot,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              Number(spot.latitude),
              Number(spot.longitude)
            )
          }))
          .filter(spot => spot.distance! <= radius);

        // Calculate match scores and sort
        const spotsWithScores = spotsWithDistance.map(spot => ({
          ...spot,
          matchScore: calculateMatchScore(spot)
        }));

        spotsWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        
        // If no spots found nearby, show all spots with distance
        if (spotsWithScores.length === 0) {
          const allSpotsWithDistance = data.map(spot => ({
            ...spot,
            distance: calculateDistance(
              userLocation.lat,
              userLocation.lng,
              Number(spot.latitude),
              Number(spot.longitude)
            ),
            matchScore: calculateMatchScore(spot)
          }));
          allSpotsWithDistance.sort((a, b) => a.distance! - b.distance!);
          setSpots(allSpotsWithDistance);
          toast.info(`No spots within ${radius}km. Showing all spots sorted by distance.`);
        } else {
          setSpots(spotsWithScores);
        }
      }
    } catch (error: any) {
      console.error("Error fetching spots:", error);
      toast.error("Failed to load nearby spots");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSpots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("photography_spots")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSpots(data || []);
    } catch (error: any) {
      console.error("Error fetching spots:", error);
      toast.error("Failed to load spots");
    } finally {
      setLoading(false);
    }
  };

  const getTimeIcon = (time: string) => {
    if (time === "golden_hour") return "🌅";
    if (time === "blue_hour") return "🌆";
    if (time === "night") return "🌙";
    return "☀️";
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold">Nearby Spots</h1>
            </div>
            {locationStatus === "detecting" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                <span>Detecting...</span>
              </div>
            )}
            {locationStatus === "denied" && (
              <Button
                size="sm"
                variant="outline"
                onClick={getUserLocation}
                className="h-8"
              >
                <Navigation className="w-3 h-3 mr-1.5" />
                Enable Location
              </Button>
            )}
          </div>
          
          {locationStatus === "denied" && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-medium">
                📍 Location access needed to find spots near you. Tap "Enable Location" and allow access in your browser.
              </p>
            </div>
          )}
          
          {locationStatus === "granted" && userLocation && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-sm text-primary font-medium">
                ✓ Location detected! Showing spots near you in Peshawar
              </p>
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Best Time: {getTimeIcon(currentTime)} {currentTime.replace('_', ' ')}</span>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <Cloud className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Weather: {currentWeather}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Search Radius: {radius}km</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={getUserLocation}
                  className="h-8"
                >
                  <Navigation className="w-3 h-3 mr-1.5" />
                  Refresh
                </Button>
              </div>
              <Slider
                value={[radius]}
                onValueChange={([value]) => setRadius(value)}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Finding best spots near you...</p>
          </div>
        ) : spots.length === 0 ? (
          <Card className="p-8 text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No spots available</h3>
            <p className="text-muted-foreground mb-4">
              Sample spots are in the US. Try expanding your search or wait for more spots to be added in your region.
            </p>
            <Button onClick={() => setRadius(5000)}>
              Show All Spots
            </Button>
          </Card>
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Found {spots.length} spots • Sorted by best match</span>
            </div>
            
            {spots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{spot.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{spot.description}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{spot.distance?.toFixed(1)}km away</span>
                        {spot.matchScore && spot.matchScore >= 70 && (
                          <Badge variant="default" className="ml-2">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Perfect Match
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">
                          {getTimeIcon(spot.best_time)} {spot.best_time.replace('_', ' ')}
                        </Badge>
                        {spot.scene_types.slice(0, 3).map((type) => (
                          <Badge key={type} variant="secondary">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => openInMaps(Number(spot.latitude), Number(spot.longitude))}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => navigate("/camera")}
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}