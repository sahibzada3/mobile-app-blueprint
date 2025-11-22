import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, User, Music, Sparkles, Share2 } from "lucide-react";
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
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  
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

  const handleDoubleTap = () => {
    if (!liked) {
      handleLike();
    }
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
  };

  return (
    <Card className="overflow-hidden group">
      <CardContent className="p-0">
        <motion.div 
          className="flex items-center gap-3 p-5"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Avatar className="w-11 h-11 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {photo.profiles?.username?.charAt(0).toUpperCase() || <User className="w-5 h-5" strokeWidth={2} />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">{photo.profiles?.username || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(photo.created_at).toLocaleDateString()}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="relative aspect-square bg-muted overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={photo.image_url}
            alt={photo.caption || "Photo"}
            className="w-full h-full object-cover"
          />
          
          {/* Double-tap heart animation */}
          {showHeartAnimation && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Heart className="w-32 h-32 fill-white text-white drop-shadow-2xl" />
            </motion.div>
          )}
        </motion.div>

        <div className="p-5 space-y-4">
          {musicTrack && (
            <motion.div 
              className="flex items-center gap-3 text-xs bg-primary/5 rounded-xl px-4 py-3 border border-primary/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Music className="w-4 h-4 text-primary" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate text-sm">{musicTrack.name}</p>
                <p className="text-muted-foreground truncate">{musicTrack.artist}</p>
              </div>
              <Badge variant="outline" className="ml-auto text-xs border-primary/20 bg-primary/5 font-medium">
                {musicTrack.mood}
              </Badge>
            </motion.div>
          )}

          <motion.div 
            className="flex items-center gap-5"
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
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
              >
                <Heart
                  className={`w-6 h-6 transition-all ${
                    liked 
                      ? "fill-primary text-primary" 
                      : "text-muted-foreground group-hover/like:text-primary"
                  }`}
                  strokeWidth={2}
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
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
                <MessageCircle className="w-6 h-6 text-muted-foreground group-hover/comment:text-primary transition-colors" strokeWidth={2} />
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 p-0 h-auto hover:bg-transparent group/share ml-auto"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Check out this photo on Frame',
                    text: photo.caption || 'Amazing photo!',
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied to clipboard!');
                }
              }}
            >
              <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }}>
                <Share2 className="w-6 h-6 text-muted-foreground group-hover/share:text-primary transition-colors" strokeWidth={2} />
              </motion.div>
            </Button>
          </motion.div>

          {photo.caption && (
            <motion.p 
              className="text-sm leading-relaxed pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <span className="font-semibold text-primary mr-2">{photo.profiles?.username}</span>
              <span className="text-foreground">{photo.caption}</span>
            </motion.p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
