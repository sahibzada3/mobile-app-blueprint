import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-nature flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-nature">
          <Camera className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-display font-bold text-accent mb-3 drop-shadow-lg">
          Frame
        </h1>
        <p className="text-xl text-accent/90 mb-8 drop-shadow">
          Capture cinematic nature moments
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/login")}
            variant="secondary"
            size="lg"
            className="shadow-glow"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="bg-accent text-primary hover:bg-accent/90 shadow-nature"
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
