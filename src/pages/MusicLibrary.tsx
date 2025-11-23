import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Music, Play, Pause, Search, Heart, Upload } from "lucide-react";
import { musicTracks } from "@/data/musicTracks";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export default function MusicLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [uploadedTracks, setUploadedTracks] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allTracks = [...musicTracks, ...uploadedTracks];
  
  const filteredTracks = allTracks.filter(
    (track) =>
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.mood.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUploadMusic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('audio/')) {
      toast.error("Please upload an audio file");
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to upload music");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Date.now()}.${fileExt}`;
      
      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(`music/${fileName}`, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(`music/${fileName}`);

      // Add to uploaded tracks
      const newTrack = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ""),
        mood: "Custom",
        url: publicUrl,
        isCustom: true
      };

      setUploadedTracks(prev => [...prev, newTrack]);
      toast.success("Music uploaded successfully!");
    } catch (error: any) {
      console.error("Error uploading music:", error);
      toast.error("Failed to upload music");
    } finally {
      setUploading(false);
    }
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) =>
      prev.includes(trackId)
        ? prev.filter((id) => id !== trackId)
        : [...prev, trackId]
    );
    toast.success(
      favorites.includes(trackId)
        ? "Removed from favorites"
        : "Added to favorites"
    );
  };

  const togglePlay = (trackId: string) => {
    if (playingTrack === trackId) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(trackId);
    }
  };

  const categories = [...new Set(allTracks.map((t) => t.mood))];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Music Library</h1>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadMusic}
                accept="audio/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="sm"
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Uploading..." : "Upload Music"}
              </Button>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search tracks, artists, genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {categories.map((category) => {
              const categoryTracks = filteredTracks.filter(
                (track) => track.mood === category
              );
              if (categoryTracks.length === 0) return null;

              return (
                <div key={category}>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryTracks.map((track) => (
                      <TrackCard
                        key={track.id}
                        track={track}
                        isPlaying={playingTrack === track.id}
                        isFavorite={favorites.includes(track.id)}
                        onTogglePlay={() => togglePlay(track.id)}
                        onToggleFavorite={() => toggleFavorite(track.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                <p className="text-muted-foreground">
                  Start adding tracks to your favorites
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allTracks
                  .filter((track) => favorites.includes(track.id))
                  .map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={playingTrack === track.id}
                      isFavorite={true}
                      onTogglePlay={() => togglePlay(track.id)}
                      onToggleFavorite={() => toggleFavorite(track.id)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTracks.slice(0, 10).map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={playingTrack === track.id}
                  isFavorite={favorites.includes(track.id)}
                  onTogglePlay={() => togglePlay(track.id)}
                  onToggleFavorite={() => toggleFavorite(track.id)}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTracks.slice(0, 10).map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={playingTrack === track.id}
                  isFavorite={favorites.includes(track.id)}
                  onTogglePlay={() => togglePlay(track.id)}
                  onToggleFavorite={() => toggleFavorite(track.id)}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface TrackCardProps {
  track: {
    id: string;
    name: string;
    mood: string;
  };
  isPlaying: boolean;
  isFavorite: boolean;
  onTogglePlay: () => void;
  onToggleFavorite: () => void;
}

function TrackCard({
  track,
  isPlaying,
  isFavorite,
  onTogglePlay,
  onToggleFavorite,
}: TrackCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Button
              size="icon"
              variant={isPlaying ? "default" : "outline"}
              onClick={onTogglePlay}
              className="shrink-0"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">
                {track.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">{track.mood}</span>
              </div>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={onToggleFavorite}
              className="shrink-0"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? "fill-primary text-primary" : ""
                }`}
              />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
