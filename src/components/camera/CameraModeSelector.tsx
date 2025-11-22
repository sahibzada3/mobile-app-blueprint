import { type CameraMode } from "@/types/camera";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  Wand2, 
  Cloud, 
  Sun, 
  UserCircle, 
  Sunrise, 
  Squirrel, 
  Trees, 
  Film 
} from "lucide-react";

interface CameraModeSelectorProps {
  selectedMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
}

const modes: { id: CameraMode; label: string; icon: React.ComponentType<any> }[] = [
  { id: "auto", label: "Auto", icon: Wand2 },
  { id: "sky", label: "Sky", icon: Cloud },
  { id: "sun-ray", label: "Sun Ray", icon: Sun },
  { id: "silhouette", label: "Silhouette", icon: UserCircle },
  { id: "golden-hour", label: "Golden Hour", icon: Sunrise },
  { id: "animal", label: "Animal", icon: Squirrel },
  { id: "nature", label: "Nature", icon: Trees },
  { id: "cinematic", label: "Cinematic", icon: Film },
];

export function CameraModeSelector({ selectedMode, onModeChange }: CameraModeSelectorProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 px-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              variant="ghost"
              size="sm"
              onClick={() => onModeChange(mode.id)}
              className={`
                flex-shrink-0 gap-2 backdrop-blur-sm border transition-all
                ${isSelected 
                  ? "bg-primary text-white border-primary shadow-lg" 
                  : "bg-black/40 text-white border-white/20 hover:bg-black/60"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs font-medium">{mode.label}</span>
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
