import { useEffect, useState } from "react";
import { type CameraMode } from "@/types/camera";
import { Sparkles } from "lucide-react";

interface SceneDetectorProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  onSceneDetected: (scene: string) => void;
  mode: CameraMode;
}

const sceneKeywords = {
  sky: ["Sky & Clouds", "Clear Sky", "Dramatic Sky"],
  sunset: ["Sunset", "Golden Hour", "Dusk"],
  silhouette: ["Silhouette", "Backlit"],
  trees: ["Forest", "Trees", "Foliage"],
  "sun-rays": ["Sun Rays", "Light Beams"],
  animal: ["Wildlife", "Animal"],
  "low-light": ["Low Light", "Night"],
  fog: ["Fog", "Haze", "Mist"],
  indoor: ["Indoor Light", "Window Light"],
};

export function SceneDetector({ videoRef, onSceneDetected, mode }: SceneDetectorProps) {
  const [currentScene, setCurrentScene] = useState<string | null>(null);

  useEffect(() => {
    // Simulate scene detection based on mode
    // In a real implementation, this would use ML models like TensorFlow.js
    const detectScene = () => {
      if (mode === "auto") {
        // Simulate random scene detection
        const scenes = Object.values(sceneKeywords).flat();
        const randomScene = scenes[Math.floor(Math.random() * scenes.length)];
        setCurrentScene(randomScene);
        onSceneDetected(randomScene);
      } else {
        // Use mode-specific scene
        const modeScenes = sceneKeywords[mode as keyof typeof sceneKeywords];
        if (modeScenes) {
          const scene = modeScenes[0];
          setCurrentScene(scene);
          onSceneDetected(scene);
        }
      }
    };

    // Detect scene every 3 seconds
    const interval = setInterval(detectScene, 3000);
    detectScene(); // Initial detection

    return () => clearInterval(interval);
  }, [mode, onSceneDetected]);

  if (!currentScene) return null;

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div className="bg-primary/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span className="text-xs font-semibold text-white">
            AI: {currentScene} Detected
          </span>
        </div>
      </div>
    </div>
  );
}
