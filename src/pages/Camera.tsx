import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera as CameraIcon, FlipHorizontal, Image, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { CameraFilterStrip } from "@/components/camera/CameraFilterStrip";
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
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showZoomSlider, setShowZoomSlider] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
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
    
    // Load sound settings
    const savedSound = localStorage.getItem('cameraSound');
    if (savedSound !== null) setSoundEnabled(savedSound === 'true');

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
    } catch (error) {
      toast.error("Camera access denied");
      console.error("Camera error:", error);
    }
  };

  const getFilterStyle = () => {
    if (!selectedFilter) {
      return applyFilter(advancedSettings);
    }
    return applyFilter(advancedSettings, selectedFilter);
  };

  const playSound = (type: 'capture' | 'zoom' | 'flip') => {
    if (!soundEnabled) return;
    
    // Play sound effect
    const audio = new Audio();
    if (type === 'capture') {
      // Camera shutter sound (short beep)
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSSK0fPTgjMGHW7A7+OZUA0PVqzn77BdGAg+ltrzxnMpBSh+zPLaizsIGGS56+mfTgwOUKXh8bllHQU2jdXzzn0vBSZ8yvHajT4KFl606+mnVRQKRp/g8r5sIQUkitHz04IzBh1uwO/jmVAND1as5++wXRgIPpba88ZzKQUofszy2os7CBhkuevpn04MDlCl4fG5ZR0FNo3V885';
    } else if (type === 'zoom') {
      // Short click sound
      audio.src = 'data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAAA=';
    } else if (type === 'flip') {
      // Flip sound
      audio.src = 'data:audio/wav;base64,UklGRhIAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YU4AAAA=';
    }
    audio.volume = 0.3;
    audio.play().catch(() => {});
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    playSound('capture');

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

    // Apply AI enhancements based on mode and scene (silent processing)
    await new Promise(resolve => setTimeout(resolve, 500)); // Quick processing
    
    canvas.toBlob((blob) => {
      if (blob) {
        sessionStorage.setItem("capturedPhoto", canvas.toDataURL("image/jpeg", 0.95));
        sessionStorage.setItem("photoFilters", JSON.stringify({ 
          mode, 
          filter: selectedFilter, 
          settings: advancedSettings
        }));
        
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

  // Listen for capture event from nav bar
  useEffect(() => {
    const handleCaptureEvent = () => {
      capturePhoto();
    };

    window.addEventListener('camera-capture', handleCaptureEvent);
    return () => window.removeEventListener('camera-capture', handleCaptureEvent);
  }, [videoRef.current, canvasRef.current, mode, selectedFilter, advancedSettings]);

  const toggleCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    playSound('flip');
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const handleZoomChange = (value: number) => {
    setZoomLevel(value);
    playSound('zoom');
    
    // Apply zoom to video track if supported
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities?.() as any;
      
      if (capabilities?.zoom) {
        videoTrack.applyConstraints({
          advanced: [{ zoom: Math.min(capabilities.zoom.max || 10, value) } as any]
        }).catch(() => {
          console.log("Hardware zoom not supported");
        });
      }
    }
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-0 relative overflow-hidden">
      <div className="relative h-screen w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out"
          style={{ 
            filter: getFilterStyle(),
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Zoom Slider - Bottom Left Above Filters */}
        {showZoomSlider && (
          <div className="absolute bottom-28 left-4 right-4 z-20 max-w-xs pointer-events-auto">
            <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/20 p-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowZoomSlider(false)}
                  className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex-shrink-0"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </Button>
                
                <div className="flex-1 flex items-center gap-3">
                  <span className="text-white text-xs font-bold drop-shadow-lg min-w-[32px]">
                    {zoomLevel.toFixed(1)}×
                  </span>
                  <Slider
                    value={[zoomLevel]}
                    onValueChange={([value]) => handleZoomChange(value)}
                    min={1}
                    max={10}
                    step={0.1}
                    className="flex-1"
                  />
                  <span className="text-white/60 text-xs font-medium drop-shadow-lg">
                    10×
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Side Advanced Controls Panel */}
        {showAdvancedControls && (
          <div className="absolute right-2 top-16 bottom-32 w-36 z-20 overflow-hidden pointer-events-none">
            <div className="h-full flex flex-col pointer-events-auto">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-white font-bold text-[10px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Controls</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAdvancedControls(false)}
                  className="w-5 h-5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="space-y-2 pr-1">
                  {[
                    { key: "brightness", label: "Brightness", min: 50, max: 150, step: 1, desc: "Light balance" },
                    { key: "contrast", label: "Contrast", min: 50, max: 150, step: 1, desc: "Drama and depth" },
                    { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, desc: "Color intensity" },
                    { key: "shadows", label: "Shadows", min: -50, max: 50, step: 1, desc: "Dark details" },
                    { key: "highlights", label: "Highlights", min: -50, max: 50, step: 1, desc: "Bright areas" },
                  ].map((control) => {
                  // Filter-specific recommended values
                  const getRecommendedValue = () => {
                    if (!selectedFilter) return { brightness: 100, contrast: 100, saturation: 100, shadows: 0, highlights: 0 }[control.key as keyof typeof advancedSettings] || 100;
                    
                    const filterRecommendations: Record<string, Record<string, number>> = {
                      'golden-hour': { brightness: 110, contrast: 115, saturation: 120, shadows: 10, highlights: -5 },
                      'forest': { brightness: 95, contrast: 110, saturation: 115, shadows: 15, highlights: -10 },
                      'urban': { brightness: 100, contrast: 125, saturation: 95, shadows: 5, highlights: -15 },
                      'water': { brightness: 105, contrast: 105, saturation: 110, shadows: 0, highlights: -5 },
                      'silhouette': { brightness: 90, contrast: 140, saturation: 90, shadows: -30, highlights: -20 },
                      'fog-mist': { brightness: 110, contrast: 90, saturation: 85, shadows: 5, highlights: 10 },
                      'night': { brightness: 85, contrast: 120, saturation: 95, shadows: 20, highlights: 0 },
                      'beach-desert': { brightness: 115, contrast: 110, saturation: 110, shadows: -10, highlights: -10 },
                      'rain': { brightness: 95, contrast: 115, saturation: 105, shadows: 10, highlights: -5 },
                      'sky-clouds': { brightness: 105, contrast: 110, saturation: 115, shadows: 0, highlights: -10 },
                      'indoor-golden': { brightness: 105, contrast: 105, saturation: 110, shadows: 15, highlights: 0 },
                      'old-architecture': { brightness: 100, contrast: 120, saturation: 100, shadows: 10, highlights: -10 },
                      'midday-sun': { brightness: 110, contrast: 115, saturation: 105, shadows: -5, highlights: -15 },
                    };
                    
                    return filterRecommendations[selectedFilter]?.[control.key] ?? 100;
                  };
                  
                  const recommended = getRecommendedValue();
                  const recommendedPercent = ((recommended - control.min) / (control.max - control.min)) * 100;
                  
                    return (
                      <div key={control.key} className="space-y-0.5">
                        <div className="flex items-center justify-between px-1">
                          <div>
                            <label className="text-[10px] font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                              {control.label}
                            </label>
                            <p className="text-[7px] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
                              {control.desc}
                            </p>
                          </div>
                          <span className="text-[10px] text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] min-w-[24px] text-right">
                            {advancedSettings[control.key as keyof AdvancedSettings]}
                          </span>
                        </div>
                        <div className="relative pt-1">
                          {/* Recommended level marker */}
                          <div 
                            className="absolute top-0 h-4 w-0.5 bg-blue-400 z-10 pointer-events-none drop-shadow-md"
                            style={{ left: `${recommendedPercent}%`, transform: 'translateX(-50%)' }}
                          >
                            <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400" />
                          </div>
                          <Slider
                            value={[advancedSettings[control.key as keyof AdvancedSettings]]}
                            onValueChange={([value]) => setAdvancedSettings({ ...advancedSettings, [control.key]: value })}
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
          </div>
        )}

        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90">
            <div className="text-center text-white p-6">
              <CameraIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}


        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 pb-8">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/feed")}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/30"
            >
              <Image className="w-5 h-5 text-white" />
            </Button>

            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleCamera}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/30"
              >
                <FlipHorizontal className="w-5 h-5 text-white" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border transition-colors ${
                  showAdvancedControls 
                    ? 'bg-blue-600 hover:bg-blue-700 border-blue-400' 
                    : 'bg-black/50 hover:bg-black/70 border-white/30'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Controls - Filter Strip and Zoom Toggle */}
        <div className="absolute bottom-14 left-0 right-0 z-10 pointer-events-none">
          <div className="flex flex-col items-center pb-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-6 pointer-events-auto">
            {/* Zoom Toggle Button */}
            {!showZoomSlider && (
              <div className="w-full px-4 mb-3 flex justify-start">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowZoomSlider(true)}
                  className="h-8 w-8 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70 border border-white/30"
                >
                  <span className="text-white text-xs font-bold">{zoomLevel.toFixed(1)}×</span>
                </Button>
              </div>
            )}
            
            {/* Filter Strip */}
            <div className="w-full px-4">
              <CameraFilterStrip 
                selectedFilter={selectedFilter}
                onFilterChange={setSelectedFilter}
              />
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
