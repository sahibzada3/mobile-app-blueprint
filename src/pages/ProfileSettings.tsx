import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Camera, Loader2, Trash2, Shield } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [privacySettings, setPrivacySettings] = useState({
    profile_visibility: "everyone",
    photo_visibility: "everyone",
    activity_visibility: "everyone"
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

      setEmail(session.user.email || "");

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;

      setProfile(profileData);
      setUsername(profileData.username || "");
      setBio(profileData.bio || "");
      
      if (profileData.privacy_settings && typeof profileData.privacy_settings === 'object') {
        const settings = profileData.privacy_settings as any;
        setPrivacySettings({
          profile_visibility: settings.profile_visibility || "everyone",
          photo_visibility: settings.photo_visibility || "everyone",
          activity_visibility: settings.activity_visibility || "everyone"
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", session.user.id);

      if (updateError) throw updateError;

      setProfile({ ...profile, avatar_url: publicUrl });
      toast.success("Avatar updated successfully!");
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }

    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          bio: bio.trim()
        })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      navigate("/profile");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast.error(error.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrivacySettings = async () => {
    setSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ privacy_settings: privacySettings })
        .eq("id", session.user.id);

      if (error) throw error;

      toast.success("Settings updated successfully!");
    } catch (error: any) {
      console.error("Error updating privacy settings:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Delete profile (this will cascade delete related data)
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", session.user.id);

      if (deleteError) throw deleteError;

      // Sign out
      await supabase.auth.signOut();
      
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-display font-bold text-primary">Settings</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your profile details and avatar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 mr-2" />
                  )}
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG or WEBP. Max 5MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                {bio.length}/200 characters
              </p>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={saving}
              variant="outline"
              className="w-full"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Change Password
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>Control who can see your content and activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Visibility */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Profile Visibility</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Who can view your profile information
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-everyone">Everyone</Label>
                    <p className="text-xs text-muted-foreground">Anyone can view your profile</p>
                  </div>
                  <Switch
                    id="profile-everyone"
                    checked={privacySettings.profile_visibility === "everyone"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, profile_visibility: "everyone" });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-friends">Friends Only</Label>
                    <p className="text-xs text-muted-foreground">Only your friends can view</p>
                  </div>
                  <Switch
                    id="profile-friends"
                    checked={privacySettings.profile_visibility === "friends"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, profile_visibility: "friends" });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="profile-private">Private</Label>
                    <p className="text-xs text-muted-foreground">Only you can view</p>
                  </div>
                  <Switch
                    id="profile-private"
                    checked={privacySettings.profile_visibility === "private"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, profile_visibility: "private" });
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Photo Visibility */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Photo Visibility</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Who can see your photos
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="photo-everyone">Everyone</Label>
                    <p className="text-xs text-muted-foreground">Anyone can see your photos</p>
                  </div>
                  <Switch
                    id="photo-everyone"
                    checked={privacySettings.photo_visibility === "everyone"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, photo_visibility: "everyone" });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="photo-friends">Friends Only</Label>
                    <p className="text-xs text-muted-foreground">Only friends can see</p>
                  </div>
                  <Switch
                    id="photo-friends"
                    checked={privacySettings.photo_visibility === "friends"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, photo_visibility: "friends" });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="photo-private">Private</Label>
                    <p className="text-xs text-muted-foreground">Only you can see</p>
                  </div>
                  <Switch
                    id="photo-private"
                    checked={privacySettings.photo_visibility === "private"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, photo_visibility: "private" });
                    }}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Activity Visibility */}
            <div className="space-y-4">
              <div>
                <Label className="text-base font-semibold">Activity Visibility</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Who can see your activity (votes, comments, chains)
                </p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activity-everyone">Everyone</Label>
                    <p className="text-xs text-muted-foreground">Anyone can see your activity</p>
                  </div>
                  <Switch
                    id="activity-everyone"
                    checked={privacySettings.activity_visibility === "everyone"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, activity_visibility: "everyone" });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activity-friends">Friends Only</Label>
                    <p className="text-xs text-muted-foreground">Only friends can see</p>
                  </div>
                  <Switch
                    id="activity-friends"
                    checked={privacySettings.activity_visibility === "friends"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, activity_visibility: "friends" });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="activity-private">Private</Label>
                    <p className="text-xs text-muted-foreground">Only you can see</p>
                  </div>
                  <Switch
                    id="activity-private"
                    checked={privacySettings.activity_visibility === "private"}
                    onCheckedChange={(checked) => {
                      if (checked) setPrivacySettings({ ...privacySettings, activity_visibility: "private" });
                    }}
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleSavePrivacySettings}
              disabled={saving}
              className="w-full"
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Settings
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove all your data including photos, messages, and
                    contributions from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}