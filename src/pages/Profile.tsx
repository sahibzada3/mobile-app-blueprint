import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LogOut, User as UserIcon, Camera, Heart, Image, Moon, Sun, Settings, Award, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [stats, setStats] = useState({ photoCount: 0, totalLikes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Load user's photos
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (photosError) throw photosError;
      setPhotos(photosData || []);

      // Calculate stats
      const { data: votesData } = await supabase
        .from("votes")
        .select("id")
        .eq("vote_type", "like")
        .in("photo_id", (photosData || []).map(p => p.id));

      setStats({
        photoCount: photosData?.length || 0,
        totalLikes: votesData?.length || 0,
      });
    } catch (error: any) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-primary">Profile</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile/settings")}>
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Hero Profile Card */}
        <Card className="shadow-nature overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-card to-card">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          </div>
          <CardContent className="p-6 -mt-12">
            <div className="text-center mb-6">
              <div className="relative w-28 h-28 mx-auto mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-pulse"></div>
                <Avatar className="w-28 h-28 border-4 border-card shadow-lg relative z-10 hover-scale">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-3xl">
                      {profile?.username?.charAt(0).toUpperCase() || <UserIcon />}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <h2 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {profile?.username || "Unknown User"}
                </h2>
                <Badge variant="secondary" className="animate-fade-in">
                  <Zap className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              {profile?.bio ? (
                <p className="text-muted-foreground max-w-xs mx-auto">{profile.bio}</p>
              ) : (
                <p className="text-muted-foreground/60 italic text-sm">No bio yet</p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border/50">
              <Card className="border-0 bg-gradient-to-br from-primary/5 to-transparent hover-scale cursor-pointer transition-all">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stats.photoCount}</p>
                  <p className="text-xs text-muted-foreground font-medium">Photos</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-accent/5 to-transparent hover-scale cursor-pointer transition-all">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 rounded-full bg-accent/10">
                      <Heart className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1">{stats.totalLikes}</p>
                  <p className="text-xs text-muted-foreground font-medium">Likes</p>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-gradient-to-br from-primary/5 to-transparent hover-scale cursor-pointer transition-all">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <div className="p-2 rounded-full bg-primary/10">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold mb-1">0</p>
                  <p className="text-xs text-muted-foreground font-medium">Rank</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Achievements Preview */}
        <Card className="shadow-nature border-0 bg-gradient-to-br from-accent/5 to-card animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Achievements</h3>
              </div>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center hover-scale cursor-pointer">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">First Shot</p>
              </div>
              <div className="flex-shrink-0 opacity-50">
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <Award className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">Locked</p>
              </div>
              <div className="flex-shrink-0 opacity-50">
                <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <Award className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-xs text-center mt-1 text-muted-foreground">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo Gallery Tabs */}
        <Tabs defaultValue="photos" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="photos" className="data-[state=active]:bg-primary/10">
              <Camera className="w-4 h-4 mr-2" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="liked" className="data-[state=active]:bg-accent/10">
              <Heart className="w-4 h-4 mr-2" />
              Liked
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photos" className="mt-4">
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id} 
                    className="aspect-square bg-muted rounded-lg overflow-hidden group relative animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Photo"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                      <div className="text-white text-xs flex items-center gap-2">
                        <Heart className="w-3 h-3" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="shadow-nature border-0 bg-gradient-to-br from-primary/5 to-card">
                <CardContent className="p-12 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Camera className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Start Your Journey</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm">
                    Capture stunning nature moments and share them with the world
                  </p>
                  <Button onClick={() => navigate("/camera")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
                    <Camera className="w-4 h-4 mr-2" />
                    Take Your First Photo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="mt-4">
            <Card className="shadow-nature border-0 bg-gradient-to-br from-accent/5 to-card">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                  <Heart className="w-10 h-10 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No Favorites Yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Start exploring and like photos you love
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
