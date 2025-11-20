import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoCardProps {
  photo: {
    id: string;
    image_url: string;
    caption: string | null;
    created_at: string;
    user_id: string;
    profiles?: {
      username: string;
      avatar_url: string | null;
    };
  };
  currentUserId?: string;
}

export default function PhotoCard({ photo, currentUserId }: PhotoCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  useEffect(() => {
    loadLikes();
  }, [photo.id, currentUserId]);

  const loadLikes = async () => {
    try {
      // Get total likes for this photo
      const { data: allLikes, error: countError } = await supabase
        .from("votes")
        .select("id")
        .eq("photo_id", photo.id)
        .eq("vote_type", "like");

      if (countError) throw countError;
      setLikeCount(allLikes?.length || 0);

      // Check if current user has liked
      if (currentUserId) {
        const { data: userLike, error: userError } = await supabase
          .from("votes")
          .select("id")
          .eq("photo_id", photo.id)
          .eq("user_id", currentUserId)
          .eq("vote_type", "like")
          .maybeSingle();

        if (userError) throw userError;
        setLiked(!!userLike);
      }
    } catch (error: any) {
      console.error("Error loading likes:", error);
    }
  };

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Please login to like photos");
      return;
    }

    try {
      if (liked) {
        await supabase
          .from("votes")
          .delete()
          .eq("user_id", currentUserId)
          .eq("photo_id", photo.id)
          .eq("vote_type", "like");
        setLiked(false);
        setLikeCount(prev => prev - 1);
      } else {
        await supabase.from("votes").insert({
          user_id: currentUserId,
          photo_id: photo.id,
          vote_type: "like",
        });
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update like");
    }
  };

  return (
    <Card className="shadow-nature overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center gap-3 p-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {photo.profiles?.username?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{photo.profiles?.username || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(photo.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="aspect-square bg-muted">
          <img
            src={photo.image_url}
            alt={photo.caption || "Photo"}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 p-0 h-auto hover:bg-transparent"
              onClick={handleLike}
            >
              <Heart
                className={`w-6 h-6 transition-all ${
                  liked ? "fill-primary text-primary" : "text-muted-foreground"
                }`}
              />
              {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 p-0 h-auto hover:bg-transparent"
            >
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
            </Button>
          </div>

          {photo.caption && (
            <p className="text-sm">
              <span className="font-medium mr-2">{photo.profiles?.username}</span>
              {photo.caption}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
