import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-6"
      style={{
        background: `linear-gradient(180deg, hsl(var(--background)) 0%, hsl(210 60% 15%) 50%, hsl(var(--background-gradient-end)) 100%)`
      }}
    >
      <div className="text-center max-w-md w-full">
        <div className="w-28 h-28 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-8" style={{ boxShadow: '0 0 48px hsl(207 90% 54% / 0.4)' }}>
          <Camera className="w-14 h-14 text-primary" strokeWidth={2.5} />
        </div>
        <h1 className="text-6xl font-bold text-foreground mb-4" style={{ textShadow: '0 0 24px hsl(207 90% 54% / 0.4)' }}>
          Frame
        </h1>
        <p className="text-xl text-muted-foreground mb-10 font-medium">
          Capture cinematic nature moments
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="w-full sm:w-auto"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
