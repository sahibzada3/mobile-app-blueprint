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
    <Card className="overflow-hidden shadow-elevated border-0 bg-card">
      {/* Clean Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-muted text-foreground text-sm font-medium">
              {photo.profiles?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-foreground truncate">
              {photo.profiles?.username || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(photo.created_at).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
        </Button>
      </div>

      {/* Edge-to-Edge Photo */}
      <div className="relative w-full aspect-square bg-muted">
        <img
          src={photo.image_url}
          alt={photo.caption || "Photo"}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Clean Action Bar */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <VoteButtons photoId={photo.id} currentUserId={currentUserId} />
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                toast.success(isBookmarked ? "Removed from saved" : "Saved");
              }}
            >
              <Bookmark 
                className={`w-5 h-5 ${isBookmarked ? 'fill-foreground' : ''}`}
              />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
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
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <CommentSection photoId={photo.id} currentUserId={currentUserId} />

        {photo.caption && (
          <div className="mt-2">
            <p className="text-sm leading-relaxed">
              <span className="font-medium mr-1">{photo.profiles?.username}</span>
              <span className="text-foreground">{photo.caption}</span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}