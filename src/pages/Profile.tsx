import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, User as UserIcon, Camera, Heart, Image, Moon, Sun } from "lucide-react";
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
        <Card className="shadow-nature">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {profile?.username?.charAt(0).toUpperCase() || <UserIcon />}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-2xl font-display font-bold mb-1">
                {profile?.username || "Unknown User"}
              </h2>
              {profile?.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Camera className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold">{stats.photoCount}</p>
                </div>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Heart className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold">{stats.totalLikes}</p>
                </div>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Image className="w-4 h-4 text-primary" />
                  <p className="text-2xl font-bold">0</p>
                </div>
                <p className="text-xs text-muted-foreground">Collections</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
          </TabsList>
          
          <TabsContent value="photos" className="mt-4">
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-1">
                {photos.map((photo) => (
                  <div key={photo.id} className="aspect-square bg-muted rounded overflow-hidden">
                    <img
                      src={photo.image_url}
                      alt={photo.caption || "Photo"}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="shadow-nature">
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="mb-4">No photos yet</p>
                  <Button onClick={() => navigate("/camera")} size="sm">
                    Take your first photo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="liked" className="mt-4">
            <Card className="shadow-nature">
              <CardContent className="p-12 text-center text-muted-foreground">
                <Heart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No liked photos yet</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
