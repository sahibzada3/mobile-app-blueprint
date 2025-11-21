import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Send, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    startRecording();
    return () => {
      stopRecording();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Start waveform animation
      animateWaveform();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      onCancel();
    }
  };

  const animateWaveform = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Sample 20 bars from the frequency data
    const bars = 20;
    const step = Math.floor(dataArray.length / bars);
    const waveform = [];
    
    for (let i = 0; i < bars; i++) {
      const value = dataArray[i * step];
      waveform.push(value / 255); // Normalize to 0-1
    }
    
    setWaveformData(waveform);
    animationFrameRef.current = requestAnimationFrame(animateWaveform);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex items-center gap-3 p-4 bg-muted rounded-lg"
    >
      {/* Waveform visualization */}
      <div className="flex items-center gap-1 flex-1 h-12">
        {waveformData.map((height, index) => (
          <motion.div
            key={index}
            className="bg-primary rounded-full w-1"
            style={{
              height: `${Math.max(4, height * 48)}px`,
            }}
            animate={{
              height: `${Math.max(4, height * 48)}px`,
            }}
            transition={{ duration: 0.1 }}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="text-sm font-mono text-muted-foreground min-w-[50px]">
        {formatTime(duration)}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {isRecording ? (
          <Button
            size="icon"
            variant="destructive"
            onClick={stopRecording}
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <>
            <Button
              size="icon"
              variant="outline"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </motion.div>
  );
}