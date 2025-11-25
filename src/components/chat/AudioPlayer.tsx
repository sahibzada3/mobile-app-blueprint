import * as React from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

interface AudioPlayerProps {
  audioUrl: string;
  duration?: number;
}

export default function AudioPlayer({ audioUrl, duration }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [audioDuration, setAudioDuration] = React.useState(duration || 0);
  const [waveformData, setWaveformData] = React.useState<number[]>([]);
  
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const audioContextRef = React.useRef<AudioContext | null>(null);
  const analyserRef = React.useRef<AnalyserNode | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setAudioDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const setupAudioAnalysis = async () => {
    const audio = audioRef.current;
    if (!audio || audioContextRef.current) return;

    try {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio);
      const analyser = audioContext.createAnalyser();
      
      analyser.fftSize = 256;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Generate initial waveform
      generateWaveform();
    } catch (error) {
      console.error("Error setting up audio analysis:", error);
    }
  };

  const generateWaveform = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    const bars = 30;
    const step = Math.floor(dataArray.length / bars);
    const waveform = [];
    
    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step];
      waveform.push(value / 255);
    }
    
    setWaveformData(waveform);
    
    if (isPlaying) {
      animationFrameRef.current = requestAnimationFrame(generateWaveform);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      if (!audioContextRef.current) {
        await setupAudioAnalysis();
      }
      await audio.play();
      setIsPlaying(true);
      generateWaveform();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audioDuration;
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = audioDuration > 0 ? (currentTime / audioDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg min-w-[250px]">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 shrink-0"
        onClick={togglePlay}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 space-y-1">
        {/* Waveform */}
        <div
          className="flex items-center gap-[2px] h-8 cursor-pointer"
          onClick={handleSeek}
        >
          {waveformData.length > 0 ? (
            waveformData.map((height, index) => {
              const barProgress = (index / waveformData.length) * 100;
              const isPassed = barProgress < progress;
              
              return (
                <div
                  key={index}
                  className={`rounded-full w-1 transition-colors ${
                    isPassed ? "bg-primary" : "bg-primary/30"
                  }`}
                  style={{
                    height: `${Math.max(4, height * 32)}px`,
                  }}
                />
              );
            })
          ) : (
            // Static waveform bars when no analysis is available
            Array.from({ length: 30 }).map((_, index) => {
              const barProgress = (index / 30) * 100;
              const isPassed = barProgress < progress;
              const height = Math.random() * 0.6 + 0.4; // Random height between 0.4 and 1
              
              return (
                <div
                  key={index}
                  className={`rounded-full w-1 transition-colors ${
                    isPassed ? "bg-primary" : "bg-primary/30"
                  }`}
                  style={{
                    height: `${height * 32}px`,
                  }}
                />
              );
            })
          )}
        </div>

        {/* Time display */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(audioDuration)}</span>
        </div>
      </div>
    </div>
  );
}