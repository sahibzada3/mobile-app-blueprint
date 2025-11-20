import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Save, Type } from "lucide-react";
import { toast } from "sonner";

export default function Editor() {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<any>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [overlayText, setOverlayText] = useState("");
  const [fontFamily, setFontFamily] = useState("Playfair Display");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textOpacity, setTextOpacity] = useState(100);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check authentication and get photo data
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);

      const captured = sessionStorage.getItem("capturedPhoto");
      if (!captured) {
        toast.error("No photo to edit");
        navigate("/camera");
        return;
      }
      setPhotoData(captured);
    });
  }, [navigate]);

  useEffect(() => {
    if (photoData && canvasRef.current) {
      drawCanvas();
    }
  }, [photoData, overlayText, fontFamily, fontSize, textColor, textOpacity]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !photoData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (overlayText) {
        ctx.font = `${fontSize}px "${fontFamily}", serif`;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = textOpacity / 100;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Add text shadow for better readability
        ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        const lines = overlayText.split("\n");
        const lineHeight = fontSize * 1.2;
        const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });
      }
    };
    img.src = photoData;
  };

  const savePhoto = async () => {
    if (!canvasRef.current || !user) return;

    setSaving(true);
    try {
      const canvas = canvasRef.current;
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.9);
      });

      if (!blob) throw new Error("Failed to create image");

      const fileName = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, blob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      const filters = JSON.parse(sessionStorage.getItem("photoFilters") || "{}");
      const { error: dbError } = await supabase
        .from("photos")
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption,
          typography_data: overlayText ? {
            text: overlayText,
            font: fontFamily,
            size: fontSize,
            color: textColor,
            opacity: textOpacity,
          } : null,
          filters,
        });

      if (dbError) throw dbError;

      sessionStorage.removeItem("capturedPhoto");
      sessionStorage.removeItem("photoFilters");
      toast.success("Photo saved successfully!");
      navigate("/feed");
    } catch (error: any) {
      toast.error(error.message || "Failed to save photo");
    } finally {
      setSaving(false);
    }
  };

  if (!photoData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-display font-bold text-primary">Edit Photo</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        <Card className="p-4 space-y-4 shadow-nature">
          <div className="space-y-2">
            <Label htmlFor="caption">Caption</Label>
            <Textarea
              id="caption"
              placeholder="Share your thoughts about this moment..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Type className="w-4 h-4 text-primary" />
              <Label>Typography Overlay</Label>
            </div>
            <Textarea
              placeholder="Add poetic text overlay..."
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              rows={2}
            />
          </div>

          {overlayText && (
            <>
              <div className="space-y-2">
                <Label>Font</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
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
                  onValueChange={([value]) => setFontSize(value)}
                  min={24}
                  max={96}
                  step={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <Input
                  id="textColor"
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Opacity</Label>
                  <span className="text-sm text-muted-foreground">{textOpacity}%</span>
                </div>
                <Slider
                  value={[textOpacity]}
                  onValueChange={([value]) => setTextOpacity(value)}
                  min={0}
                  max={100}
                  step={5}
                />
              </div>
            </>
          )}

          <Button onClick={savePhoto} disabled={saving} className="w-full shadow-glow">
            {saving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save & Share
              </>
            )}
          </Button>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
