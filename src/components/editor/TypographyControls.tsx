import { Type, AlignLeft, AlignCenter, AlignRight, RotateCw, Move, Layers, Sparkles, Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import * as React from "react";
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
  { value: "ps", label: "پښتو", flag: "🇦🇫" },
  { value: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { value: "zh", label: "中文", flag: "🇨🇳" },
  { value: "ja", label: "日本語", flag: "🇯🇵" },
];

const fonts = [
  { value: "Playfair Display", label: "Playfair Display (Elegant)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Amiri", label: "Amiri (Arabic/Urdu/Pashto)", languages: ["ar", "ur", "ps"] },
  { value: "Noto Nastaliq Urdu", label: "Noto Nastaliq (Urdu/Pashto)", languages: ["ur", "ps"] },
  { value: "Noto Sans Devanagari", label: "Noto Devanagari (Hindi)", languages: ["hi"] },
  { value: "Noto Sans SC", label: "Noto Sans (Chinese)", languages: ["zh"] },
  { value: "Noto Sans JP", label: "Noto Sans (Japanese)", languages: ["ja"] },
  { value: "Montserrat", label: "Montserrat (Modern)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Raleway", label: "Raleway (Contemporary)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Lora", label: "Lora (Literary)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Merriweather", label: "Merriweather (Classic)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Dancing Script", label: "Dancing Script (Handwritten)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Pacifico", label: "Pacifico (Playful)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Bebas Neue", label: "Bebas Neue (Bold)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Abril Fatface", label: "Abril Fatface (Display)", languages: ["en", "es", "fr", "de", "it", "pt"] },
  { value: "Inter", label: "Inter (Clean)", languages: ["en", "es", "fr", "de", "it", "pt"] },
];

export default function TypographyControls(props: TypographyControlsProps) {
  const {
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
  } = props;

  const [generatedQuotes, setGeneratedQuotes] = React.useState<string[]>([]);
  const [isGenerating, setIsGenerating] = React.useState(false);

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
      console.log("Calling generate-quote with language:", selectedLanguage);

      const scene = detectScene();

      const { data, error } = await supabase.functions.invoke("generate-quote", {
        body: { scene, language: selectedLanguage },
      });

      console.log("Edge function response:", data, error);

      if (error) throw error;

      if (data?.quotes && Array.isArray(data.quotes)) {
        setGeneratedQuotes(data.quotes);

        const languageFonts: Record<string, string> = {
          ar: "Amiri",
          ur: "Noto Nastaliq Urdu",
          ps: "Noto Nastaliq Urdu",
          hi: "Noto Sans Devanagari",
          zh: "Noto Sans SC",
          ja: "Noto Sans JP",
          en: "Playfair Display",
          es: "Playfair Display",
          fr: "Playfair Display",
          de: "Playfair Display",
          it: "Playfair Display",
          pt: "Playfair Display",
        };

        const recommendedFont = languageFonts[selectedLanguage];
        if (recommendedFont && recommendedFont !== fontFamily) {
          onFontChange(recommendedFont);
          toast.success(`Quotes generated! Font changed to ${recommendedFont}.`);
        } else {
          toast.success("Quotes generated successfully!");
        }
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error: any) {
      console.error("Quote generation error:", error);
      toast.error(
        error?.message ||
          "Failed to generate quotes. Make sure your edge function is deployed and accessible."
      );
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
        {/* Language Selector */}
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

        {/* Textarea + AI Quotes Button */}
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

        {/* Generated Quotes */}
        {generatedQuotes.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              AI Generated Quotes (tap to use)
            </Label>
            <ScrollArea className="h-48 max-h-[200px] rounded-md border p-2">
              <div className="space-y-2 pr-4">
                {generatedQuotes.map((quote, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start text-left h-auto py-3 px-3 hover:bg-primary/5 whitespace-normal"
                    onClick={() => onTextChange(quote)}
                  >
                    <span className="text-sm leading-relaxed break-words">
                      {quote}
                    </span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </TabsContent>

      {/* Style & Advanced sections remain same as your code */}
    </Tabs>
  );
}

