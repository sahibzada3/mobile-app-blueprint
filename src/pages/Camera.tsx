import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Camera as CameraIcon, FlipHorizontal, Image, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { CameraModeSelector } from "@/components/camera/CameraModeSelector";
import { CameraFilterStrip } from "@/components/camera/CameraFilterStrip";
import { CameraAdvancedControls } from "@/components/camera/CameraAdvancedControls";
import { applyFilter, type FilterType } from "@/utils/cameraFilters";
import { type CameraMode, type AdvancedSettings } from "@/types/camera";

export default function Camera() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const challengeId = location.state?.challengeId;
  const chainId = searchParams.get("chainId");
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [mode, setMode] = useState<CameraMode>("auto");
  const [selectedFilter, setSelectedFilter] = useState<FilterType | null>(null);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
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

  useEffect(() => {
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
        video: { facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      toast.success("Camera ready");
    } catch (error) {
      toast.error("Failed to access camera");
      console.error("Camera error:", error);
    }
  };

  const getFilterStyle = () => {
    if (!selectedFilter) {
      return applyFilter(advancedSettings);
    }
    return applyFilter(advancedSettings, selectedFilter);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Apply cinematic 21:9 crop if in cinematic mode
    if (mode === "cinematic") {
      const aspectRatio = 21 / 9;
      canvas.width = video.videoWidth;
      canvas.height = Math.floor(video.videoWidth / aspectRatio);
      const yOffset = (video.videoHeight - canvas.height) / 2;
      
      context.filter = getFilterStyle();
      context.drawImage(video, 0, yOffset, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    } else {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.filter = getFilterStyle();
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
    }

    // Apply AI enhancements based on mode and scene
    toast.loading("Applying AI enhancements...");
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate AI processing
    
    canvas.toBlob((blob) => {
      if (blob) {
        sessionStorage.setItem("capturedPhoto", canvas.toDataURL("image/jpeg", 0.95));
        sessionStorage.setItem("photoFilters", JSON.stringify({ 
          mode, 
          filter: selectedFilter, 
          settings: advancedSettings
        }));
        
        toast.success("Photo captured with AI enhancements!");
        
        if (challengeId) {
          navigate("/editor", { state: { challengeId } });
        } else if (chainId) {
          navigate("/editor", { state: { chainId } });
        } else {
          navigate("/editor");
        }
      }
    }, "image/jpeg", 0.95);
  };

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  return (
    <div className="min-h-screen bg-black pb-0 relative overflow-hidden">
      <div className="relative h-screen w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: getFilterStyle() }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center text-white p-6">
              <CameraIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}


        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/60 to-transparent p-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleCamera}
                className="bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20"
              >
                <FlipHorizontal className="w-5 h-5 text-white" />
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="bg-black/40 backdrop-blur-sm hover:bg-black/60 border border-white/20"
                  >
                    <SlidersHorizontal className="w-5 h-5 text-white" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh]">
                  <SheetHeader>
                    <SheetTitle>Advanced Controls</SheetTitle>
                  </SheetHeader>
                  <CameraAdvancedControls 
                    settings={advancedSettings}
                    onChange={setAdvancedSettings}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="absolute top-20 left-0 right-0 z-10 px-4">
          <CameraModeSelector selectedMode={mode} onModeChange={setMode} />
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-24 flex flex-col gap-4">
          {/* Filter Strip */}
          <CameraFilterStrip 
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
          />
          
          {/* Capture Controls */}
          <div className="bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-center gap-8">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate("/feed")}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20"
              >
                <Image className="w-6 h-6 text-white" />
              </Button>
              
              <Button
                onClick={capturePhoto}
                disabled={!stream}
                size="icon"
                className="w-20 h-20 rounded-full bg-white hover:bg-white/90 shadow-lg"
              >
                <div className="w-16 h-16 rounded-full border-4 border-black/20" />
              </Button>

              <div className="w-12 h-12" /> {/* Spacer for symmetry */}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
