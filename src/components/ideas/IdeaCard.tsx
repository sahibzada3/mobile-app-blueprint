import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronDown, ChevronUp, Camera, Clock, Cloud, Zap, MapPin, Palette, Sun, CheckCircle2, Play } from "lucide-react";
import { 
  PhotographyIdea, 
  getDifficultyColor, 
  getCategoryIcon, 
  getCategoryColor 
} from "@/data/photographyIdeas";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  MapPin,
  Cloud,
  Palette,
  Sun,
  Camera,
};

interface IdeaCardProps {
  idea: PhotographyIdea;
  isBookmarked: boolean;
  onBookmark: (ideaId: string) => void;
}

export default function IdeaCard({ idea, isBookmarked, onBookmark }: IdeaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const CategoryIcon = iconMap[getCategoryIcon(idea.category)] || Camera;

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
              <CategoryIcon className="w-3.5 h-3.5 mr-1.5" />
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
            {idea.videoUrl ? <Play className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            {isExpanded ? "Hide Details" : idea.videoUrl ? "Watch Tutorial & View Tips" : "View Tips & Techniques"}
          </span>
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* Video Tutorial */}
            {idea.videoUrl && (
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg p-4 border border-primary/10">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                  <Play className="w-4 h-4" />
                  Video Tutorial
                </h4>
                <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    src={idea.videoUrl}
                    title={`${idea.title} Tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Step-by-Step Tutorial */}
            {idea.tutorial && idea.tutorial.length > 0 && (
              <div className="bg-gradient-to-br from-secondary/5 to-accent/5 rounded-lg p-4 border border-secondary/10">
                <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-primary">
                  <Camera className="w-4 h-4" />
                  Step-by-Step Guide
                </h4>
                <div className="space-y-3">
                  {idea.tutorial.map((tutorialStep) => (
                    <div key={tutorialStep.step} className="flex gap-3 group">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                        <span className="text-xs font-bold text-primary">{tutorialStep.step}</span>
                      </div>
                      <div className="flex-1 pt-0.5">
                        <h5 className="text-sm font-semibold text-foreground mb-1">{tutorialStep.title}</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">{tutorialStep.instruction}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tips */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                <CheckCircle2 className="w-4 h-4" />
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
                      <Camera className="w-3 h-3 mr-1" />
                      {item}
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
                      <Cloud className="w-3 h-3 mr-1" />
                      {condition}
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
