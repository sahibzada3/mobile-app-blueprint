import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, User, Music, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { musicTracks } from "@/data/musicTracks";

interface PhotoCardProps {
  photo: {
    id: string;
    image_url: string;
    caption: string | null;
    music_track: string | null;
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
  
  const musicTrack = photo.music_track ? musicTracks.find(t => t.id === photo.music_track) : null;

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
    <Card className="shadow-2xl overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/80 hover:shadow-3xl transition-all duration-300 group">
      <CardContent className="p-0">
        <motion.div 
          className="flex items-center gap-3 p-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Avatar className="w-12 h-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold">
              {photo.profiles?.username?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{photo.profiles?.username || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(photo.created_at).toLocaleDateString()}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
          <img
            src={photo.image_url}
            alt={photo.caption || "Photo"}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="p-4 space-y-4 bg-gradient-to-b from-card to-card/50">
          {musicTrack && (
            <motion.div 
              className="flex items-center gap-2 text-xs bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-xl px-4 py-2.5 border border-primary/20 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
                <Music className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{musicTrack.name}</p>
                <p className="text-muted-foreground truncate">{musicTrack.artist}</p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs border-primary/30 bg-primary/5">
                {musicTrack.mood}
              </Badge>
            </motion.div>
          )}

          <motion.div 
            className="flex items-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 p-0 h-auto hover:bg-transparent group/like"
              onClick={handleLike}
            >
              <motion.div
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart
                  className={`w-7 h-7 transition-all ${
                    liked 
                      ? "fill-primary text-primary drop-shadow-lg" 
                      : "text-muted-foreground group-hover/like:text-primary"
                  }`}
                />
              </motion.div>
              {likeCount > 0 && (
                <span className={`text-sm font-semibold ${liked ? "text-primary" : "text-foreground"}`}>
                  {likeCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 p-0 h-auto hover:bg-transparent group/comment"
            >
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <MessageCircle className="w-7 h-7 text-muted-foreground group-hover/comment:text-primary transition-colors" />
              </motion.div>
            </Button>
          </motion.div>

          {photo.caption && (
            <motion.p 
              className="text-sm leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-semibold text-primary mr-2">{photo.profiles?.username}</span>
              <span className="text-foreground/90">{photo.caption}</span>
            </motion.p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
