import * as React from "react";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";
import type { InspirationIdea } from "@/data/inspirationIdeas";

interface InspirationCardProps {
  idea: InspirationIdea;
  index: number;
}

export default function InspirationCard({ idea, index }: InspirationCardProps) {
  return (
    <Card 
      className="group glass-card border-border/30 overflow-hidden hover:border-primary/30 transition-all duration-500"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5 space-y-4">
        {/* Title */}
        <h4 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
          {idea.title}
        </h4>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {idea.description}
        </p>
        
        {/* Sample Caption */}
        {idea.sampleCaption && (
          <div className="pt-3 border-t border-border/30">
            <div className="flex items-start gap-2">
              <Quote className="w-3.5 h-3.5 text-primary/60 mt-1 flex-shrink-0" />
              <p className="text-sm italic text-foreground/80 leading-relaxed">
                "{idea.sampleCaption}"
              </p>
            </div>
          </div>
        )}
        
        {/* Mood Tag */}
        <div className="pt-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary/80 capitalize">
            {idea.mood}
          </span>
        </div>
      </div>
    </Card>
  );
}
