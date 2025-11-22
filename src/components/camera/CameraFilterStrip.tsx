import { type FilterType } from "@/utils/cameraFilters";
import { X } from "lucide-react";

interface CameraFilterStripProps {
  selectedFilter: FilterType | null;
  onFilterChange: (filter: FilterType | null) => void;
}

const filters: { id: FilterType; label: string; gradient: string; emoji: string }[] = [
  { id: "golden-hour", label: "Golden Hour", gradient: "from-orange-400 to-pink-500", emoji: "🌅" },
  { id: "midday-sun", label: "Midday Sun", gradient: "from-blue-400 to-yellow-300", emoji: "☀️" },
  { id: "night", label: "Night", gradient: "from-indigo-900 to-purple-800", emoji: "🌙" },
  { id: "fog-mist", label: "Fog & Mist", gradient: "from-gray-300 to-gray-400", emoji: "🌫️" },
  { id: "silhouette", label: "Silhouette", gradient: "from-orange-600 to-black", emoji: "🌄" },
  { id: "urban", label: "Urban", gradient: "from-slate-600 to-slate-800", emoji: "🏙️" },
  { id: "water", label: "Water", gradient: "from-blue-400 to-cyan-500", emoji: "🌊" },
  { id: "forest", label: "Forest", gradient: "from-green-600 to-emerald-700", emoji: "🌲" },
  { id: "beach-desert", label: "Beach/Desert", gradient: "from-yellow-400 to-orange-500", emoji: "🏖️" },
  { id: "sky-clouds", label: "Sky & Clouds", gradient: "from-sky-400 to-blue-500", emoji: "☁️" },
  { id: "rain", label: "Rain", gradient: "from-gray-600 to-slate-700", emoji: "🌧️" },
  { id: "indoor-golden", label: "Indoor Golden", gradient: "from-amber-400 to-orange-400", emoji: "💡" },
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
            <div className={`
              w-14 h-14 rounded-xl bg-gradient-to-br ${filter.gradient} 
              flex items-center justify-center text-2xl
              backdrop-blur-md border-2 transition-all
              ${isSelected 
                ? "border-white shadow-lg shadow-white/30" 
                : "border-white/30 hover:border-white/50"
              }
            `}>
              {filter.emoji}
            </div>
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
