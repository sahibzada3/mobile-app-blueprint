import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, Star, Award, Trophy, Crown, Medal, Sparkles } from "lucide-react";

interface BadgeProgressDisplayProps {
  currentPoints: number;
}

const BADGE_TIERS = [
  { name: "Novice Photographer", points: 0, icon: Camera, color: "text-gray-500" },
  { name: "Rising Star", points: 500, icon: Star, color: "text-blue-500" },
  { name: "Skilled Artisan", points: 1500, icon: Award, color: "text-purple-500" },
  { name: "Master Photographer", points: 3000, icon: Trophy, color: "text-orange-500" },
  { name: "Legend", points: 5000, icon: Crown, color: "text-red-500" },
  { name: "Grand Master", points: 10000, icon: Medal, color: "text-yellow-500" },
  { name: "Hall of Fame", points: 25000, icon: Sparkles, color: "text-pink-500" },
];

export default function BadgeProgressDisplay({ currentPoints }: BadgeProgressDisplayProps) {
  // Find current and next badge tier
  let currentTierIndex = 0;
  for (let i = BADGE_TIERS.length - 1; i >= 0; i--) {
    if (currentPoints >= BADGE_TIERS[i].points) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = BADGE_TIERS[currentTierIndex];
  const nextTier = BADGE_TIERS[currentTierIndex + 1];
  const CurrentIcon = currentTier.icon;
  
  // Calculate progress to next tier
  let progress = 100;
  let pointsToNext = 0;
  if (nextTier) {
    const pointsInCurrentTier = currentPoints - currentTier.points;
    const pointsNeededForNext = nextTier.points - currentTier.points;
    progress = (pointsInCurrentTier / pointsNeededForNext) * 100;
    pointsToNext = nextTier.points - currentPoints;
  }

  return (
    <Card className="shadow-elevated">
      <CardContent className="p-6 space-y-6">
        {/* Current Badge */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-3`}>
            <CurrentIcon className={`w-10 h-10 ${currentTier.color}`} />
          </div>
          <h3 className="text-xl font-bold mb-1">{currentTier.name}</h3>
          <p className="text-2xl font-bold text-primary">{currentPoints.toLocaleString()} points</p>
        </div>

        {/* Progress to Next */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Next Badge</span>
              <span className="font-semibold">{nextTier.name}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {pointsToNext.toLocaleString()} points to go
            </p>
          </div>
        )}

        {/* All Badges Grid */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-3 text-center">Badge Progression</h4>
          <div className="grid grid-cols-4 gap-3">
            {BADGE_TIERS.map((tier, index) => {
              const Icon = tier.icon;
              const isUnlocked = currentPoints >= tier.points;
              const isCurrent = index === currentTierIndex;
              
              return (
                <div
                  key={tier.name}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                    isUnlocked
                      ? "bg-primary/10 border border-primary/20"
                      : "bg-muted/50 border border-border opacity-50"
                  } ${isCurrent ? "ring-2 ring-primary" : ""}`}
                >
                  <Icon className={`w-6 h-6 ${isUnlocked ? tier.color : "text-muted-foreground"}`} />
                  <span className="text-[10px] font-medium text-center leading-tight">
                    {tier.name.split(" ")[0]}
                  </span>
                  {isUnlocked && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[8px]">
                      ✓
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Points Guide */}
        <div className="pt-4 border-t border-border">
          <h4 className="text-sm font-semibold mb-2">How to Earn Points</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>🥇 1st Place: Full points (e.g., 100 pts)</p>
            <p>🥈 2nd Place: 60% of points (e.g., 60 pts)</p>
            <p>🥉 3rd Place: 30% of points (e.g., 30 pts)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}