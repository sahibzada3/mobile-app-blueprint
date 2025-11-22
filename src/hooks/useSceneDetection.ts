import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type FilterType } from "@/utils/cameraFilters";

interface SceneSuggestion {
  scene: string;
  filter: FilterType;
  confidence: string;
}

export function useSceneDetection(videoRef: React.RefObject<HTMLVideoElement>, enabled: boolean) {
  const [suggestion, setSuggestion] = useState<SceneSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const lastAnalysisTime = useRef<number>(0);
  const analysisInterval = 5000; // Analyze every 5 seconds

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const analyzeFrame = async () => {
      const now = Date.now();
      
      // Throttle requests
      if (now - lastAnalysisTime.current < analysisInterval || isAnalyzing) {
        return;
      }

      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      try {
        setIsAnalyzing(true);
        lastAnalysisTime.current = now;

        // Capture frame from video
        const canvas = document.createElement("canvas");
        canvas.width = 640; // Smaller size for faster processing
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.6);

        // Call edge function
        const { data, error } = await supabase.functions.invoke("detect-scene", {
          body: { imageData }
        });

        if (error) {
          console.error("Scene detection error:", error);
          return;
        }

        if (data?.suggestion) {
          setSuggestion(data.suggestion);
        } else {
          setSuggestion(null);
        }
      } catch (error) {
        console.error("Error analyzing frame:", error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    // Start periodic analysis
    const interval = setInterval(analyzeFrame, analysisInterval);
    
    // Initial analysis after a short delay
    const initialTimeout = setTimeout(analyzeFrame, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, [videoRef, enabled, isAnalyzing]);

  return { suggestion, isAnalyzing };
}
