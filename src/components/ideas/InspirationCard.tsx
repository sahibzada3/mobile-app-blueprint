import * as React from "react";
import { motion } from "framer-motion";
import { Quote, Sparkles } from "lucide-react";
import type { InspirationIdea } from "@/data/inspirationIdeas";

interface InspirationCardProps {
  idea: InspirationIdea;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

const moodColors: Record<string, string> = {
  peaceful: "from-cyan-500/20 to-blue-500/20 text-cyan-400",
  nostalgic: "from-amber-500/20 to-orange-500/20 text-amber-400",
  dramatic: "from-purple-500/20 to-pink-500/20 text-purple-400",
  hopeful: "from-emerald-500/20 to-green-500/20 text-emerald-400",
  mysterious: "from-indigo-500/20 to-violet-500/20 text-indigo-400",
  joyful: "from-yellow-500/20 to-orange-500/20 text-yellow-400",
  calm: "from-teal-500/20 to-cyan-500/20 text-teal-400",
  reflective: "from-slate-500/20 to-gray-500/20 text-slate-400",
  dreamy: "from-pink-500/20 to-rose-500/20 text-pink-400",
};

export default function InspirationCard({ idea, index }: InspirationCardProps) {
  const moodStyle = moodColors[idea.mood] || moodColors.peaceful;
  
  return (
    <motion.div 
      className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm"
      variants={cardVariants}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Subtle gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${moodStyle.split(' ')[0]} ${moodStyle.split(' ')[1]} opacity-30`} />
      
      {/* Hover glow effect */}
      <motion.div 
        className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
      />

      <div className="relative z-10 p-5 space-y-4">
        {/* Title with icon */}
        <div className="flex items-start gap-3">
          <motion.div
            className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"
            whileHover={{ rotate: 15, scale: 1.1 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
          <h4 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
            {idea.title}
          </h4>
        </div>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed pl-11">
          {idea.description}
        </p>
        
        {/* Sample Caption */}
        {idea.sampleCaption && (
          <motion.div 
            className="pt-3 border-t border-border/30 ml-11"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-start gap-2.5 bg-muted/30 rounded-lg p-3">
              <Quote className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
              <p className="text-sm italic text-foreground/80 leading-relaxed">
                "{idea.sampleCaption}"
              </p>
            </div>
          </motion.div>
        )}
        
        {/* Mood Tag */}
        <div className="pt-2 pl-11">
          <motion.span 
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r ${moodStyle} capitalize border border-current/20`}
            whileHover={{ scale: 1.05 }}
          >
            {idea.mood}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
}
