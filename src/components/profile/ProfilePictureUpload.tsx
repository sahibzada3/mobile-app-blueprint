import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProfilePictureUploadProps {
  currentAvatarUrl?: string;
  userId: string;
  username: string;
  onUploadComplete: (url: string) => void;
}

export default function ProfilePictureUpload({
  currentAvatarUrl,
  userId,
  username,
  onUploadComplete,
}: ProfilePictureUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validate file
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('photos')
        .upload(`avatars/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(`avatars/${fileName}`);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      toast.success('Profile picture updated');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className="w-28 h-28 shadow-soft ring-2 ring-primary/10">
        {currentAvatarUrl ? (
          <AvatarImage src={currentAvatarUrl} alt={username} />
        ) : (
          <AvatarFallback className="bg-muted text-foreground text-2xl font-semibold">
            {username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        )}
      </Avatar>
      
      <Button
        size="icon"
        variant="default"
        className="absolute bottom-0 right-0 rounded-full shadow-lg"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}
