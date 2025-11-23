import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Share2, MoreHorizontal, Bookmark } from "lucide-react";
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
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <Card className="overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 border-border/50 bg-card">
      {/* Professional Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-gradient-to-r from-card to-card/95">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/10">
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
        <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-muted/50">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* High-Quality Image Display */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-muted/30 to-muted/10">
        <img
          src={photo.image_url}
          alt={photo.caption || "Photo"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {photo.music_track && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full">
            <p className="text-xs text-white font-medium">♫ {photo.music_track}</p>
          </div>
        )}
      </div>

      {/* Professional Action Bar */}
      <div className="px-4 py-3.5 border-t border-border/50">
        <div className="flex items-center justify-between mb-3">
          <VoteButtons photoId={photo.id} currentUserId={currentUserId} />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted/50 transition-colors"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(isBookmarked ? "Removed from saved" : "Saved");
              }}
            >
              <Bookmark 
                className={`w-5 h-5 transition-all ${isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted/50 transition-colors"
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
              <Share2 className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>

        {photo.caption && (
          <div className="mb-3">
            <p className="text-sm leading-relaxed">
              <span className="font-semibold mr-1.5">{photo.profiles?.username}</span>
              <span className="text-foreground/90">{photo.caption}</span>
            </p>
          </div>
        )}

        <CommentSection photoId={photo.id} currentUserId={currentUserId} />
      </div>
    </Card>
  );
}