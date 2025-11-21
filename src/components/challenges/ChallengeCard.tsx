import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Trophy, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChallengeCardProps {
  challenge: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    category: string;
    start_date: string;
    end_date: string;
    prize_description: string | null;
    status: string;
    image_url: string | null;
  };
  submissionCount?: number;
}

export default function ChallengeCard({ challenge, submissionCount = 0 }: ChallengeCardProps) {
  const navigate = useNavigate();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      lighting: "Sun",
      composition: "Palette",
      weather: "Cloud",
      technique: "Zap",
      location: "MapPin",
    };
    return icons[category] || "Camera";
  };

  const formatTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} left`;
    return "Ending soon!";
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={() => navigate(`/challenges/${challenge.id}`)}
    >
      {challenge.image_url && (
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-xl font-bold text-white mb-2">{challenge.title}</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline" className="bg-black/50 text-white border-white/20">
                {challenge.category}
              </Badge>
            </div>
          </div>
        </div>
      )}

      <CardHeader className={!challenge.image_url ? "pb-3" : "pb-3 pt-4"}>
        {!challenge.image_url && (
          <>
            <h3 className="text-xl font-bold text-foreground mb-2">{challenge.title}</h3>
            <div className="flex gap-2 flex-wrap">
              <Badge className={getDifficultyColor(challenge.difficulty)}>
                {challenge.difficulty}
              </Badge>
              <Badge variant="outline">{challenge.category}</Badge>
            </div>
          </>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {challenge.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{submissionCount}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTimeRemaining(challenge.end_date)}</span>
            </div>
          </div>
        </div>

        {challenge.prize_description && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
            <Trophy className="w-4 h-4 text-secondary mt-0.5 flex-shrink-0" />
            <span className="text-xs text-muted-foreground">{challenge.prize_description}</span>
          </div>
        )}

        <Button 
          className="w-full shadow-glow group-hover:scale-105 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/challenges/${challenge.id}`);
          }}
        >
          View Challenge
        </Button>
      </CardContent>
    </Card>
  );
}