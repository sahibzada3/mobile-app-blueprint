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
import { LogOut, User as UserIcon, Camera, Heart, Image, Moon, Sun, Settings, Award, TrendingUp, Zap, Users, UserPlus, Share2, Lock, Globe, Eye, Grid, BookmarkIcon, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Profile() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [stats, setStats] = useState({ photoCount: 0, totalLikes: 0, followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [showStories, setShowStories] = useState(true);

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

      <main className="max-w-lg mx-auto px-4 pt-4 pb-6 space-y-4">
        {/* Stories Section */}
        {showStories && (
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-border cursor-pointer hover-scale">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                  <span className="text-xs text-primary-foreground font-bold">+</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground">Your Story</span>
            </div>
            
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 opacity-50">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-dashed border-border"></div>
                <span className="text-xs text-muted-foreground">Upcoming</span>
              </div>
            ))}
          </div>
        )}

        {/* Profile Header Card */}
        <Card className="shadow-nature overflow-hidden border-0">
          <CardContent className="p-6">
            {/* Profile Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full animate-pulse"></div>
                <Avatar className="w-24 h-24 border-4 border-card shadow-lg relative z-10 cursor-pointer hover-scale">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary text-2xl">
                      {profile?.username?.charAt(0).toUpperCase() || <UserIcon />}
                    </AvatarFallback>
                  )}
                </Avatar>
                {isPrivate && (
                  <div className="absolute bottom-0 right-0 w-7 h-7 bg-card rounded-full flex items-center justify-center border-2 border-border">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold truncate">
                    {profile?.username || "Unknown User"}
                  </h2>
                  <Badge variant="secondary" className="flex-shrink-0">
                    <Zap className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                </div>
                {profile?.bio ? (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{profile.bio}</p>
                ) : (
                  <p className="text-sm text-muted-foreground/60 italic mb-3">No bio yet</p>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigate("/profile/settings")} 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    onClick={handleShareProfile} 
                    variant="outline" 
                    size="sm"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 text-center mb-4">
              <button className="hover-scale cursor-pointer">
                <p className="text-xl font-bold">{stats.photoCount}</p>
                <p className="text-xs text-muted-foreground">Posts</p>
              </button>
              <button className="hover-scale cursor-pointer">
                <p className="text-xl font-bold">{stats.followers}</p>
                <p className="text-xs text-muted-foreground">Followers</p>
              </button>
              <button className="hover-scale cursor-pointer">
                <p className="text-xl font-bold">{stats.following}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </button>
              <button className="hover-scale cursor-pointer">
                <p className="text-xl font-bold">{stats.totalLikes}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </button>
            </div>

            <Separator />

            {/* Quick Privacy Toggle */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                {isPrivate ? (
                  <>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Private Account</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">Public Account</span>
                  </>
                )}
              </div>
              <Switch checked={isPrivate} onCheckedChange={togglePrivacy} />
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-nature border-0 hover-scale cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <UserCheck className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Close Friends</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-nature border-0 hover-scale cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-accent/10">
                  <BookmarkIcon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Saved</p>
                  <p className="text-xl font-bold">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gallery Tabs */}
        <Tabs defaultValue="grid" className="w-full animate-fade-in">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="grid" className="data-[state=active]:bg-primary/10">
              <Grid className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-accent/10">
              <BookmarkIcon className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="tagged" className="data-[state=active]:bg-primary/10">
              <Users className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-4">
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
              <Card className="shadow-nature border-0">
                <CardContent className="p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Camera className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Share Photos</h3>
                  <p className="text-muted-foreground mb-6 max-w-xs mx-auto text-sm">
                    When you share photos, they'll appear on your profile
                  </p>
                  <Button onClick={() => navigate("/camera")} className="bg-gradient-to-r from-primary to-accent">
                    <Camera className="w-4 h-4 mr-2" />
                    Share Your First Photo
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="mt-4">
            <Card className="shadow-nature border-0">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <BookmarkIcon className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Save Posts You Love</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Bookmark your favorite posts to view them later
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tagged" className="mt-4">
            <Card className="shadow-nature border-0">
              <CardContent className="p-16 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Users className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Photos of You</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  When people tag you in photos, they'll appear here
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
