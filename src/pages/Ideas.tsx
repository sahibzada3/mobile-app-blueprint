import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";

// Import all filter scene images
import goldenHour from "@/assets/filters/golden-hour.jpg";
import fogMist from "@/assets/filters/fog-mist.jpg";
import forest from "@/assets/filters/forest.jpg";
import beachDesert from "@/assets/filters/beach-desert.jpg";
import middaySun from "@/assets/filters/midday-sun.jpg";
import night from "@/assets/filters/night.jpg";
import oldArchitecture from "@/assets/filters/old-architecture.jpg";
import rain from "@/assets/filters/rain.jpg";
import silhouette from "@/assets/filters/silhouette.jpg";
import skyClouds from "@/assets/filters/sky-clouds.jpg";
import urban from "@/assets/filters/urban.jpg";
import water from "@/assets/filters/water.jpg";
import indoorGolden from "@/assets/filters/indoor-golden.jpg";
import street from "@/assets/filters/street.jpg";
import animal from "@/assets/filters/animal.jpg";

// All filter scenes for daily inspiration
const filterScenes = [
  {
    id: 1,
    name: "Golden Hour Magic",
    image: goldenHour,
    description: "Warm, cinematic light at sunrise and sunset"
  },
  {
    id: 2,
    name: "Midday Sun",
    image: middaySun,
    description: "Bright, high-contrast daylight scenes"
  },
  {
    id: 3,
    name: "Night Sky",
    image: night,
    description: "Stars, city lights, and nighttime beauty"
  },
  {
    id: 4,
    name: "Fog & Mist",
    image: fogMist,
    description: "Ethereal, mysterious atmospheric conditions"
  },
  {
    id: 5,
    name: "Silhouette",
    image: silhouette,
    description: "Dramatic backlit subjects and shapes"
  },
  {
    id: 6,
    name: "Urban",
    image: urban,
    description: "City streets, architecture, and urban life"
  },
  {
    id: 7,
    name: "Water",
    image: water,
    description: "Lakes, rivers, oceans, and reflections"
  },
  {
    id: 8,
    name: "Forest",
    image: forest,
    description: "Woodland light, trees, and natural paths"
  },
  {
    id: 9,
    name: "Beach & Desert",
    image: beachDesert,
    description: "Coastal waves and sandy landscapes"
  },
  {
    id: 10,
    name: "Sky & Clouds",
    image: skyClouds,
    description: "Dramatic skies, cloud formations, and weather"
  },
  {
    id: 11,
    name: "Rain",
    image: rain,
    description: "Wet streets, droplets, and moody weather"
  },
  {
    id: 12,
    name: "Indoor Golden",
    image: indoorGolden,
    description: "Warm indoor light through windows"
  },
  {
    id: 13,
    name: "Old Architecture",
    image: oldArchitecture,
    description: "Historic buildings, textures, and vintage charm"
  },
  {
    id: 14,
    name: "Street Photography",
    image: street,
    description: "Urban life, candid moments, and city stories"
  },
  {
    id: 15,
    name: "Animal Wildlife",
    image: animal,
    description: "Wildlife, pets, and creatures in their habitat"
  }
];

export default function Ideas() {
  const navigate = useNavigate();
  const [currentSceneIndex, setCurrentSceneIndex] = React.useState(0);

  React.useEffect(() => {
    checkAuth();
    // Set daily scene based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setCurrentSceneIndex(dayOfYear % filterScenes.length);
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
  };

  const todaysScene = filterScenes[currentSceneIndex];

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

        {/* All Filter Scenes Grid */}
        <div className="mb-4">
          <h3 className="text-lg font-bold tracking-tight mb-3">Explore All Filter Scenes</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {filterScenes.map((scene, index) => (
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

        {/* Daily Tip */}
        <Card className="glass-card border-primary/20 mt-6 mb-4">
          <CardContent className="p-5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium mb-1">Daily Scene Inspiration</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each day showcases a different filter scene to inspire your photography. Tap any scene to open the camera and start capturing with that style!
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
