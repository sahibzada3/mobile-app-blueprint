import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Camera, 
  Sun, 
  Cloud, 
  Clock, 
  ChevronDown,
  ChevronUp,
  Aperture,
  Timer,
  Gauge
} from "lucide-react";
import { FilterGuide } from "@/data/filterGuides";
import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterGuideCardProps {
  guide: FilterGuide;
}

export default function FilterGuideCard({ guide }: FilterGuideCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "intermediate":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20";
      case "advanced":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      default:
        return "";
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-elevated transition-all">
      {/* Header Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={guide.imageUrl} 
          alt={guide.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <Badge className={`${getDifficultyColor(guide.difficulty)} mb-2 text-xs`}>
            {guide.difficulty}
          </Badge>
          <h3 className="text-xl font-bold text-white mb-1">{guide.name}</h3>
          <p className="text-sm text-white/90">{guide.subtitle}</p>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {guide.description}
        </p>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span>{guide.bestTime}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Cloud className="w-3.5 h-3.5 text-primary" />
            <span>{guide.weatherConditions[0]}</span>
          </div>
        </div>

        {/* Camera Settings Quick View */}
        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold">Quick Settings</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Gauge className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">ISO {guide.cameraSettings.iso}</span>
            </div>
            <div className="flex items-center gap-1">
              <Aperture className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{guide.cameraSettings.aperture}</span>
            </div>
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">{guide.cameraSettings.shutterSpeed}</span>
            </div>
          </div>
        </div>

        {/* Mentor Tips Preview */}
        <div className="space-y-1">
          <p className="text-xs font-semibold flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-secondary" />
            Mentor Tips
          </p>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{guide.mentorTips[0]}"
          </p>
        </div>

        {/* Expand Button */}
        <Button 
          variant="outline" 
          className="w-full text-xs h-8"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 mr-1.5" />
              Read Full Guide
            </>
          )}
        </Button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4 overflow-hidden"
            >
              {/* All Mentor Tips */}
              <div className="space-y-2 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold">Mentor's Wisdom</h4>
                <div className="space-y-2">
                  {guide.mentorTips.map((tip, index) => (
                    <div key={index} className="flex gap-2 text-xs">
                      <span className="text-primary font-bold">•</span>
                      <p className="text-muted-foreground italic flex-1">"{tip}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step by Step Guide */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold">Step-by-Step Guide</h4>
                {guide.stepByStep.map((step) => (
                  <div key={step.step} className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Badge variant="secondary" className="text-xs">
                        Step {step.step}
                      </Badge>
                      <h5 className="text-xs font-semibold flex-1">{step.title}</h5>
                    </div>
                    <p className="text-xs text-muted-foreground">{step.instruction}</p>
                    <div className="bg-primary/5 rounded p-2 border-l-2 border-primary">
                      <p className="text-xs italic text-foreground">
                        💡 <span className="font-medium">Mentor says:</span> {step.mentorAdvice}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Common Mistakes */}
              <div className="space-y-2 bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">Common Mistakes to Avoid</h4>
                <ul className="space-y-1">
                  {guide.commonMistakes.map((mistake, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-red-500">✗</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Techniques */}
              <div className="space-y-2 bg-secondary/5 rounded-lg p-3 border border-secondary/10">
                <h4 className="text-sm font-semibold text-secondary">Pro Techniques</h4>
                <ul className="space-y-1">
                  {guide.proTechniques.map((technique, index) => (
                    <li key={index} className="text-xs text-muted-foreground flex gap-2">
                      <span className="text-secondary">★</span>
                      <span>{technique}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
