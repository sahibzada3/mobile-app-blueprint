import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, LogOut, Camera, Moon, Sun, Lightbulb, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PhotoCard from "@/components/PhotoCard";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { useTheme } from "@/hooks/useTheme";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Feed() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/login");
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/login");
      }
    });

    // Fetch weather data
    // Weather is now loaded in WeatherWidget component

    // Load photos
    loadPhotos();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('photos-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'photos'
        },
        () => {
          loadPhotos();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const loadPhotos = async (showRefreshFeedback = false) => {
    try {
      if (showRefreshFeedback) {
        setIsRefreshing(true);
      }

      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      // Load profiles separately for each photo
      const photosWithProfiles = await Promise.all(
        (data || []).map(async (photo) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", photo.user_id)
            .single();

          return {
            ...photo,
            profiles: profileData,
          };
        })
      );

      setPhotos(photosWithProfiles);
      
      if (showRefreshFeedback) {
        toast.success("Feed refreshed!");
        setTimeout(() => setIsRefreshing(false), 500);
      }
    } catch (error: any) {
      console.error("Error loading photos:", error);
      if (showRefreshFeedback) {
        setIsRefreshing(false);
        toast.error("Failed to refresh feed");
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (window.scrollY === 0 && startY > 0) {
      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;
      
      if (distance > 0 && distance < 120) {
        setPullDistance(distance);
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 80 && !isRefreshing) {
      loadPhotos(true);
    }
    setPullDistance(0);
    setStartY(0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen pb-24 relative"
      style={{
        background: `linear-gradient(180deg, hsl(var(--background)) 0%, hsl(210 60% 15%) 50%, hsl(var(--background-gradient-end)) 100%)`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to Refresh Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
        initial={{ opacity: 0, y: -50 }}
        animate={{
          opacity: pullDistance > 0 || isRefreshing ? 1 : 0,
          y: pullDistance > 0 || isRefreshing ? Math.min(pullDistance * 0.5, 60) - 50 : -50,
        }}
        transition={{ duration: 0.2 }}
      >
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-card border border-primary/20 flex items-center gap-3">
          {isRefreshing ? (
            <>
              <motion.div
                className="w-5 h-5 border-3 border-primary border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-sm font-semibold text-primary">Refreshing...</span>
            </>
          ) : (
            <>
              <motion.div
                animate={{ rotate: pullDistance > 80 ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronRight className="w-5 h-5 text-primary -rotate-90" strokeWidth={2.5} />
              </motion.div>
              <span className="text-sm font-semibold text-muted-foreground">
                {pullDistance > 80 ? "Release to refresh" : "Pull to refresh"}
              </span>
            </>
          )}
        </div>
      </motion.div>
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-card/90 border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center" style={{ boxShadow: '0 0 24px hsl(207 90% 54% / 0.3)' }}>
              <Camera className="w-5 h-5 text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ textShadow: '0 0 20px hsl(207 90% 54% / 0.4)' }}>
              Frame
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-primary/10">
              {theme === "light" ? <Moon className="w-5 h-5" strokeWidth={2} /> : <Sun className="w-5 h-5" strokeWidth={2} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-5 h-5" strokeWidth={2} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Weather Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WeatherWidget />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-card-hover transition-all duration-300 active:scale-[0.99] group" 
            onClick={() => navigate("/ideas")}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Lightbulb className="w-6 h-6 text-primary" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Photography Ideas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discover techniques and locations
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" strokeWidth={2.5} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4" style={{ boxShadow: '0 0 32px hsl(207 90% 54% / 0.3)' }}>
                <Camera className="w-10 h-10 text-primary" strokeWidth={2.5} />
              </div>
              <h2 className="text-3xl font-bold mb-3">Welcome to Frame</h2>
              <p className="text-base text-muted-foreground mb-6">
                Start capturing cinematic nature moments
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => navigate("/camera")}
                  size="lg"
                  className="flex-1 sm:flex-none"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </Button>
                <Button
                  onClick={() => navigate("/ideas")}
                  variant="outline"
                  size="lg"
                  className="flex-1 sm:flex-none"
                >
                  <Lightbulb className="w-5 h-5" />
                  Get Ideas
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {photos.length > 0 ? (
          <div className="space-y-8">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <PhotoCard photo={photo} currentUserId={user?.id} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <p className="text-base text-muted-foreground font-medium">
                No photos yet. Be the first to share!
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
