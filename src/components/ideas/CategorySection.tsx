import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Coffee, Sun, Heart, PenTool, ChevronDown } from "lucide-react";
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
    <motion.div 
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Category Header with Image */}
      <motion.div 
        className="relative overflow-hidden rounded-2xl border border-border/40 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Category Image */}
        <div className="relative h-36 overflow-hidden">
          <motion.img 
            src={category.image} 
            alt={category.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: isExpanded ? 1.05 : 1 }}
            transition={{ duration: 0.6 }}
          />
          
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10 group-hover:opacity-100 opacity-0 transition-opacity duration-500" />
          
          {/* Icon Badge */}
          <motion.div 
            className="absolute top-3 left-3"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <div className="w-11 h-11 rounded-xl bg-background/90 backdrop-blur-md flex items-center justify-center border border-border/30 shadow-lg">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </motion.div>
          
          {/* Ideas Count */}
          <motion.div 
            className="absolute top-3 right-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-background/90 backdrop-blur-md text-muted-foreground border border-border/30 shadow-sm">
              {category.ideas.length} ideas
            </span>
          </motion.div>
        </div>
        
        {/* Category Info */}
        <div className="p-4 flex items-center justify-between bg-card/50 backdrop-blur-sm">
          <div>
            <h3 className="text-base font-display font-bold tracking-tight text-foreground">
              {category.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {category.subtitle}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
          >
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.div>

      {/* Ideas Grid with Animation */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <motion.div 
              className="grid grid-cols-1 gap-3 pl-2 pt-1"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 }
                }
              }}
            >
              {category.ideas.map((idea, index) => (
                <InspirationCard key={idea.id} idea={idea} index={index} />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
