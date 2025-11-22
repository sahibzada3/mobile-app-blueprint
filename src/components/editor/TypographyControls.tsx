import { Type, AlignLeft, AlignCenter, AlignRight, RotateCw, Move, Layers, Sparkles, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TypographyControlsProps {
  overlayText: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  textOpacity: number;
  textAlign: "left" | "center" | "right";
  textPositionY: number;
  textPositionX: number;
  textRotation: number;
  textSkewX: number;
  textPerspective: number;
  textStrokeWidth: number;
  textStrokeColor: string;
  selectedLanguage: string;
  photoData: string;
  onTextChange: (text: string) => void;
  onFontChange: (font: string) => void;
  onSizeChange: (size: number) => void;
  onColorChange: (color: string) => void;
  onOpacityChange: (opacity: number) => void;
  onAlignChange: (align: "left" | "center" | "right") => void;
  onPositionYChange: (y: number) => void;
  onPositionXChange: (x: number) => void;
  onRotationChange: (rotation: number) => void;
  onSkewXChange: (skew: number) => void;
  onPerspectiveChange: (perspective: number) => void;
  onStrokeWidthChange: (width: number) => void;
  onStrokeColorChange: (color: string) => void;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "de", label: "Deutsch", flag: "🇩🇪" },
  { value: "it", label: "Italiano", flag: "🇮🇹" },
  { value: "pt", label: "Português", flag: "🇵🇹" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
  { value: "ur", label: "اردو", flag: "🇵🇰" },
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
];

const fonts = [
  { value: "Playfair Display", label: "Playfair Display (Elegant)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Merriweather", label: "Merriweather (Classic)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Lora", label: "Lora (Literary)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Montserrat", label: "Montserrat (Modern)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Raleway", label: "Raleway (Contemporary)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Crimson Text", label: "Crimson Text (Traditional)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Amiri", label: "Amiri (Arabic/Urdu)", languages: ["ar", "ur"] },
  { value: "Noto Nastaliq Urdu", label: "Noto Nastaliq (Urdu)", languages: ["ur"] },
  { value: "Noto Sans Devanagari", label: "Noto Devanagari (Hindi)", languages: ["hi"] },
  { value: "Noto Sans SC", label: "Noto Sans (Chinese)", languages: ["zh"] },
  { value: "Noto Sans JP", label: "Noto Sans (Japanese)", languages: ["ja"] },
  { value: "Dancing Script", label: "Dancing Script (Handwritten)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Pacifico", label: "Pacifico (Playful)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Bebas Neue", label: "Bebas Neue (Bold)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Abril Fatface", label: "Abril Fatface (Display)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Inter", label: "Inter (Clean)", languages: ["en", "es", "fr", "de", "it", "pt"] },
];

export default function TypographyControls({
  overlayText,
  fontFamily,
  fontSize,
  textColor,
  textOpacity,
  textAlign,
  textPositionY,
  textPositionX,
  textRotation,
  textSkewX,
  textPerspective,
  textStrokeWidth,
  textStrokeColor,
  selectedLanguage,
  photoData,
  onTextChange,
  onFontChange,
  onSizeChange,
  onColorChange,
  onOpacityChange,
  onAlignChange,
  onPositionYChange,
  onPositionXChange,
  onRotationChange,
  onSkewXChange,
  onPerspectiveChange,
  onStrokeWidthChange,
  onStrokeColorChange,
  onLanguageChange,
}: TypographyControlsProps) {
  const [generatedQuotes, setGeneratedQuotes] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const detectScene = () => {
    const filters = sessionStorage.getItem("photoFilters");
    if (filters) {
      const parsed = JSON.parse(filters);
      return parsed.filter || "golden-hour";
    }
    return "golden-hour";
  };

  const generateQuotes = async () => {
    setIsGenerating(true);
    try {
      const scene = detectScene();
      const { data, error } = await supabase.functions.invoke('generate-quote', {
        body: { scene, language: selectedLanguage }
      });

      if (error) throw error;
      
      if (data?.quotes && Array.isArray(data.quotes)) {
        setGeneratedQuotes(data.quotes);
        
        // Auto-select appropriate font for language
        const languageFonts: Record<string, string> = {
          'ar': 'Amiri',
          'ur': 'Noto Nastaliq Urdu',
          'hi': 'Noto Sans Devanagari',
          'zh': 'Noto Sans SC',
          'ja': 'Noto Sans JP',
          'en': 'Playfair Display',
          'es': 'Playfair Display',
          'fr': 'Playfair Display',
          'de': 'Playfair Display',
          'it': 'Playfair Display',
          'pt': 'Playfair Display',
        };
        
        const recommendedFont = languageFonts[selectedLanguage];
        if (recommendedFont && recommendedFont !== fontFamily) {
          onFontChange(recommendedFont);
          toast.success(`Quotes generated! Font changed to ${recommendedFont} for better ${selectedLanguage} display.`);
        } else {
          toast.success("Quotes generated successfully!");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Quote generation error:", error);
      if (error.message?.includes('429')) {
        toast.error("Rate limit exceeded. Please try again later.");
      } else if (error.message?.includes('402')) {
        toast.error("Credits required. Please add funds to continue.");
      } else {
        toast.error("Failed to generate quotes. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };
  return (
    <Tabs defaultValue="text" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="text">
          <Type className="w-4 h-4 mr-2" />
          Text
        </TabsTrigger>
        <TabsTrigger value="style">
          <Layers className="w-4 h-4 mr-2" />
          Style
        </TabsTrigger>
        <TabsTrigger value="advanced">
          <Move className="w-4 h-4 mr-2" />
          Transform
        </TabsTrigger>
      </TabsList>

      <TabsContent value="text" className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <Globe className="w-4 h-4 text-primary" />
            <Label>Language</Label>
          </div>
          <Select value={selectedLanguage} onValueChange={onLanguageChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Typography Text</Label>
            <Button
              size="sm"
              variant="outline"
              onClick={generateQuotes}
              disabled={isGenerating}
              className="h-8"
            >
              <Sparkles className="w-3 h-3 mr-1.5" />
              {isGenerating ? "Generating..." : "AI Quotes"}
            </Button>
          </div>
          <Textarea
            placeholder="Add poetic text, quotes, or captions..."
            value={overlayText}
            onChange={(e) => onTextChange(e.target.value)}
            rows={3}
            className="resize-none"
          />
        </div>

        {generatedQuotes.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">AI Generated Quotes (tap to use)</Label>
            <ScrollArea className="h-32 rounded-md border p-2">
              <div className="space-y-2">
                {generatedQuotes.map((quote, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-primary/5"
                    onClick={() => onTextChange(quote)}
                  >
                    <span className="text-sm leading-relaxed">{quote}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </TabsContent>

      <TabsContent value="style" className="space-y-4">
        {overlayText && (
          <>
            <div className="space-y-2">
              <Label>Font Style</Label>
              <Select value={fontFamily} onValueChange={onFontChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts
                    .filter(font => 
                      font.languages.includes(selectedLanguage) || 
                      font.languages.includes("en")
                    )
                    .map((font) => (
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
                max={140}
                step={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="textColor">Fill Color</Label>
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
              <Label>Text Outline</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Width</Label>
                    <span className="text-xs text-muted-foreground">{textStrokeWidth}px</span>
                  </div>
                  <Slider
                    value={[textStrokeWidth]}
                    onValueChange={([value]) => onStrokeWidthChange(value)}
                    min={0}
                    max={10}
                    step={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strokeColor" className="text-xs">Color</Label>
                  <Input
                    id="strokeColor"
                    type="color"
                    value={textStrokeColor}
                    onChange={(e) => onStrokeColorChange(e.target.value)}
                    className="h-10"
                  />
                </div>
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
          </>
        )}
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4">
        {overlayText && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Position</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Horizontal</Label>
                    <span className="text-xs text-muted-foreground">{textPositionX}%</span>
                  </div>
                  <Slider
                    value={[textPositionX]}
                    onValueChange={([value]) => onPositionXChange(value)}
                    min={10}
                    max={90}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Vertical</Label>
                    <span className="text-xs text-muted-foreground">{textPositionY}%</span>
                  </div>
                  <Slider
                    value={[textPositionY]}
                    onValueChange={([value]) => onPositionYChange(value)}
                    min={10}
                    max={90}
                    step={5}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-primary" />
                <Label>Rotation</Label>
                <span className="text-sm text-muted-foreground ml-auto">{textRotation}°</span>
              </div>
              <Slider
                value={[textRotation]}
                onValueChange={([value]) => onRotationChange(value)}
                min={-180}
                max={180}
                step={5}
              />
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => onRotationChange(-45)} className="flex-1 text-xs">
                  -45°
                </Button>
                <Button variant="outline" size="sm" onClick={() => onRotationChange(0)} className="flex-1 text-xs">
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => onRotationChange(45)} className="flex-1 text-xs">
                  +45°
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Skew / Perspective</Label>
                <span className="text-xs text-muted-foreground">{textSkewX}°</span>
              </div>
              <Slider
                value={[textSkewX]}
                onValueChange={([value]) => onSkewXChange(value)}
                min={-45}
                max={45}
                step={5}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>3D Depth Effect</Label>
                <span className="text-xs text-muted-foreground">{textPerspective}%</span>
              </div>
              <Slider
                value={[textPerspective]}
                onValueChange={([value]) => onPerspectiveChange(value)}
                min={0}
                max={100}
                step={10}
              />
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                onRotationChange(0);
                onSkewXChange(0);
                onPerspectiveChange(0);
                onPositionXChange(50);
                onPositionYChange(50);
              }}
            >
              Reset All Transforms
            </Button>
          </>
        )}
      </TabsContent>
    </Tabs>
  );
}
