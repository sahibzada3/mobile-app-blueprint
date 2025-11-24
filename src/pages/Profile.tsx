import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { LogOut, User as UserIcon, Camera, Heart, Settings, Eye } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import NotificationBell from "@/components/notifications/NotificationBell";
import RankBadgeDisplay from "@/components/profile/RankBadgeDisplay";

export default function Profile() {
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [stats, setStats] = useState({ photoCount: 0, totalLikes: 0, followers: 0, following: 0 });
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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (photosError) throw photosError;
      setPhotos(photosData || []);

      const { data: votesData } = await supabase
        .from("votes")
        .select("id")
        .eq("vote_type", "like")
        .in("photo_id", (photosData || []).map(p => p.id));

      const { data: friendsData } = await supabase
        .from("friendships")
        .select("id, status")
        .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`)
        .eq("status", "accepted");

      setStats({
        photoCount: photosData?.length || 0,
        totalLikes: votesData?.length || 0,
        followers: Math.floor((friendsData?.length || 0) / 2),
        following: Math.ceil((friendsData?.length || 0) / 2),
      });
    } catch (error: any) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Clean Header */}
      <header className="sticky top-0 glass-strong border-b border-border/30 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Profile</h1>
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile/settings")} className="rounded-lg">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-lg">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {/* Profile Info Card */}
        <Card className="shadow-card">
          <CardContent className="p-7">
            {/* Centered Profile Picture */}
            <div className="flex flex-col items-center mb-6">
              <Avatar className="w-28 h-28 mb-4 shadow-soft ring-2 ring-primary/10">
                {profile?.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} />
                ) : (
                  <AvatarFallback className="bg-muted text-foreground text-2xl font-semibold">
                    {profile?.username?.charAt(0).toUpperCase() || <UserIcon />}
                  </AvatarFallback>
                )}
              </Avatar>
              <h2 className="text-2xl font-bold mb-2">
                {profile?.username || "Unknown User"}
              </h2>
              {profile?.bio && (
                <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Clean Stats Row */}
            <div className="grid grid-cols-4 gap-5 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold mb-0.5">{stats.photoCount}</p>
                <p className="text-xs text-muted-foreground font-medium">Posts</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-0.5">{stats.followers}</p>
                <p className="text-xs text-muted-foreground font-medium">Followers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-0.5">{stats.following}</p>
                <p className="text-xs text-muted-foreground font-medium">Following</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold mb-0.5">{stats.totalLikes}</p>
                <p className="text-xs text-muted-foreground font-medium">Likes</p>
              </div>
            </div>

            {/* Simple Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => navigate("/profile/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
              <Button onClick={() => navigate("/camera")}>
                <Camera className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rank & Badges */}
        {profile?.id && <RankBadgeDisplay userId={profile.id} />}

        {/* Clean Photo Gallery */}
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="photos">
              <Camera className="w-4 h-4 mr-2" />
              Photos
            </TabsTrigger>
            <TabsTrigger value="saved">
              <Heart className="w-4 h-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photos" className="mt-5">
            {photos.length > 0 ? (
              <div className="photo-grid">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square relative overflow-hidden bg-muted cursor-pointer hover-lift rounded-lg"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption || ""}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Camera className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2 text-lg">No photos yet</h3>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    Start capturing moments
                  </p>
                  <Button onClick={() => navigate("/camera")}>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="mt-5">
            <Card>
              <CardContent className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">No saved photos</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Save photos you love
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