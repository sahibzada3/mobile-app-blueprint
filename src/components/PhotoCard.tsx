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

      {/* High-Quality Image Display */}
      <div className="relative w-full aspect-square bg-gradient-to-br from-muted/30 to-muted/10">
        <img
          src={photo.image_url}
          alt={photo.caption || "Photo"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Professional Action Bar */}
      <div className="px-5 py-4 border-t border-border/30">
        <div className="flex items-center justify-between mb-3">
          <VoteButtons photoId={photo.id} currentUserId={currentUserId} />
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted/60 rounded-lg transition-all duration-200"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(isBookmarked ? "Removed from saved" : "Saved");
              }}
            >
              <Bookmark 
                className={`w-5 h-5 transition-all duration-200 ${isBookmarked ? 'fill-primary text-primary' : 'text-muted-foreground'}`}
              />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-muted/60 rounded-lg transition-all duration-200"
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