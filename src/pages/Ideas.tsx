import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

// Daily inspirational scenes that rotate
const inspirationalScenes = [
  {
    id: 1,
    name: "Golden Hour Magic",
    image: "/scenes/golden-hour.jpg",
    description: "Capture the warm, golden light during the magic hour"
  },
  {
    id: 2,
    name: "Blue Hour Serenity",
    image: "/scenes/blue-hour.jpg",
    description: "The peaceful twilight moments when the sky turns deep blue"
  },
  {
    id: 3,
    name: "Majestic Landscapes",
    image: "/scenes/landscape.jpg",
    description: "Vast, breathtaking views of nature's grandeur"
  },
  {
    id: 4,
    name: "Urban Geometry",
    image: "/scenes/architecture.jpg",
    description: "Modern architecture and city lines that inspire"
  },
  {
    id: 5,
    name: "Night Photography",
    image: "/scenes/night-photography.jpg",
    description: "Capture the mystery and beauty of nighttime scenes"
  }
];

export default function Ideas() {
  const navigate = useNavigate();
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);

  useEffect(() => {
    checkAuth();
    // Set daily scene based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentSceneIndex(dayOfYear % inspirationalScenes.length);
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
  };

  const todaysScene = inspirationalScenes[currentSceneIndex];

  return (
    <div className="min-h-screen gradient-soft pb-20">
      {/* Header */}
      <header className="sticky top-0 glass-strong border-b border-border/30 z-40 shadow-elevated backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Daily Inspiration</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Your scene for today</p>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6">
        {/* Today's Featured Scene */}
        <Card className="glass-card border-border/50 overflow-hidden mb-6">
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={todaysScene.image}
              alt={todaysScene.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span className="text-xs font-semibold text-yellow-400 uppercase tracking-wide">Today's Scene</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{todaysScene.name}</h2>
              <p className="text-sm text-white/90 leading-relaxed">{todaysScene.description}</p>
            </div>
          </div>
        </Card>

        {/* All Scenes Grid */}
        <div className="mb-4">
          <h3 className="text-lg font-bold tracking-tight mb-3">Explore All Scenes</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {inspirationalScenes.map((scene, index) => (
            <Card 
              key={scene.id} 
              className={`glass-card border-border/50 overflow-hidden cursor-pointer hover:shadow-card-hover transition-all duration-300 hover-lift ${
                index === currentSceneIndex ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => navigate("/camera")}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={scene.image}
                  alt={scene.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-sm font-bold text-white mb-1 tracking-tight">{scene.name}</h3>
                  <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">{scene.description}</p>
                </div>
                {index === currentSceneIndex && (
                  <div className="absolute top-3 right-3">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Tip */}
        <Card className="glass-card border-primary/20 mt-6">
          <CardContent className="p-5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Daily Inspiration Tip</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each day brings a new featured scene to inspire your photography. Visit daily to discover fresh creative ideas and capture stunning moments!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
