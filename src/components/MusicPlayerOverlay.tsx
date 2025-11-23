import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music, Play, Pause, X, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";

interface MusicPlayerOverlayProps {
  trackName: string;
  artist?: string;
  audioUrl?: string;
  onClose: () => void;
}

export default function MusicPlayerOverlay({ trackName, artist, audioUrl, onClose }: MusicPlayerOverlayProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState([70]);
  const [showVolume, setShowVolume] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element
  useEffect(() => {
    if (audioUrl) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.loop = true;
      
      return () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      };
    }
  }, [audioUrl]);

  // Load music settings from localStorage and start playback
  useEffect(() => {
    const savedMusicEnabled = localStorage.getItem('musicEnabled');
    const savedMusicVolume = localStorage.getItem('musicVolume');
    
    // If music is disabled in settings, don't play
    if (savedMusicEnabled === 'false') {
      setIsPlaying(false);
      onClose();
      return;
    }
    
    if (savedMusicVolume) {
      const vol = parseInt(savedMusicVolume);
      setVolume([vol]);
      if (audioRef.current) {
        audioRef.current.volume = vol / 100;
      }
    }

    // Start playing
    if (audioRef.current && audioUrl) {
      audioRef.current.play().catch(err => {
        console.log("Audio autoplay blocked:", err);
        setIsPlaying(false);
      });
    }
  }, [audioUrl, onClose]);

  // Handle play/pause
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Handle volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
    localStorage.setItem('musicVolume', volume[0].toString());
  }, [volume]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-24 left-4 right-4 z-40 max-w-2xl mx-auto"
      >
        <Card className="bg-card/95 backdrop-blur-xl border-primary/20 shadow-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                <Music className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{trackName}</p>
                {artist && (
                  <p className="text-xs text-muted-foreground truncate">{artist}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowVolume(!showVolume)}
                  className="h-9 w-9"
                >
                  <Volume2 className="w-4 h-4" />
                </Button>
                
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="h-9 w-9"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onClose}
                  className="h-9 w-9"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 pt-3 border-t border-border overflow-hidden"
                >
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <Slider
                      value={volume}
                      onValueChange={setVolume}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {volume[0]}%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
