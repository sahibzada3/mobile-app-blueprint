import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { type FilterType } from "@/utils/cameraFilters";

interface SceneSuggestionBubbleProps {
  suggestion: {
    scene: string;
    filter: FilterType;
    confidence: string;
  } | null;
  onApply: (filter: FilterType) => void;
}

const getSuggestionText = (scene: string, filter: string): string => {
  const filterLabels: Record<string, string> = {
    "cloud-pop": "Cloud Pop",
    "golden-hour-glow": "Golden Hour",
    "moody-forest": "Moody Forest",
    "nature-boost": "Nature Boost",
    "silhouette-glow": "Silhouette",
    "cinematic-teal-orange": "Cinematic",
    "soft-dreamy": "Soft Dreamy",
    "night-clarity": "Night Clarity"
  };

  const messages: Record<string, string> = {
    "Sky/Clouds": `Suggested: ${filterLabels[filter]}`,
    "Sun Rays": `Beam Enhancer: Detected Sun Rays`,
    "Silhouette": `Try Silhouette Mode`,
    "Foliage/Trees": `Nature Boost Available`,
    "Wildlife": `Suggested: ${filterLabels[filter]}`,
    "Golden Hour": `Golden Hour Recommended`,
    "Low Light": `Night Clarity Available`
  };

  return messages[scene] || `Try ${filterLabels[filter]}`;
};

export function SceneSuggestionBubble({ suggestion, onApply }: SceneSuggestionBubbleProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (suggestion) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [suggestion]);

  if (!suggestion) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-20"
        >
          <Button
            onClick={() => {
              onApply(suggestion.filter);
              setVisible(false);
            }}
            className="bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary hover:to-primary/90 backdrop-blur-lg border border-white/20 shadow-xl px-4 py-2 rounded-full transition-all"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium text-white">
              {getSuggestionText(suggestion.scene, suggestion.filter)}
            </span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
