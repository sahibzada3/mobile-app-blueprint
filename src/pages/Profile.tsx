import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { LogOut, User as UserIcon, Camera, Heart, Moon, Sun, Settings, Award, TrendingUp, Zap, Users, UserPlus, Share2, Lock, Globe, Eye, ImageIcon, Star, Wind } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import NotificationBell from "@/components/notifications/NotificationBell";
import RankBadgeDisplay from "@/components/profile/RankBadgeDisplay";

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [stats, setStats] = useState({ photoCount: 0, totalLikes: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

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
      
      // Load privacy settings
      if (profileData.privacy_settings && typeof profileData.privacy_settings === 'object') {
        const settings = profileData.privacy_settings as any;
        setIsPrivate(settings.profile_visibility === 'private');
      }

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

      // Load followers/following count (mock data for now)
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
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleShareProfile = () => {
    const profileUrl = `${window.location.origin}/profile/${profile?.id}`;
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied!");
  };

  const togglePrivacy = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const newVisibility = !isPrivate ? 'private' : 'everyone';
      const currentSettings = profile?.privacy_settings || {};
      
      const { error } = await supabase
        .from("profiles")
        .update({
          privacy_settings: {
            ...currentSettings,
            profile_visibility: newVisibility
          }
        })
        .eq("id", session.user.id);

      if (error) throw error;

      setIsPrivate(!isPrivate);
      toast.success(`Profile is now ${!isPrivate ? 'private' : 'public'}`);
    } catch (error) {
      console.error("Error updating privacy:", error);
      toast.error("Failed to update privacy");
    }
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

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-6">
        {/* Nature Photography Profile Card */}
        <Card className="shadow-nature overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-card to-card">
          {/* Cover Banner */}
          <div className="h-40 bg-gradient-to-r from-primary/20 via-accent/15 to-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button 
                onClick={handleShareProfile} 
                size="sm"
                variant="secondary"
                className="bg-card/80 backdrop-blur-sm"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <CardContent className="p-6 -mt-16">
            {/* Profile Avatar & Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-md"></div>
                <Avatar className="w-28 h-28 border-4 border-card shadow-xl relative z-10 cursor-pointer hover-scale">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-3xl">
                      {profile?.username?.charAt(0).toUpperCase() || <UserIcon />}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isPrivate && (
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-card rounded-full flex items-center justify-center border-2 border-border shadow-md">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 pt-14 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold truncate">
                    {profile?.username || "Unknown User"}
                  </h2>
                  <Badge variant="secondary" className="flex-shrink-0 bg-primary/10 text-primary border-primary/20">
                    <Camera className="w-3 h-3 mr-1" />
                    Photographer
                  </Badge>
                </div>
                {profile?.bio ? (
                  <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic">Nature enthusiast</p>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/5 to-transparent hover-scale cursor-pointer transition-all">
                <Camera className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.photoCount}</p>
                <p className="text-xs text-muted-foreground">Captures</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-accent/5 to-transparent hover-scale cursor-pointer transition-all">
                <Users className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.followers}</p>
                <p className="text-xs text-muted-foreground">Admirers</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-primary/5 to-transparent hover-scale cursor-pointer transition-all">
                <Eye className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-gradient-to-br from-accent/5 to-transparent hover-scale cursor-pointer transition-all">
                <Heart className="w-5 h-5 text-accent mx-auto mb-1" />
                <p className="text-xl font-bold">{stats.totalLikes}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <Button 
                onClick={() => navigate("/profile/settings")} 
                variant="outline" 
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                onClick={() => navigate("/slices")} 
                variant="outline"
                className="flex-1"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Slices
              </Button>
              <Button 
                onClick={() => navigate("/camera")} 
                className="flex-1 bg-gradient-to-r from-primary to-accent hover:opacity-90"
              >
                <Camera className="w-4 h-4 mr-2" />
                Capture
              </Button>
            </div>

            <Separator className="mb-4" />

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3">
                {isPrivate ? (
                  <>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Private Account</p>
                      <p className="text-xs text-muted-foreground">Only approved viewers</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Public Account</p>
                      <p className="text-xs text-muted-foreground">Visible to everyone</p>
                    </div>
                  </>
                )}
              </div>
              <Switch checked={isPrivate} onCheckedChange={togglePrivacy} />
            </div>
          </CardContent>
        </Card>

        {/* Achievements Banner */}
        <Card className="shadow-nature border-0 bg-gradient-to-r from-accent/10 via-primary/10 to-accent/10 animate-fade-in hover-scale cursor-pointer" onClick={() => navigate("/weather")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Wind className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Weather Forecast</p>
                  <p className="text-xs text-muted-foreground">Best shooting times & conditions</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                View →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rank and Badges Display */}
        {profile?.id && <RankBadgeDisplay userId={profile.id} />}

        {/* Photo Collection Tabs */}
        <Tabs defaultValue="captures" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="captures" className="data-[state=active]:bg-primary/10">
              <Camera className="w-4 h-4 mr-2" />
              My Captures
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:bg-accent/10">
              <Star className="w-4 h-4 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="captures" className="mt-4">
            {photos.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {photos.map((photo, index) => (
                  <Card
                    key={photo.id}
                    className="overflow-hidden border-0 shadow-nature group cursor-pointer hover-scale animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={photo.image_url}
                        alt={photo.caption || "Nature photo"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                          <div className="flex items-center gap-2 text-sm">
                            <Heart className="w-4 h-4" />
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="shadow-nature border-0">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Camera className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Start Your Collection</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
                    Capture and share stunning nature photography with the world
                  </p>
                  <Button onClick={() => navigate("/camera")} className="bg-gradient-to-r from-primary to-accent hover:opacity-90" size="lg">
                    <Camera className="w-5 h-5 mr-2" />
                    Take Your First Photo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-4">
            <Card className="shadow-nature border-0">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/10 to-primary/10 flex items-center justify-center">
                  <Star className="w-12 h-12 text-accent" />
                </div>
                <h3 className="font-semibold text-xl mb-2">Your Favorite Shots</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Mark your favorite nature captures to showcase your best work
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
