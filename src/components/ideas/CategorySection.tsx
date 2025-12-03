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
      {/* Category Header */}
      <Card 
        className={`glass-card border-border/30 overflow-hidden cursor-pointer hover:border-primary/30 transition-all duration-300 bg-gradient-to-r ${category.gradient}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {category.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {category.subtitle}
              </p>
            </div>
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
