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

  const loadPhotos = async () => {
    try {
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
    } catch (error: any) {
      console.error("Error loading photos:", error);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      <header className="sticky top-0 bg-gradient-to-r from-card/95 via-card/98 to-card/95 backdrop-blur-xl border-b border-primary/20 z-40 shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Frame
            </h1>
          </motion.div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="hover:bg-primary/10">
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
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
            className="shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/30 hover:border-primary/50 hover:scale-[1.02] overflow-hidden group"
            onClick={() => navigate("/ideas")}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardContent className="p-6 relative">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-primary to-primary/70 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Lightbulb className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    Photography Ideas & Tips
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Discover techniques, locations, and weather-based recommendations
                  </p>
                </div>
                <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl -z-10" />
          <Card className="text-center py-8 backdrop-blur-sm bg-card/80 border-primary/20 shadow-2xl">
            <CardContent className="space-y-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                className="bg-gradient-to-br from-primary via-primary/80 to-accent w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-xl"
              >
                <Heart className="w-12 h-12 text-primary-foreground fill-current" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-display font-bold mb-3 bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
                  Welcome to Frame
                </h2>
                <p className="text-muted-foreground text-lg">
                  Start capturing cinematic nature moments
                </p>
              </div>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button 
                  onClick={() => navigate("/camera")} 
                  className="shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:scale-105"
                  size="lg"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Open Camera
                </Button>
                <Button 
                  onClick={() => navigate("/ideas")} 
                  variant="outline" 
                  className="shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-primary/30"
                  size="lg"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Get Ideas
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {photos.length > 0 ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Latest Captures</span>
            </motion.div>
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <PhotoCard photo={photo} currentUserId={user?.id} />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-xl border-dashed border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5">
              <CardContent className="p-10 text-center">
                <div className="bg-gradient-to-br from-primary/20 to-accent/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-10 h-10 text-primary" />
                </div>
                <p className="text-lg font-medium text-muted-foreground mb-2">No photos yet</p>
                <p className="text-sm text-muted-foreground">Be the first to share a cinematic moment!</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
