import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy, Star, Crown, Zap, Target, Heart, Clock, Sun, Cloud, Mountain, Palette } from "lucide-react";

interface BadgeDisplayProps {
  badge: {
    id: string;
    name: string;
    description: string;
    icon: string;
    rarity: string;
    category: string | null;
  };
  earnedAt?: string;
  compact?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Trophy,
  Star,
  Crown,
  Zap,
  Target,
  Heart,
  Clock,
  Sun,
  Cloud,
  Mountain,
  Palette,
};

export default function BadgeDisplay({ badge, earnedAt, compact = false }: BadgeDisplayProps) {
  const IconComponent = iconMap[badge.icon] || Award;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "from-gray-400 to-gray-600";
      case "rare":
        return "from-blue-400 to-blue-600";
      case "epic":
        return "from-purple-400 to-purple-600";
      case "legendary":
        return "from-amber-400 to-amber-600";
      default:
        return "from-primary to-secondary";
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "rare":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case "epic":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case "legendary":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border hover:shadow-md transition-all">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center`}>
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{badge.name}</p>
          <Badge className={`${getRarityBadgeColor(badge.rarity)} text-xs`}>
            {badge.rarity}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative">
        <div className={`h-32 bg-gradient-to-br ${getRarityColor(badge.rarity)} flex items-center justify-center`}>
          <IconComponent className="w-16 h-16 text-white drop-shadow-lg" />
        </div>
        <div className="absolute top-2 right-2">
          <Badge className={getRarityBadgeColor(badge.rarity)}>
            {badge.rarity}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{badge.name}</h3>
        <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
        {earnedAt && (
          <p className="text-xs text-muted-foreground">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
}