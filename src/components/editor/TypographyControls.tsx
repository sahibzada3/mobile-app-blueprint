import { Type, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TypographyControlsProps {
  overlayText: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  textOpacity: number;
  textAlign: "left" | "center" | "right";
  textPositionY: number;
  onTextChange: (text: string) => void;
  onFontChange: (font: string) => void;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onAlignChange: (align: "left" | "center" | "right") => void;
  onPositionYChange: (y: number) => void;
}

const fonts = [
  { value: "Playfair Display", label: "Playfair Display (Elegant)" },
  { value: "Merriweather", label: "Merriweather (Classic)" },
  { value: "Lora", label: "Lora (Literary)" },
  { value: "Montserrat", label: "Montserrat (Modern)" },
  { value: "Raleway", label: "Raleway (Contemporary)" },
  { value: "Crimson Text", label: "Crimson Text (Traditional)" },
  { value: "Dancing Script", label: "Dancing Script (Handwritten)" },
  { value: "Pacifico", label: "Pacifico (Playful)" },
  { value: "Bebas Neue", label: "Bebas Neue (Bold)" },
  { value: "Abril Fatface", label: "Abril Fatface (Display)" },
  { value: "Inter", label: "Inter (Clean)" },
];

export default function TypographyControls({
  overlayText,
  fontFamily,
  fontSize,
  textColor,
  textOpacity,
  textAlign,
  textPositionY,
  onTextChange,
  onFontChange,
  onSizeChange,
  onColorChange,
  onOpacityChange,
  onAlignChange,
  onPositionYChange,
}: TypographyControlsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Type className="w-4 h-4 text-primary" />
        <Label>Typography Overlay</Label>
      </div>

      <Textarea
        placeholder="Add poetic text, quotes, or captions..."
        value={overlayText}
        onChange={(e) => onTextChange(e.target.value)}
        rows={3}
      />

      {overlayText && (
        <>
          <div className="space-y-2">
            <Label>Font Style</Label>
            <Select value={fontFamily} onValueChange={onFontChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <span className="text-sm text-muted-foreground">{fontSize}px</span>
            </div>
            <Slider
              value={[fontSize]}
              onValueChange={([value]) => onSizeChange(value)}
              min={20}
              max={120}
              step={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="textColor">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="h-10 w-20"
                />
                <Input
                  type="text"
                  value={textColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="h-10 flex-1 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Opacity</Label>
                <span className="text-sm text-muted-foreground">{textOpacity}%</span>
              </div>
              <Slider
                value={[textOpacity]}
                onValueChange={([value]) => onOpacityChange(value)}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Text Alignment</Label>
            <div className="flex gap-2">
              <Button
                variant={textAlign === "left" ? "default" : "outline"}
                size="sm"
                onClick={() => onAlignChange("left")}
                className="flex-1"
              >
                <AlignLeft className="w-4 h-4" />
              </Button>
              <Button
                variant={textAlign === "center" ? "default" : "outline"}
                size="sm"
                onClick={() => onAlignChange("center")}
                className="flex-1"
              >
                <AlignCenter className="w-4 h-4" />
              </Button>
              <Button
                variant={textAlign === "right" ? "default" : "outline"}
                size="sm"
                onClick={() => onAlignChange("right")}
                className="flex-1"
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Vertical Position</Label>
              <span className="text-sm text-muted-foreground">
                {textPositionY === 20 ? "Top" : textPositionY === 50 ? "Center" : textPositionY === 80 ? "Bottom" : `${textPositionY}%`}
              </span>
            </div>
            <Slider
              value={[textPositionY]}
              onValueChange={([value]) => onPositionYChange(value)}
              min={10}
              max={90}
              step={5}
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onPositionYChange(20)} className="flex-1">
                Top
              </Button>
              <Button variant="outline" size="sm" onClick={() => onPositionYChange(50)} className="flex-1">
                Center
              </Button>
              <Button variant="outline" size="sm" onClick={() => onPositionYChange(80)} className="flex-1">
                Bottom
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
