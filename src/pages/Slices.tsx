import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Play, Music, Lock, Eye } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Slice {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  music_track: string | null;
  visibility: string;
  chain_required: boolean;
  required_chain_id: string | null;
  views_count: number;
  created_at: string;
  expires_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Slices() {
  const navigate = useNavigate();
  const [slices, setSlices] = useState<Slice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlice, setSelectedSlice] = useState<Slice | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    loadSlices();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUserId(session.user.id);
  };

  const loadSlices = async () => {
    try {
      const { data, error } = await supabase
        .from("slices")
        .select(`
          *,
          profiles (username, avatar_url)
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSlices(data || []);
    } catch (error) {
      console.error("Error loading slices:", error);
      toast.error("Failed to load slices");
    } finally {
      setLoading(false);
    }
  };

  const viewSlice = async (slice: Slice) => {
    if (!userId) return;

    try {
      // Record the view
      await supabase.from("slice_views").insert({
        slice_id: slice.id,
        viewer_id: userId,
      });

      // Update views count
      await supabase
        .from("slices")
        .update({ views_count: slice.views_count + 1 })
        .eq("id", slice.id);

      setSelectedSlice(slice);
    } catch (error) {
      console.error("Error viewing slice:", error);
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Slices</h1>
          <Button onClick={() => navigate("/camera?mode=slice")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Slice
          </Button>
        </div>
      </div>

      {/* Slices Grid */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="aspect-[9/16] animate-pulse bg-muted" />
            ))}
          </div>
        ) : slices.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Slices Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first slice to share moments with friends
            </p>
            <Button onClick={() => navigate("/camera?mode=slice")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Slice
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {slices.map((slice) => (
              <Dialog key={slice.id}>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="cursor-pointer"
                    onClick={() => viewSlice(slice)}
                  >
                    <Card className="relative aspect-[9/16] overflow-hidden group">
                      <img
                        src={slice.image_url}
                        alt={slice.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* User Info */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <Avatar className="w-8 h-8 border-2 border-white">
                          <AvatarImage src={slice.profiles.avatar_url || undefined} />
                          <AvatarFallback>{slice.profiles.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-white text-sm font-medium drop-shadow-lg">
                          {slice.profiles.username}
                        </span>
                      </div>

                      {/* Icons */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2">
                        {slice.music_track && (
                          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <Music className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {slice.chain_required && (
                          <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h3 className="text-white font-semibold text-sm mb-1 drop-shadow-lg">
                          {slice.title}
                        </h3>
                        <div className="flex items-center gap-1 text-white/80 text-xs">
                          <Eye className="w-3 h-3" />
                          <span>{slice.views_count}</span>
                        </div>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-white rounded-full p-4">
                          <Play className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </DialogTrigger>

                <DialogContent className="max-w-md p-0 gap-0 bg-black">
                  {selectedSlice?.id === slice.id && (
                    <div className="relative aspect-[9/16] w-full">
                      <img
                        src={slice.image_url}
                        alt={slice.title}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40">
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-10 h-10 border-2 border-white">
                              <AvatarImage src={slice.profiles.avatar_url || undefined} />
                              <AvatarFallback>{slice.profiles.username[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-white font-medium drop-shadow-lg">
                              {slice.profiles.username}
                            </span>
                          </div>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                          <h2 className="text-white text-xl font-bold mb-2 drop-shadow-lg">
                            {slice.title}
                          </h2>
                          {slice.description && (
                            <p className="text-white/90 text-sm drop-shadow-lg mb-2">
                              {slice.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-white/80 text-sm">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{slice.views_count} views</span>
                            </div>
                            {slice.music_track && (
                              <div className="flex items-center gap-1">
                                <Music className="w-4 h-4" />
                                <span>{slice.music_track}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
