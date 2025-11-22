import { type FilterType } from "@/utils/cameraFilters";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CameraFilterStripProps {
  selectedFilter: FilterType | null;
  onFilterChange: (filter: FilterType | null) => void;
}

const filters: { id: FilterType; label: string }[] = [
  { id: "cloud-pop", label: "Cloud Pop" },
  { id: "golden-hour-glow", label: "Golden Glow" },
  { id: "moody-forest", label: "Moody Forest" },
  { id: "nature-boost", label: "Nature Boost" },
  { id: "cinematic-teal-orange", label: "Cinematic" },
  { id: "soft-dreamy", label: "Dreamy" },
  { id: "night-clarity", label: "Night" },
  { id: "beam-enhancer", label: "Beam" },
  { id: "warm-silhouette", label: "Silhouette" },
  { id: "deep-shadows", label: "Deep Shadow" },
  { id: "water-blue-boost", label: "Water Blue" },
  { id: "hdr-sky-booster", label: "HDR Sky" },
];

export function CameraFilterStrip({ selectedFilter, onFilterChange }: CameraFilterStripProps) {
  return (
    <div className="flex flex-col gap-2">
      {selectedFilter && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onFilterChange(null)}
          className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 border border-white/20"
        >
          <X className="w-5 h-5 text-white" />
        </Button>
      )}
      
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto py-2">
        {filters.map((filter) => {
          const isSelected = selectedFilter === filter.id;
          
          return (
            <Button
              key={filter.id}
              variant="ghost"
              onClick={() => onFilterChange(filter.id)}
              className={`
                w-12 h-12 p-0 rounded-full backdrop-blur-sm border transition-all
                ${isSelected 
                  ? "bg-primary border-primary shadow-lg ring-2 ring-white/50" 
                  : "bg-black/40 border-white/20 hover:bg-black/60"
                }
              `}
            >
              <span className="text-[10px] font-bold text-white leading-tight text-center px-1">
                {filter.label.split(" ")[0]}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
