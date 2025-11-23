import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Spot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  best_time: string;
  scene_types: string[];
  distance?: number;
}

export default function NearbySpots() {
  const navigate = useNavigate();
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

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
  }, [userLocation]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location services not available");
      setLoading(false);
      fetchAllSpots();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error("Location error:", error);
        toast.error("Could not get your location");
        fetchAllSpots();
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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

  const formatBestTime = (time: string) => {
    return time.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };


  const fetchNearbySpots = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("photography_spots")
        .select("*");

      if (error) throw error;

      if (data && userLocation) {
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
          .sort((a, b) => a.distance! - b.distance!)
          .slice(0, 20); // Show top 20 closest spots

        setSpots(spotsWithDistance);
      }
    } catch (error: any) {
      console.error("Error fetching spots:", error);
      toast.error("Failed to load spots");
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
        .limit(20);

      if (error) throw error;
      setSpots(data || []);
    } catch (error: any) {
      console.error("Error fetching spots:", error);
      toast.error("Failed to load spots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Photography Spots</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Discover beautiful locations near you
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/camera")}
            >
              <Camera className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Finding spots near you</p>
          </div>
        ) : spots.length === 0 ? (
          <Card className="p-12 text-center">
            <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No spots found nearby</h3>
            <p className="text-muted-foreground">
              Enable location to discover photography spots near you
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {spots.map((spot) => (
              <Card key={spot.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{spot.name}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {spot.description}
                      </p>
                      
                      <div className="flex items-center gap-3 mb-3">
                        {spot.distance && (
                          <div className="flex items-center gap-1.5 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-medium">{spot.distance.toFixed(1)} km away</span>
                          </div>
                        )}
                        <Badge variant="secondary" className="capitalize">
                          {formatBestTime(spot.best_time)}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {spot.scene_types.slice(0, 3).map((type) => (
                          <Badge key={type} variant="outline" className="capitalize text-xs">
                            {type.replace(/_/g, ' ')}
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
                      Directions
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate("/camera")}
                    >
                      <Camera className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}