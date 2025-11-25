import * as React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Share2, MoreHorizontal, Bookmark, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { VoteButtons } from "@/components/feed/VoteButtons";
import { CommentSection } from "@/components/feed/CommentSection";
import { LazyImage } from "@/components/ui/lazy-image";

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
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [flareCount, setFlareCount] = React.useState(0);
  const [hasFlared, setHasFlared] = React.useState(false);
  const [showFlareAnimation, setShowFlareAnimation] = React.useState(false);
  const lastTapRef = React.useRef(0);
  const tapTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load flare count and user's flare status
  React.useEffect(() => {
    loadFlareData();
    
    const channel = supabase
      .channel(`votes-realtime-${photo.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "votes",
          filter: `photo_id=eq.${photo.id}`,
        },
        (payload) => {
          if (payload.new.vote_type === "upvote") {
            setFlareCount((prev) => prev + 1);
            if (payload.new.user_id === currentUserId) {
              setHasFlared(true);
            }
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "votes",
          filter: `photo_id=eq.${photo.id}`,
        },
        (payload) => {
          if (payload.old.vote_type === "upvote") {
            setFlareCount((prev) => Math.max(0, prev - 1));
            if (payload.old.user_id === currentUserId) {
              setHasFlared(false);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [photo.id, currentUserId]);

  const loadFlareData = async () => {
    if (!currentUserId) return;

    // Get flare count (upvotes)
    const { data: flareData } = await supabase
      .from("votes")
      .select("*")
      .eq("photo_id", photo.id)
      .eq("vote_type", "upvote");

    setFlareCount(flareData?.length || 0);

    // Check if current user has flared
    const { data: userFlare } = await supabase
      .from("votes")
      .select("*")
      .eq("photo_id", photo.id)
      .eq("user_id", currentUserId)
      .eq("vote_type", "upvote")
      .single();

    setHasFlared(!!userFlare);
  };

  const handleDoubleTap = async () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;

    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      // Double tap detected
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
        tapTimeoutRef.current = null;
      }

      if (!hasFlared && currentUserId) {
        // Register flare
        setShowFlareAnimation(true);
        setHasFlared(true);
        setFlareCount((prev) => prev + 1);

        const { error } = await supabase.from("votes").insert({
          photo_id: photo.id,
          user_id: currentUserId,
          vote_type: "upvote",
        });

        if (error) {
          console.error("Error registering flare:", error);
          setHasFlared(false);
          setFlareCount((prev) => prev - 1);
          toast.error("Failed to register flare");
        } else {
          toast.success("Flare sent! ⚡");
        }

        setTimeout(() => setShowFlareAnimation(false), 1000);
      }
    } else {
      // First tap
      if (tapTimeoutRef.current) {
        clearTimeout(tapTimeoutRef.current);
      }
    }

    lastTapRef.current = now;
  };

  return (
    <Card className="overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border-border/30 glass-card">
      {/* Professional Header */}
      <div className="flex items-center justify-between px-5 py-4 glass">
        <div className="flex items-center gap-3">
          <Avatar className="w-11 h-11 ring-2 ring-primary/10 shadow-sm">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground text-sm font-semibold">
              {photo.profiles?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {photo.profiles?.username || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(photo.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted/60 rounded-lg">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* High-Quality Image Display with Double-Tap Flare */}
      <div 
        className="relative w-full aspect-square bg-gradient-to-br from-muted/30 to-muted/10 select-none"
        onTouchEnd={handleDoubleTap}
        onClick={(e) => {
          if (e.detail === 2) {
            handleDoubleTap();
          }
        }}
      >
        <LazyImage
          src={photo.image_url}
          alt={photo.caption || "Photo"}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
        
        {/* Flare Counter Badge */}
        {flareCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full shadow-lg"
          >
            <Zap className={`w-4 h-4 ${hasFlared ? "fill-yellow-400 text-yellow-400" : "text-white"}`} />
            <span className="text-sm font-semibold">{flareCount}</span>
          </motion.div>
        )}

        {/* Double-Tap Flare Animation */}
        <AnimatePresence>
          {showFlareAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Zap className="w-24 h-24 fill-yellow-400 text-yellow-400 drop-shadow-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Professional Action Bar */}
      <div className="px-4 py-2.5 border-t border-border/30">
        <div className="flex items-center justify-between mb-2">
          <VoteButtons photoId={photo.id} currentUserId={currentUserId} />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted/60 rounded-lg transition-all duration-200"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(isBookmarked ? "Removed from saved" : "Saved");
              }}
            >
              <Bookmark 
                className={`w-4 h-4 transition-all duration-200 ${isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted/60 rounded-lg transition-all duration-200"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Check out this photo',
                    url: window.location.href,
                  }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link copied!');
                }
              }}
            >
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {photo.caption && (
          <div className="mb-2">
            <p className="text-xs leading-relaxed">
              <span className="font-semibold mr-2">{photo.profiles?.username}</span>
              <span className="text-foreground/90">{photo.caption}</span>
            </p>
          </div>
        )}

        <CommentSection photoId={photo.id} currentUserId={currentUserId} />
      </div>
    </Card>
  );
}