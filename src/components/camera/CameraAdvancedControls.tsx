import { type AdvancedSettings } from "@/types/camera";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface CameraAdvancedControlsProps {
  settings: AdvancedSettings;
  onChange: (settings: AdvancedSettings) => void;
}

const controls: { 
  key: keyof AdvancedSettings; 
  label: string; 
  min: number; 
  max: number; 
  step: number;
  recommended: number;
}[] = [
  { key: "brightness", label: "Brightness", min: 50, max: 150, step: 1, recommended: 100 },
  { key: "contrast", label: "Contrast", min: 50, max: 150, step: 1, recommended: 100 },
  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, recommended: 100 },
  { key: "shadows", label: "Shadows", min: -50, max: 50, step: 1, recommended: 0 },
  { key: "highlights", label: "Highlights", min: -50, max: 50, step: 1, recommended: 0 },
  { key: "tint", label: "Tint", min: -50, max: 50, step: 1, recommended: 0 },
  { key: "temperature", label: "Temperature", min: -50, max: 50, step: 1, recommended: 0 },
  { key: "clarity", label: "Clarity", min: -50, max: 50, step: 1, recommended: 10 },
  { key: "dehaze", label: "Dehaze", min: -50, max: 50, step: 1, recommended: 0 },
  { key: "vignette", label: "Vignette", min: 0, max: 100, step: 1, recommended: 10 },
  { key: "noiseReduction", label: "Noise Reduction", min: 0, max: 100, step: 1, recommended: 15 },
  { key: "greenBoost", label: "Green Boost", min: 0, max: 100, step: 1, recommended: 0 },
  { key: "texture", label: "Texture", min: -50, max: 50, step: 1, recommended: 5 },
];

export function CameraAdvancedControls({ settings, onChange }: CameraAdvancedControlsProps) {
  const handleReset = () => {
    onChange({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      shadows: 0,
      highlights: 0,
      tint: 0,
      temperature: 0,
      clarity: 0,
      dehaze: 0,
      vignette: 0,
      noiseReduction: 0,
      greenBoost: 0,
      texture: 0,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset All
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="space-y-6 pr-4">
          {controls.map((control) => {
            const recommendedPercent = ((control.recommended - control.min) / (control.max - control.min)) * 100;
            
            return (
              <div key={control.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{control.label}</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      Rec: {control.recommended}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">
                      {settings[control.key]}
                    </span>
                  </div>
                </div>
                <div className="relative pt-1">
                  {/* Recommended level marker */}
                  <div 
                    className="absolute top-0 h-6 w-0.5 bg-blue-500 z-10 pointer-events-none"
                    style={{ left: `${recommendedPercent}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500" />
                  </div>
                  <Slider
                    value={[settings[control.key]]}
                    onValueChange={([value]) => onChange({ ...settings, [control.key]: value })}
                    min={control.min}
                    max={control.max}
                    step={control.step}
                    className="w-full"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
