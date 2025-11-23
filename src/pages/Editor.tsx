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
  const [textPositionX, setTextPositionX] = useState(50);
  const [textRotation, setTextRotation] = useState(0);
  const [textSkewX, setTextSkewX] = useState(0);
  const [textPerspective, setTextPerspective] = useState(0);
  const [textStrokeWidth, setTextStrokeWidth] = useState(0);
  const [textStrokeColor, setTextStrokeColor] = useState("#000000");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
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
  }, [photoData, overlayText, fontFamily, fontSize, textColor, textOpacity, textAlign, textPositionY, textPositionX, textRotation, textSkewX, textPerspective, textStrokeWidth, textStrokeColor]);

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
        ctx.save();
        
        // Calculate position
        const xPosition = (canvas.width * textPositionX) / 100;
        const yPosition = (canvas.height * textPositionY) / 100;
        
        // Apply transformations
        ctx.translate(xPosition, yPosition);
        
        // Apply rotation
        if (textRotation !== 0) {
          ctx.rotate((textRotation * Math.PI) / 180);
        }
        
        // Apply perspective/skew effect
        if (textSkewX !== 0 || textPerspective !== 0) {
          const skewRad = (textSkewX * Math.PI) / 180;
          const perspectiveScale = 1 + (textPerspective / 100);
          ctx.transform(perspectiveScale, skewRad, 0, 1, 0, 0);
        }
        
        // Auto-adjust font size and wrap text intelligently
        let adjustedFontSize = fontSize;
        const maxWidth = canvas.width * 0.9; // Use 90% of canvas width to ensure text stays within boundaries
        const minFontSize = 20;
        
        // Split text and author if present (format: "text\n— author")
        const authorMatch = overlayText.match(/\n—\s*(.+)$/);
        let mainText = overlayText;
        let authorText = "";
        
        if (authorMatch) {
          authorText = `— ${authorMatch[1]}`;
          mainText = overlayText.substring(0, overlayText.indexOf('\n—')).trim();
        }
        
        // Function to wrap text intelligently
        const wrapText = (text: string, maxWidth: number, currentFontSize: number): string[] => {
          ctx.font = `${currentFontSize}px "${fontFamily}", serif`;
          const lines = text.split("\n");
          const wrappedLines: string[] = [];
          
          lines.forEach(line => {
            if (ctx.measureText(line).width <= maxWidth) {
              wrappedLines.push(line);
            } else {
              // Split long lines by words
              const words = line.split(" ");
              let currentLine = "";
              
              words.forEach((word, idx) => {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const metrics = ctx.measureText(testLine);
                
                if (metrics.width > maxWidth && currentLine) {
                  wrappedLines.push(currentLine);
                  currentLine = word;
                } else {
                  currentLine = testLine;
                }
                
                // Push the last line
                if (idx === words.length - 1 && currentLine) {
                  wrappedLines.push(currentLine);
                }
              });
            }
          });
          
          return wrappedLines;
        };
        
        // Wrap main text
        let mainLines = wrapText(mainText, maxWidth, adjustedFontSize);
        
        // Auto-reduce font size if too many lines
        const maxLines = 8;
        while (mainLines.length > maxLines && adjustedFontSize > minFontSize) {
          adjustedFontSize -= 3;
          mainLines = wrapText(mainText, maxWidth, adjustedFontSize);
        }
        
        // Combine main text and author (author closer to main text)
        const allLines = [...mainLines];
        if (authorText) {
          // No empty line - author directly follows main text
          allLines.push(authorText);
        }
        
        // Set final text properties
        ctx.font = `${adjustedFontSize}px "${fontFamily}", serif`;
        ctx.fillStyle = textColor;
        ctx.globalAlpha = textOpacity / 100;
        ctx.textAlign = textAlign;
        ctx.textBaseline = "middle";
        
        // Add stroke if enabled
        if (textStrokeWidth > 0) {
          ctx.strokeStyle = textStrokeColor;
          ctx.lineWidth = textStrokeWidth;
          ctx.lineJoin = "round";
        }
        
        // Add text shadow for depth
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 15 + (textPerspective / 5);
        ctx.shadowOffsetX = 3 + (textPerspective / 10);
        ctx.shadowOffsetY = 3 + (textPerspective / 10);

        const lineHeight = adjustedFontSize * 1.5;
        const totalHeight = allLines.length * lineHeight;
        const startY = -(totalHeight / 2) + (lineHeight / 2);

        let xOffset = 0;
        if (textAlign === "left") {
          xOffset = -canvas.width * 0.4;
        } else if (textAlign === "right") {
          xOffset = canvas.width * 0.4;
        }

        // Calculate the leftmost x position of the main text for author alignment
        let mainTextLeftX = xOffset;
        if (textAlign === "center") {
          // For centered text, find the leftmost point of the longest line
          ctx.font = `${adjustedFontSize}px "${fontFamily}", serif`;
          let maxTextWidth = 0;
          mainLines.forEach(line => {
            const width = ctx.measureText(line).width;
            if (width > maxTextWidth) maxTextWidth = width;
          });
          mainTextLeftX = -(maxTextWidth / 2);
        } else if (textAlign === "right") {
          // For right-aligned text, use the right offset
          mainTextLeftX = xOffset;
        }

        allLines.forEach((line, index) => {
          const currentY = startY + index * lineHeight;
          
          // Check if this is the author line
          const isAuthorLine = line.startsWith("—");
          
          // Use smaller font for author line
          if (isAuthorLine) {
            ctx.font = `${adjustedFontSize * 0.8}px "${fontFamily}", serif`;
            ctx.globalAlpha = (textOpacity / 100) * 0.9;
            
            // Position author at the left edge of the main text
            const authorY = currentY + (lineHeight * 0.3); // Move down slightly
            const authorXOffset = mainTextLeftX; // Align with main text's left edge
            
            // Force left alignment for author
            const originalTextAlign = ctx.textAlign;
            ctx.textAlign = "left";
            
            // Draw stroke first if enabled
            if (textStrokeWidth > 0 && line.trim()) {
              ctx.strokeText(line, authorXOffset, authorY);
            }
            
            // Draw fill text
            if (line.trim()) {
              ctx.fillText(line, authorXOffset, authorY);
            }
            
            // Restore original alignment
            ctx.textAlign = originalTextAlign;
          } else {
            ctx.font = `${adjustedFontSize}px "${fontFamily}", serif`;
            ctx.globalAlpha = textOpacity / 100;
            
            // Draw stroke first if enabled
            if (textStrokeWidth > 0 && line.trim()) {
              ctx.strokeText(line, xOffset, currentY);
            }
            
            // Draw fill text
            if (line.trim()) {
              ctx.fillText(line, xOffset, currentY);
            }
          }
        });
        
        ctx.restore();
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
          typography_data: overlayText ? {
            text: overlayText,
            font: fontFamily,
            size: fontSize,
            color: textColor,
            opacity: textOpacity,
            align: textAlign,
            positionY: textPositionY,
            positionX: textPositionX,
            rotation: textRotation,
            skewX: textSkewX,
            perspective: textPerspective,
            strokeWidth: textStrokeWidth,
            strokeColor: textStrokeColor,
            language: selectedLanguage,
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
        <div className="relative rounded-2xl overflow-hidden shadow-card bg-muted">
          <canvas ref={canvasRef} className="w-full h-auto" />
        </div>

        <Card className="p-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="basic">
                <ImageIcon className="w-4 h-4 mr-2" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
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
                textPositionX={textPositionX}
                textRotation={textRotation}
                textSkewX={textSkewX}
                textPerspective={textPerspective}
                textStrokeWidth={textStrokeWidth}
                textStrokeColor={textStrokeColor}
                selectedLanguage={selectedLanguage}
                photoData={photoData}
                onTextChange={setOverlayText}
                onFontChange={setFontFamily}
                onSizeChange={setFontSize}
                onColorChange={setTextColor}
                onOpacityChange={setTextOpacity}
                onAlignChange={setTextAlign}
                onPositionYChange={setTextPositionY}
                onPositionXChange={setTextPositionX}
                onRotationChange={setTextRotation}
                onSkewXChange={setTextSkewX}
                onPerspectiveChange={setTextPerspective}
                onStrokeWidthChange={setTextStrokeWidth}
                onStrokeColorChange={setTextStrokeColor}
                onLanguageChange={setSelectedLanguage}
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
