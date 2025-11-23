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
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(null);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
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
  const [zoomLevel, setZoomLevel] = useState(1);
  const [focusDistance, setFocusDistance] = useState(0.5);
  const [showCameraControls, setShowCameraControls] = useState(false);

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
      
      // Apply initial zoom and focus if supported
      const videoTrack = mediaStream.getVideoTracks()[0];
      applyZoomAndFocus(videoTrack);
    } catch (error) {
      toast.error("Camera access denied");
      console.error("Camera error:", error);
    }
  };

  const applyZoomAndFocus = async (track: MediaStreamTrack) => {
    const capabilities = track.getCapabilities?.() as any;
    
    try {
      const constraints: any = {};
      
      // Apply zoom if supported
      if (capabilities?.zoom) {
        constraints.zoom = zoomLevel;
      }
      
      // Apply focus if supported
      if (capabilities?.focusDistance) {
        constraints.focusMode = 'manual';
        constraints.focusDistance = focusDistance;
      }
      
      if (Object.keys(constraints).length > 0) {
        await track.applyConstraints({ advanced: [constraints] });
      }
    } catch (error) {
      console.log("Camera constraints not fully supported:", error);
    }
  };

  useEffect(() => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      applyZoomAndFocus(videoTrack);
    }
  }, [zoomLevel, focusDistance, stream]);

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
    setFacingMode(prev => prev === "user" ? "environment" : "user");
  };

  const handleTapToFocus = (e: React.MouseEvent<HTMLVideoElement> | React.TouchEvent<HTMLVideoElement>) => {
    const video = videoRef.current;
    if (!video || !stream) return;

    // Get tap coordinates relative to video element
    const rect = video.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Convert to percentage for positioning
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    // Set focus point for visual indicator
    setFocusPoint({ x: xPercent, y: yPercent });

    // Try to apply focus constraints if supported
    const videoTrack = stream.getVideoTracks()[0];
    const capabilities = videoTrack.getCapabilities?.();

    if (capabilities && 'focusMode' in capabilities) {
      videoTrack.applyConstraints({
        advanced: [{ focusMode: 'manual' } as any]
      }).catch(() => {
        // Focus mode not supported, fallback to auto
        videoTrack.applyConstraints({
          advanced: [{ focusMode: 'continuous' } as any]
        }).catch(console.error);
      });
    }

    // Auto-hide focus indicator after animation
    setTimeout(() => {
      setFocusPoint(null);
    }, 1500);

    // Haptic feedback if supported
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
          className="absolute inset-0 w-full h-full object-cover cursor-crosshair"
          style={{ filter: getFilterStyle() }}
          onClick={handleTapToFocus}
          onTouchStart={handleTapToFocus}
        />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* Focus Indicator */}
        {focusPoint && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${focusPoint.x}%`,
              top: `${focusPoint.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="relative w-20 h-20 animate-in fade-in zoom-in duration-200">
              <div className="absolute inset-0 border-2 border-white rounded-full animate-pulse" />
              <div className="absolute inset-2 border-2 border-white/50 rounded-full" />
              <div className="absolute left-1/2 top-0 w-px h-4 bg-white -translate-x-1/2" />
              <div className="absolute left-1/2 bottom-0 w-px h-4 bg-white -translate-x-1/2" />
              <div className="absolute top-1/2 left-0 h-px w-4 bg-white -translate-y-1/2" />
              <div className="absolute top-1/2 right-0 h-px w-4 bg-white -translate-y-1/2" />
            </div>
          </div>
        )}

        {/* Side Advanced Controls Panel */}
        {showAdvancedControls && (
          <div className="absolute right-2 top-16 bottom-32 w-40 md:w-44 z-20 overflow-hidden pointer-events-none">
            <div className="h-full flex flex-col pointer-events-auto">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-white font-bold text-xs drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Controls</h3>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowAdvancedControls(false)}
                  className="w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm"
                >
                  <X className="w-3 h-3 text-white" />
                </Button>
              </div>
              <div className="space-y-2.5 pr-1">
                {[
                  { key: "brightness", label: "Brightness", min: 50, max: 150, step: 1, desc: "Adjust light balance" },
                  { key: "contrast", label: "Contrast", min: 50, max: 150, step: 1, desc: "Add drama and depth" },
                  { key: "saturation", label: "Saturation", min: 0, max: 200, step: 1, desc: "Boost color intensity" },
                  { key: "shadows", label: "Shadows", min: -50, max: 50, step: 1, desc: "Recover dark details" },
                  { key: "highlights", label: "Highlights", min: -50, max: 50, step: 1, desc: "Control bright areas" },
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
                          <label className="text-[11px] font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                            {control.label}
                          </label>
                          <p className="text-[8px] text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] leading-tight">
                            {control.desc}
                          </p>
                        </div>
                        <span className="text-[11px] text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] min-w-[28px] text-right">
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


        {/* Zoom and Focus Controls */}
        {showCameraControls && (
          <div className="absolute left-2 top-16 bottom-32 w-16 z-20 flex flex-col justify-center gap-6 pointer-events-auto">
            {/* Zoom Control */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-black/70 backdrop-blur-md rounded-full px-2 py-1">
                <span className="text-white text-[10px] font-bold">{zoomLevel.toFixed(1)}x</span>
              </div>
              <div className="h-48 flex items-center">
                <Slider
                  value={[zoomLevel]}
                  onValueChange={([value]) => setZoomLevel(value)}
                  min={1}
                  max={5}
                  step={0.1}
                  orientation="vertical"
                  className="h-full"
                />
              </div>
              <div className="bg-black/70 backdrop-blur-md rounded-full p-1.5">
                <CameraIcon className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Focus Control */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-black/70 backdrop-blur-md rounded-full p-1.5">
                <div className="w-4 h-4 border-2 border-white rounded-full" />
              </div>
              <div className="h-48 flex items-center">
                <Slider
                  value={[focusDistance]}
                  onValueChange={([value]) => setFocusDistance(value)}
                  min={0}
                  max={1}
                  step={0.01}
                  orientation="vertical"
                  className="h-full"
                />
              </div>
              <div className="bg-black/70 backdrop-blur-md rounded-full px-2 py-1">
                <span className="text-white text-[10px] font-bold">
                  {focusDistance === 0 ? 'Near' : focusDistance === 1 ? 'Far' : 'Mid'}
                </span>
              </div>
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
                onClick={() => setShowCameraControls(!showCameraControls)}
                className={`w-10 h-10 rounded-full backdrop-blur-md border transition-colors ${
                  showCameraControls 
                    ? 'bg-green-600 hover:bg-green-700 border-green-400' 
                    : 'bg-black/50 hover:bg-black/70 border-white/30'
                }`}
              >
                <CameraIcon className="w-5 h-5 text-white" />
              </Button>
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

        {/* Bottom Controls - Filter Strip Only */}
        <div className="absolute bottom-14 left-0 right-0 z-10 pointer-events-none">
          <div className="flex flex-col items-center pb-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-6 pointer-events-auto">
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
