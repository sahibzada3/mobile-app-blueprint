import { type FilterType } from "@/utils/cameraFilters";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CameraFilterStripProps {
  selectedFilter: FilterType | null;
  onFilterChange: (filter: FilterType | null) => void;
}

const filters: { id: FilterType; label: string }[] = [
  { id: "golden-hour", label: "Golden Hour" },
  { id: "midday-sun", label: "Midday Sun" },
  { id: "night", label: "Night" },
  { id: "fog-mist", label: "Fog & Mist" },
  { id: "silhouette", label: "Silhouette" },
  { id: "urban", label: "Urban" },
  { id: "water", label: "Water" },
  { id: "forest", label: "Forest" },
  { id: "beach-desert", label: "Beach/Desert" },
  { id: "sky-clouds", label: "Sky & Clouds" },
  { id: "rain", label: "Rain" },
  { id: "indoor-golden", label: "Indoor Golden" },
];

export function CameraFilterStrip({ selectedFilter, onFilterChange }: CameraFilterStripProps) {
  return (
    <div className="flex items-center gap-2 px-4 overflow-x-auto scrollbar-hide">
      {filters.map((filter) => {
        const isSelected = selectedFilter === filter.id;
        
        return (
          <Button
            key={filter.id}
            variant="ghost"
            onClick={() => onFilterChange(isSelected ? null : filter.id)}
            className={`
              flex-shrink-0 px-4 py-2 h-9 rounded-full backdrop-blur-md border transition-all whitespace-nowrap
              ${isSelected 
                ? "bg-white text-black border-white shadow-lg" 
                : "bg-black/40 text-white border-white/30 hover:bg-black/60 hover:border-white/50"
              }
            `}
          >
            <span className="text-xs font-medium">
              {filter.label}
            </span>
          </Button>
        );
      })}
      
      {selectedFilter && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFilterChange(null)}
          className="flex-shrink-0 w-9 h-9 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/30 hover:border-white/50"
        >
          <X className="w-4 h-4 text-white" />
        </Button>
      )}
    </div>
  );
}
