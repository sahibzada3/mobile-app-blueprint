import { type FilterType } from "@/utils/cameraFilters";
import { X } from "lucide-react";
import solflareImg from "@/assets/filters/solflare.jpg";
import emberkissImg from "@/assets/filters/emberkiss.jpg";
import cloudmatteImg from "@/assets/filters/cloudmatte.jpg";
import mosstoneImg from "@/assets/filters/mosstone.jpg";
import breezeblueImg from "@/assets/filters/breezeblue.jpg";
import retroforgeImg from "@/assets/filters/retroforge.jpg";
import oldfilm98Img from "@/assets/filters/oldfilm98.jpg";
import neonpulseImg from "@/assets/filters/neonpulse.jpg";
import rainglowImg from "@/assets/filters/rainglow.jpg";
import midnightglassImg from "@/assets/filters/midnightglass.jpg";
import dreammistImg from "@/assets/filters/dreammist.jpg";
import blushbloomImg from "@/assets/filters/blushbloom.jpg";
import cinetealImg from "@/assets/filters/cineteal.jpg";
import noiredgeImg from "@/assets/filters/noiredge.jpg";
import prismdriftImg from "@/assets/filters/prismdrift.jpg";

interface CameraFilterStripProps {
  selectedFilter: FilterType | null;
  onFilterChange: (filter: FilterType | null) => void;
}

const filters: { id: FilterType; label: string; image: string }[] = [
  { id: "solflare", label: "Solflare", image: solflareImg },
  { id: "emberkiss", label: "Emberkiss", image: emberkissImg },
  { id: "cloudmatte", label: "CloudMatte", image: cloudmatteImg },
  { id: "mosstone", label: "MossTone", image: mosstoneImg },
  { id: "breezeblue", label: "BreezeBlue", image: breezeblueImg },
  { id: "retroforge", label: "RetroForge", image: retroforgeImg },
  { id: "oldfilm98", label: "OldFilm98", image: oldfilm98Img },
  { id: "neonpulse", label: "NeonPulse", image: neonpulseImg },
  { id: "rainglow", label: "RainGlow", image: rainglowImg },
  { id: "midnightglass", label: "MidnightGlass", image: midnightglassImg },
  { id: "dreammist", label: "DreamMist", image: dreammistImg },
  { id: "blushbloom", label: "BlushBloom", image: blushbloomImg },
  { id: "cineteal", label: "CineTeal", image: cinetealImg },
  { id: "noiredge", label: "NoirEdge", image: noiredgeImg },
  { id: "prismdrift", label: "PrismDrift", image: prismdriftImg },
];

export function CameraFilterStrip({ selectedFilter, onFilterChange }: CameraFilterStripProps) {
  return (
    <div className="flex items-center gap-2 px-4 overflow-x-auto overflow-y-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
              flex-shrink-0 flex flex-col items-center gap-1 transition-all
              ${isSelected ? 'scale-105' : 'scale-100'}
            `}
          >
            <div 
              className={`
                w-12 h-12 rounded-lg backdrop-blur-md border-2 transition-all overflow-hidden
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
              text-[9px] font-medium whitespace-nowrap
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
          className="flex-shrink-0 w-12 h-12 rounded-lg bg-black/40 backdrop-blur-md hover:bg-black/60 border-2 border-white/30 hover:border-white/50 flex items-center justify-center transition-all"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}
    </div>
  );
}
