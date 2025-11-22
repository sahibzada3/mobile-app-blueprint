import { type AdvancedSettings } from "@/types/camera";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface CameraAdvancedControlsProps {
  settings: AdvancedSettings;
  onChange: (settings: AdvancedSettings) => void;
}

const controls: { key: keyof AdvancedSettings; label: string; min: number; max: number; step: number }[] = [
  { key: "brightness", label: "Brightness", min: 50, max: 150, step: 1 },
  { key: "contrast", label: "Contrast", min: 50, max: 150, step: 1 },
  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1 },
  { key: "shadows", label: "Shadows", min: -50, max: 50, step: 1 },
  { key: "highlights", label: "Highlights", min: -50, max: 50, step: 1 },
  { key: "tint", label: "Tint", min: -50, max: 50, step: 1 },
  { key: "temperature", label: "Temperature", min: -50, max: 50, step: 1 },
  { key: "clarity", label: "Clarity", min: -50, max: 50, step: 1 },
  { key: "dehaze", label: "Dehaze", min: -50, max: 50, step: 1 },
  { key: "vignette", label: "Vignette", min: 0, max: 100, step: 1 },
  { key: "noiseReduction", label: "Noise Reduction", min: 0, max: 100, step: 1 },
  { key: "greenBoost", label: "Green Boost", min: 0, max: 100, step: 1 },
  { key: "texture", label: "Texture", min: -50, max: 50, step: 1 },
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
          {controls.map((control) => (
            <div key={control.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">{control.label}</label>
                <span className="text-sm text-muted-foreground">
                  {settings[control.key]}
                </span>
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
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
