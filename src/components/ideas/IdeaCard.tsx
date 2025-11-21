import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronDown, ChevronUp, Camera, Clock, Cloud } from "lucide-react";
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
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Hero Image */}
      {idea.imageUrl && (
        <div className="relative h-56 overflow-hidden">
          <img 
            src={idea.imageUrl} 
            alt={idea.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Floating badges on image */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={getDifficultyColor(idea.difficulty)}>
              {idea.difficulty}
            </Badge>
            <Badge className={getCategoryColor(idea.category)} variant="outline">
              <span className="mr-1">{getCategoryIcon(idea.category)}</span>
              {idea.category}
            </Badge>
          </div>

          {/* Bookmark button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onBookmark(idea.id)}
            className={`absolute top-3 right-3 ${
              isBookmarked 
                ? "bg-primary/90 text-primary-foreground hover:bg-primary" 
                : "bg-black/50 text-white hover:bg-black/70"
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
          </Button>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-xl font-bold text-white mb-1">{idea.title}</h3>
            <div className="flex items-center gap-3 text-xs text-white/90">
              {idea.bestTime && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{idea.bestTime}</span>
                </div>
              )}
              {idea.weatherConditions && (
                <div className="flex items-center gap-1">
                  <Cloud className="w-3 h-3" />
                  <span>{idea.weatherConditions.slice(0, 2).join(", ")}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          {idea.description}
        </p>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between"
        >
          <span className="text-sm font-medium flex items-center gap-2">
            <Camera className="w-4 h-4" />
            {isExpanded ? "Hide Details" : "View Tips & Techniques"}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Tips */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                <Camera className="w-4 h-4" />
                Pro Tips
              </h4>
              <ul className="space-y-2">
                {idea.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex gap-2 items-start">
                    <span className="text-primary font-bold mt-0.5 text-base">•</span>
                    <span className="flex-1">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipment */}
            {idea.equipment && idea.equipment.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recommended Gear</h4>
                <div className="flex flex-wrap gap-2">
                  {idea.equipment.map((item, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      📷 {item}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Weather conditions */}
            {idea.weatherConditions && idea.weatherConditions.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Best Weather</h4>
                <div className="flex flex-wrap gap-2">
                  {idea.weatherConditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      ☁️ {condition}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
