import { useState, useEffect } from "react";
import { Music, Play, Check, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { musicTracks, getMoodColor, MusicTrack } from "@/data/musicTracks";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MusicSelectorProps {
  selectedTrack: string | null;
  onSelectTrack: (trackId: string | null) => void;
}

export default function MusicSelector({ selectedTrack, onSelectTrack }: MusicSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(true);

  useEffect(() => {
    const savedMusicEnabled = localStorage.getItem('musicEnabled');
    setMusicEnabled(savedMusicEnabled !== 'false');
  }, []);

  const handleTrackClick = (trackId: string) => {
    if (selectedTrack === trackId) {
      onSelectTrack(null);
    } else {
      onSelectTrack(trackId);
    }
  };

  const selectedTrackData = musicTracks.find(t => t.id === selectedTrack);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-primary" />
          <Label>Background Music</Label>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          disabled={!musicEnabled}
        >
          {isExpanded ? "Hide" : "Show"} Library
        </Button>
      </div>

      {!musicEnabled && (
        <Alert>
          <VolumeX className="h-4 w-4" />
          <AlertDescription>
            Music is disabled in settings. Enable it to add music to your photos.
          </AlertDescription>
        </Alert>
      )}

      {selectedTrackData && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Music className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{selectedTrackData.name}</p>
              <p className="text-xs text-muted-foreground">{selectedTrackData.artist}</p>
            </div>
          </div>
          <Badge className={getMoodColor(selectedTrackData.mood)}>
            {selectedTrackData.mood}
          </Badge>
        </div>
      )}

      {isExpanded && (
        <ScrollArea className="h-64 rounded-md border p-2">
          <div className="space-y-2">
            {musicTracks.map((track) => (
              <div
                key={track.id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${
                  selectedTrack === track.id
                    ? "bg-primary/10 border border-primary"
                    : "hover:bg-muted"
                }`}
                onClick={() => handleTrackClick(track.id)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    selectedTrack === track.id ? "bg-primary" : "bg-muted"
                  }`}>
                    {selectedTrack === track.id ? (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <Play className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{track.name}</p>
                    <p className="text-xs text-muted-foreground">{track.artist} • {track.duration}</p>
                  </div>
                  <Badge className={getMoodColor(track.mood)} variant="secondary">
                    {track.mood}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
