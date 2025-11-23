import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Music, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { musicTracks } from "@/data/musicTracks";
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
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const audioRef = useState<HTMLAudioElement | null>(null)[0];
  
  const musicTrack = photo.music_track ? musicTracks.find(t => t.id === photo.music_track) : null;
  const isOwnPhoto = currentUserId === photo.user_id;

  // Initialize audio when music track is available
  useEffect(() => {
    if (musicTrack?.audioUrl) {
      const audio = new Audio(musicTrack.audioUrl);
      audio.loop = true;
      audio.volume = 0.3;
      
      // Check if music is enabled in settings
      const musicEnabled = localStorage.getItem('musicEnabled') !== 'false';
      const musicVolume = parseInt(localStorage.getItem('musicVolume') || '70');
      
      if (musicEnabled) {
        audio.volume = musicVolume / 100;
        audio.play().catch(() => setIsPlayingMusic(false));
        setIsPlayingMusic(true);
      }
      
      return () => {
        audio.pause();
        audio.src = '';
      };
    }
  }, [musicTrack]);

  const handleDoubleTap = () => {
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
  };

  const toggleMusic = () => {
    // Music toggle functionality can be added here if needed
    setIsPlayingMusic(!isPlayingMusic);
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
            <VoteButtons photoId={photo.id} currentUserId={currentUserId} />
            
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

          <CommentSection photoId={photo.id} currentUserId={currentUserId} />

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
