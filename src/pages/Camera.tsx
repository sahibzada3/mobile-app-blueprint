import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import { Camera as CameraIcon, FlipHorizontal, Sun, Droplets, Moon as MoonIcon } from "lucide-react";
import { toast } from "sonner";

export default function Camera() {
  const navigate = useNavigate();
  const location = useLocation();
  const challengeId = location.state?.challengeId;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [darkness, setDarkness] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode, navigate]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      toast.error("Failed to access camera");
      console.error("Camera error:", error);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Apply filters
    context.filter = `brightness(${brightness}%) saturate(${saturation}%) contrast(${100 - darkness}%)`;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
        // Store the photo data to pass to editor
        sessionStorage.setItem("capturedPhoto", canvas.toDataURL("image/jpeg", 0.9));
        sessionStorage.setItem("photoFilters", JSON.stringify({ brightness, saturation, darkness }));
        
        // Pass challengeId to editor if present
        if (challengeId) {
          navigate("/editor", { state: { challengeId } });
        } else {
          navigate("/editor");
        }
      }
    }, "image/jpeg", 0.9);
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-display font-bold text-primary">Camera</h1>
          <Button variant="ghost" size="icon" onClick={toggleCamera}>
            <FlipHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-lg mx-auto">
        <div className="relative aspect-[3/4] bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{
              filter: `brightness(${brightness}%) saturate(${saturation}%) contrast(${100 - darkness}%)`,
            }}
          />
          <canvas ref={canvasRef} className="hidden" />
        </div>

        <Card className="m-4 p-4 space-y-4 shadow-nature">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium">Brightness</span>
              </div>
              <span className="text-sm text-muted-foreground">{brightness}%</span>
            </div>
            <Slider
              value={[brightness]}
              onValueChange={([value]) => setBrightness(value)}
              min={50}
              max={150}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Saturation</span>
              </div>
              <span className="text-sm text-muted-foreground">{saturation}%</span>
            </div>
            <Slider
              value={[saturation]}
              onValueChange={([value]) => setSaturation(value)}
              min={0}
              max={200}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MoonIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Darkness</span>
              </div>
              <span className="text-sm text-muted-foreground">{darkness}%</span>
            </div>
            <Slider
              value={[darkness]}
              onValueChange={([value]) => setDarkness(value)}
              min={0}
              max={50}
              step={1}
              className="w-full"
            />
          </div>

          <Button onClick={capturePhoto} className="w-full shadow-glow" size="lg">
            <CameraIcon className="w-5 h-5 mr-2" />
            Capture Photo
          </Button>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
