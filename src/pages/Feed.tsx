import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Heart, LogOut, Camera, Lightbulb, ChevronRight, Sparkles, TrendingUp, Search, MessageSquare, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import PhotoCard from "@/components/PhotoCard";
import WeatherWidget from "@/components/weather/WeatherWidget";
import { useTheme } from "@/hooks/useTheme";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useDebounce } from "@/hooks/useDebounce";
import FeedbackDialog from "@/components/feedback/FeedbackDialog";

export default function Feed() {
  const navigate = useNavigate();
  
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [photos, setPhotos] = React.useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  const [startY, setStartY] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);

  React.useEffect(() => {
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
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          // Refresh photos to update vote counts
          loadPhotos();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments'
        },
        () => {
          // Refresh photos to update comment counts
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

      if (!user?.id) return;

      // Get accepted friends
      const { data: friendshipsData, error: friendsError } = await supabase
        .from("friendships")
        .select("user_id, friend_id")
        .eq("status", "accepted")
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

      if (friendsError) throw friendsError;

      // Extract friend IDs
      const friendIds = (friendshipsData || []).map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      );

      if (friendIds.length === 0) {
        setPhotos([]);
        if (showRefreshFeedback) {
          toast.success("Feed refreshed!");
          setTimeout(() => setIsRefreshing(false), 500);
        }
        return;
      }

      // Get photos only from friends
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .in("user_id", friendIds)
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
      className="min-h-screen pb-24 bg-background relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Animated Wave Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
        {/* Flowing waves */}
        <motion.div
          className="absolute w-[200%] h-32 bg-gradient-to-r from-transparent via-primary to-transparent"
          style={{ top: '10%', left: '-50%' }}
          animate={{
            x: ['0%', '50%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute w-[200%] h-24 bg-gradient-to-r from-transparent via-accent to-transparent"
          style={{ top: '30%', left: '-50%' }}
          animate={{
            x: ['0%', '50%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: 2
          }}
        />
        <motion.div
          className="absolute w-[200%] h-40 bg-gradient-to-r from-transparent via-secondary to-transparent"
          style={{ top: '60%', left: '-50%' }}
          animate={{
            x: ['0%', '50%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            delay: 4
          }}
        />
        
        {/* Flowing strips */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-[150%] bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            style={{ 
              top: `${15 + i * 20}%`,
              left: '-25%',
              transform: `rotate(-${5 + i * 2}deg)`
            }}
            animate={{
              x: ['0%', '50%'],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 15 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 1.5
            }}
          />
        ))}
      </div>
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
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl px-6 py-3 shadow-card border border-primary/20 flex items-center gap-3 glass">
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
      <header className="sticky top-0 z-40 glass-strong border-b border-border/30 shadow-sm backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/")} 
                className="rounded-lg"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold tracking-tight">Frame</h1>
            </div>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFeedbackOpen(true)} 
                className="rounded-lg"
                title="Send Feedback"
              >
                <MessageSquare className="w-5 h-5" />
              </Button>
              <NotificationBell />
              <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-lg">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => navigate("/search")}
              className="pl-10 h-11 glass border-border/30 rounded-xl focus-visible:ring-primary/20 transition-all duration-200"
            />
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto py-5">
        <div className="px-5 mb-5">
          <WeatherWidget />
        </div>

        {photos.length === 0 ? (
          <div className="px-4">
            <Card>
              <CardContent className="text-center py-16">
                <Heart className="w-20 h-20 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-6">No posts from friends yet. Add friends to see their photos!</p>
                <Button onClick={() => navigate('/friends')}>
                  <Heart className="w-4 h-4 mr-2" />
                  Find Friends
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-5 px-5">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <PhotoCard photo={photo} currentUserId={user?.id} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <BottomNav />
    </div>
  );
}
