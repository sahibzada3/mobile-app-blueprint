import { type FilterType } from "@/utils/cameraFilters";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CameraFilterStripProps {
  selectedFilter: FilterType | null;
  onFilterChange: (filter: FilterType | null) => void;
}

const filters: { id: FilterType; label: string; emoji: string }[] = [
  { id: "golden-hour-glow", label: "Golden Hour", emoji: "🌅" },
  { id: "moody-forest", label: "Moody Forest", emoji: "🌲" },
  { id: "cloud-pop", label: "Cloud Pop", emoji: "☁️" },
  { id: "silhouette-glow", label: "Silhouette", emoji: "🌄" },
  { id: "cinematic-teal-orange", label: "Cinematic", emoji: "🎬" },
  { id: "soft-dreamy", label: "Soft Dreamy", emoji: "✨" },
  { id: "night-clarity", label: "Night", emoji: "🌙" },
  { id: "nature-boost", label: "Nature Boost", emoji: "🍃" },
];

export function CameraFilterStrip({ selectedFilter, onFilterChange }: CameraFilterStripProps) {
  return (
    <div className="w-full bg-gradient-to-t from-black/80 to-transparent py-4 px-4">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {selectedFilter && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFilterChange(null)}
            className="flex-shrink-0 w-16 h-16 rounded-2xl bg-black/60 backdrop-blur-sm hover:bg-black/80 border border-white/20"
          >
            <X className="w-5 h-5 text-white" />
          </Button>
        )}
        
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant="ghost"
              onClick={() => onFilterChange(filter.id)}
              className={`
                flex-shrink-0 w-16 h-16 rounded-2xl backdrop-blur-sm border transition-all flex flex-col items-center justify-center gap-1
                ${isSelected 
                  ? "bg-primary border-primary shadow-lg ring-2 ring-white/50" 
                  : "bg-black/40 border-white/20 hover:bg-black/60"
                }
              `}
            >
              <span className="text-xl">{filter.emoji}</span>
              <span className="text-[9px] font-medium text-white leading-tight text-center">
                {filter.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
