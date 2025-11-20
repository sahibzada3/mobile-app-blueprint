import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-nature">
          <Camera className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-display font-bold text-foreground mb-3">
          Frame
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Capture cinematic nature moments
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            size="lg"
            className="shadow-nature"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="shadow-glow"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
