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
  description: string;
}[] = [
  { key: "brightness", label: "Brightness", min: 50, max: 150, step: 1, recommended: 100, description: "Controls overall light/dark balance" },
  { key: "contrast", label: "Contrast", min: 50, max: 150, step: 1, recommended: 100, description: "Adds drama by making darks darker and lights brighter" },
  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, recommended: 100, description: "Enhances color intensity naturally" },
  { key: "shadows", label: "Shadows", min: -50, max: 50, step: 1, recommended: 0, description: "Recovers or deepens shadow details" },
  { key: "highlights", label: "Highlights", min: -50, max: 50, step: 1, recommended: 0, description: "Controls bright areas for mood" },
  { key: "temperature", label: "Temperature", min: -50, max: 50, step: 1, recommended: 0, description: "Adjusts warm/cool tones to match scene" },
  { key: "dehaze", label: "Dehaze", min: -50, max: 50, step: 1, recommended: 0, description: "Removes fog/mist or adds atmosphere" },
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
        <div className="space-y-4 pr-4">
          {controls.map((control) => {
            const recommendedPercent = ((control.recommended - control.min) / (control.max - control.min)) * 100;
            
            return (
              <div key={control.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-white">{control.label}</label>
                  <span className="text-sm text-white font-medium">
                    {settings[control.key]}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">{control.description}</p>
                <div className="relative pt-2">
                  {/* Recommended level marker */}
                  <div 
                    className="absolute top-0 h-5 w-0.5 bg-blue-400 z-10 pointer-events-none"
                    style={{ left: `${recommendedPercent}%`, transform: 'translateX(-50%)' }}
                  >
                    <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400" />
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
