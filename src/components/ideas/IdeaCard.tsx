import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronDown, ChevronUp, Camera } from "lucide-react";
import { 
  PhotographyIdea, 
  getDifficultyColor, 
  getCategoryIcon, 
  getCategoryColor 
} from "@/data/photographyIdeas";

interface IdeaCardProps {
  idea: PhotographyIdea;
  isBookmarked: boolean;
  onBookmark: (ideaId: string) => void;
}

export default function IdeaCard({ idea, isBookmarked, onBookmark }: IdeaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-2xl">{getCategoryIcon(idea.category)}</span>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{idea.title}</h3>
            <p className="text-sm text-muted-foreground capitalize">{idea.category}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onBookmark(idea.id)}
          className={isBookmarked ? "text-primary" : "text-muted-foreground"}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-primary" : ""}`} />
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{idea.description}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge className={getDifficultyColor(idea.difficulty)}>
          {idea.difficulty}
        </Badge>
        <Badge className={getCategoryColor(idea.category)} variant="outline">
          {idea.category}
        </Badge>
        {idea.bestTime && (
          <Badge variant="secondary" className="text-xs">
            🕐 {idea.bestTime}
          </Badge>
        )}
      </div>

      {idea.weatherConditions && idea.weatherConditions.length > 0 && (
        <div className="text-xs text-muted-foreground mb-2">
          <span className="font-medium">Best Weather:</span>{" "}
          {idea.weatherConditions.join(", ")}
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between mt-2"
      >
        <span className="text-sm font-medium">
          {isExpanded ? "Hide" : "Show"} Tips & Details
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t space-y-3">
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              Photography Tips
            </h4>
            <ul className="space-y-1.5">
              {idea.tips.map((tip, index) => (
                <li key={index} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {idea.equipment && idea.equipment.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Recommended Equipment</h4>
              <div className="flex flex-wrap gap-2">
                {idea.equipment.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
