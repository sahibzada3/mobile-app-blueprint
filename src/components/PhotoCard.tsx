import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Share2, MoreHorizontal, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { VoteButtons } from "@/components/feed/VoteButtons";
import { CommentSection } from "@/components/feed/CommentSection";

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
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleDoubleTap = () => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
  };

  return (
    <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border-0 bg-card group">
      <CardContent className="p-0">
        {/* Header with User Info */}
        <motion.div 
          className="flex items-center gap-3 px-4 py-3 border-b border-border/50"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Avatar className="w-10 h-10 ring-2 ring-primary/20 ring-offset-2 ring-offset-background cursor-pointer hover:ring-primary/40 transition-all">
            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/20 text-primary font-semibold text-sm">
              {photo.profiles?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" strokeWidth={2.5} />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">{photo.profiles?.username || "Unknown"}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(photo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted"
          >
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
          </Button>
        </motion.div>

        {/* Photo with Enhanced Interaction */}
        <motion.div 
          className="relative aspect-square bg-muted overflow-hidden cursor-pointer"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={photo.image_url}
            alt={photo.caption || "Photo"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Double-tap heart animation */}
          {showHeartAnimation && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <svg className="w-32 h-32 fill-white text-white drop-shadow-2xl" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Action Buttons Section */}
        <div className="px-4 py-3 space-y-3">
          <motion.div 
            className="flex items-center justify-between"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <VoteButtons photoId={photo.id} currentUserId={currentUserId} />
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-muted group/bookmark"
                onClick={() => {
                  setIsBookmarked(!isBookmarked);
                  toast.success(isBookmarked ? "Removed from saved" : "Saved to collection");
                }}
              >
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Bookmark 
                    className={`w-5 h-5 transition-colors ${
                      isBookmarked 
                        ? 'fill-primary text-primary' 
                        : 'text-muted-foreground group-hover/bookmark:text-primary'
                    }`} 
                    strokeWidth={2} 
                  />
                </motion.div>
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-muted group/share"
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
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Share2 className="w-5 h-5 text-muted-foreground group-hover/share:text-primary transition-colors" strokeWidth={2} />
                </motion.div>
              </Button>
            </div>
          </motion.div>

          <CommentSection photoId={photo.id} currentUserId={currentUserId} />

          {photo.caption && (
            <motion.div 
              className="pt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-foreground mr-2">{photo.profiles?.username}</span>
                <span className="text-muted-foreground">{photo.caption}</span>
              </p>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
