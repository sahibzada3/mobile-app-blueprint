import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import TypographyControls from "@/components/editor/TypographyControls";
import MusicSelector from "@/components/editor/MusicSelector";

export default function Editor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const chainId = searchParams.get("chainId");
  const challengeId = location.state?.challengeId;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [user, setUser] = useState<any>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  
  // Typography states
  const [overlayText, setOverlayText] = useState("");
  const [fontFamily, setFontFamily] = useState("Playfair Display");
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [textOpacity, setTextOpacity] = useState(100);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [textPositionY, setTextPositionY] = useState(50);
  
  // Music state
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
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
  }, [photoData, overlayText, fontFamily, fontSize, textColor, textOpacity, textAlign, textPositionY]);

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
        ctx.textAlign = textAlign;
        ctx.textBaseline = "middle";
        
        // Add text shadow for better readability
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        const lines = overlayText.split("\n");
        const lineHeight = fontSize * 1.3;
        const yPosition = (canvas.height * textPositionY) / 100;
        const startY = yPosition - ((lines.length - 1) * lineHeight) / 2;

        let xPosition: number;
        if (textAlign === "left") {
          xPosition = canvas.width * 0.1;
        } else if (textAlign === "right") {
          xPosition = canvas.width * 0.9;
        } else {
          xPosition = canvas.width / 2;
        }

        lines.forEach((line, index) => {
          ctx.fillText(line, xPosition, startY + index * lineHeight);
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
        canvas.toBlob(resolve, "image/jpeg", 0.95);
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
      
      const { data: photoData, error: dbError } = await supabase
        .from("photos")
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption,
          music_track: selectedMusic,
          typography_data: overlayText ? {
            text: overlayText,
            font: fontFamily,
            size: fontSize,
            color: textColor,
            opacity: textOpacity,
            align: textAlign,
            positionY: textPositionY,
          } : null,
          filters,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // If this is for a chain, add contribution
      if (chainId && photoData) {
        const { error: chainError } = await supabase
          .from("chain_contributions")
          .insert({
            chain_id: chainId,
            user_id: user.id,
            photo_id: photoData.id,
          });

        if (chainError) throw chainError;
      }

      // If this is for a challenge, create submission
      if (challengeId && photoData) {
        const { error: submissionError } = await supabase
          .from("challenge_submissions")
          .insert({
            challenge_id: challengeId,
            user_id: user.id,
            photo_id: photoData.id,
          });

        if (submissionError) throw submissionError;
      }

      sessionStorage.removeItem("capturedPhoto");
      sessionStorage.removeItem("photoFilters");
      
      toast.success(challengeId ? "Challenge entry submitted!" : "Photo saved successfully!");
      
      if (chainId) {
        navigate(`/spotlight/${chainId}`);
      } else if (challengeId) {
        navigate(`/challenges/${challengeId}`);
      } else {
        navigate("/feed");
      }
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
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border/30 z-40">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-xl font-bold text-foreground">Edit Photo</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <div className="relative aspect-square bg-black rounded-2xl overflow-hidden shadow-card">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
        </div>

        <Card className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">
                <ImageIcon className="w-4 h-4 mr-2" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="music">Music</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="caption" className="text-sm font-semibold">Caption</Label>
                <Textarea
                  id="caption"
                  placeholder="Share your thoughts about this moment..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <TypographyControls
                overlayText={overlayText}
                fontFamily={fontFamily}
                fontSize={fontSize}
                textColor={textColor}
                textOpacity={textOpacity}
                textAlign={textAlign}
                textPositionY={textPositionY}
                onTextChange={setOverlayText}
                onFontChange={setFontFamily}
                onSizeChange={setFontSize}
                onColorChange={setTextColor}
                onOpacityChange={setTextOpacity}
                onAlignChange={setTextAlign}
                onPositionYChange={setTextPositionY}
              />
            </TabsContent>

            <TabsContent value="music" className="space-y-4">
              <MusicSelector
                selectedTrack={selectedMusic}
                onSelectTrack={setSelectedMusic}
              />
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t">
            <Button 
              onClick={savePhoto} 
              disabled={saving} 
              className="w-full"
              size="lg"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {challengeId ? "Submit Entry" : chainId ? "Add to Chain" : "Save & Share"}
                </>
              )}
            </Button>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
