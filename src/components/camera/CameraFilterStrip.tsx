import { type FilterType } from "@/utils/cameraFilters";
import { X } from "lucide-react";
import goldenHourImg from "@/assets/filters/golden-hour.jpg";
import middaySunImg from "@/assets/filters/midday-sun.jpg";
import nightImg from "@/assets/filters/night.jpg";
import fogMistImg from "@/assets/filters/fog-mist.jpg";
import silhouetteImg from "@/assets/filters/silhouette.jpg";
import urbanImg from "@/assets/filters/urban.jpg";
import waterImg from "@/assets/filters/water.jpg";
import forestImg from "@/assets/filters/forest.jpg";
import beachDesertImg from "@/assets/filters/beach-desert.jpg";
import skyCloudsImg from "@/assets/filters/sky-clouds.jpg";
import rainImg from "@/assets/filters/rain.jpg";
import indoorGoldenImg from "@/assets/filters/indoor-golden.jpg";

interface CameraFilterStripProps {
  selectedFilter: FilterType | null;
  onFilterChange: (filter: FilterType | null) => void;
}

const filters: { id: FilterType; label: string; image: string }[] = [
  { id: "golden-hour", label: "Golden Hour", image: goldenHourImg },
  { id: "midday-sun", label: "Midday Sun", image: middaySunImg },
  { id: "night", label: "Night", image: nightImg },
  { id: "fog-mist", label: "Fog & Mist", image: fogMistImg },
  { id: "silhouette", label: "Silhouette", image: silhouetteImg },
  { id: "urban", label: "Urban", image: urbanImg },
  { id: "water", label: "Water", image: waterImg },
  { id: "forest", label: "Forest", image: forestImg },
  { id: "beach-desert", label: "Beach/Desert", image: beachDesertImg },
  { id: "sky-clouds", label: "Sky & Clouds", image: skyCloudsImg },
  { id: "rain", label: "Rain", image: rainImg },
  { id: "indoor-golden", label: "Indoor Golden", image: indoorGoldenImg },
];

export function CameraFilterStrip({ selectedFilter, onFilterChange }: CameraFilterStripProps) {
  return (
    <div className="flex items-center gap-3 px-4 overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {filters.map((filter) => {
        const isSelected = selectedFilter === filter.id;
        
        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(isSelected ? null : filter.id)}
            className={`
              flex-shrink-0 flex flex-col items-center gap-1.5 transition-all
              ${isSelected ? 'scale-105' : 'scale-100'}
            `}
          >
            <div 
              className={`
                w-14 h-14 rounded-xl backdrop-blur-md border-2 transition-all overflow-hidden
                ${isSelected 
                  ? "border-white shadow-lg shadow-white/30" 
                  : "border-white/30 hover:border-white/50"
                }
              `}
              style={{
                backgroundImage: `url(${filter.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <span className={`
              text-[10px] font-medium whitespace-nowrap
              ${isSelected ? 'text-white' : 'text-white/70'}
            `}>
              {filter.label}
            </span>
          </button>
        );
      })}
      
      {selectedFilter && (
        <button
          onClick={() => onFilterChange(null)}
          className="flex-shrink-0 w-14 h-14 rounded-xl bg-black/40 backdrop-blur-md hover:bg-black/60 border-2 border-white/30 hover:border-white/50 flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
}
