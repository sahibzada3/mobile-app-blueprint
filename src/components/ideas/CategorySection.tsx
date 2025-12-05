import * as React from "react";
import { Leaf, Coffee, Sun, Heart, PenTool, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InspirationCard from "./InspirationCard";
import type { InspirationCategory } from "@/data/inspirationIdeas";

const iconMap: Record<string, React.ElementType> = {
  Leaf,
  Coffee,
  Sun,
  Heart,
  PenTool,
};

interface CategorySectionProps {
  category: InspirationCategory;
  defaultExpanded?: boolean;
}

export default function CategorySection({ category, defaultExpanded = false }: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const Icon = iconMap[category.icon] || Leaf;

  return (
    <div className="space-y-4">
      {/* Category Header with Image */}
      <Card 
        className="glass-card border-border/30 overflow-hidden cursor-pointer hover:border-primary/30 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Category Image */}
        <div className="relative h-32 overflow-hidden">
          <img 
            src={category.image} 
            alt={category.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Icon Badge */}
          <div className="absolute top-3 left-3">
            <div className="w-10 h-10 rounded-xl bg-background/80 backdrop-blur-sm flex items-center justify-center border border-border/30">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
          
          {/* Ideas Count */}
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-background/80 backdrop-blur-sm text-muted-foreground border border-border/30">
              {category.ideas.length} ideas
            </span>
          </div>
        </div>
        
        {/* Category Info */}
        <div className="p-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground">
              {category.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {category.subtitle}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </Button>
        </div>
      </Card>

      {/* Ideas Grid */}
      {isExpanded && (
        <div className="grid grid-cols-1 gap-3 animate-fade-in pl-2">
          {category.ideas.map((idea, index) => (
            <InspirationCard key={idea.id} idea={idea} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
