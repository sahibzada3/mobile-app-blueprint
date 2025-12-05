import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Camera, Sparkles, Zap, Users, Trophy, Type } from "lucide-react";

interface Feature {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  action: string;
  route: string;
  gradient: string;
}

const features: Feature[] = [
  {
    id: "camera",
    icon: Camera,
    title: "Capture",
    description: "Take cinematic photos with smart filters",
    action: "Open Camera",
    route: "/camera",
    gradient: "from-cyan-500/30 to-cyan-600/30"
  },
  {
    id: "editor",
    icon: Type,
    title: "Add Words",
    description: "Overlay poetry & quotes on your photos",
    action: "Open Editor",
    route: "/editor",
    gradient: "from-violet-500/30 to-purple-500/30"
  },
  {
    id: "flare",
    icon: Zap,
    title: "Give Flares",
    description: "Double-tap photos to show appreciation",
    action: "View Feed",
    route: "/feed",
    gradient: "from-orange-500/30 to-amber-500/30"
  },
  {
    id: "spotlight",
    icon: Users,
    title: "Flare Chains",
    description: "Collaborate with friends on photo chains",
    action: "Start Chain",
    route: "/spotlight",
    gradient: "from-pink-500/30 to-rose-500/30"
  },
  {
    id: "challenges",
    icon: Trophy,
    title: "Challenges",
    description: "Compete with friends in photo challenges",
    action: "Join Challenge",
    route: "/challenges",
    gradient: "from-emerald-500/30 to-green-500/30"
  }
];

export default function AppFeaturesGuide() {
  const navigate = useNavigate();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">What You Can Do</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {features.slice(0, 4).map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.id}
              className={`glass-card border-border/30 p-4 cursor-pointer hover:border-primary/40 transition-all duration-300 bg-gradient-to-br ${feature.gradient}`}
              onClick={() => navigate(feature.route)}
            >
              <div className="space-y-2">
                <div className="w-9 h-9 rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Full-width last feature */}
      <Card
        className={`glass-card border-border/30 p-4 cursor-pointer hover:border-primary/40 transition-all duration-300 bg-gradient-to-br ${features[4].gradient}`}
        onClick={() => navigate(features[4].route)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{features[4].title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {features[4].description}
            </p>
          </div>
          <span className="text-xs text-primary font-medium">{features[4].action}</span>
        </div>
      </Card>
    </div>
  );
}
