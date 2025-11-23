import { Link, useLocation } from "react-router-dom";
import { Camera, Trophy, User, MapPin, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
  const location = useLocation();
  const isOnCamera = location.pathname === "/camera";
  
  const handleCapture = () => {
    window.dispatchEvent(new Event('camera-capture'));
  };
  
  const navItems = [
    { icon: MapPin, label: "Spots", path: "/nearby-spots" },
    { icon: Link2, label: "Chains", path: "/spotlight" },
    { icon: Camera, label: "Camera", path: "/camera" },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isCameraItem = path === "/camera";
          
          if (isCameraItem && isOnCamera) {
            return (
              <Button
                key={path}
                onClick={handleCapture}
                size="icon"
                className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 shadow-soft -mt-6"
              >
                <div className="w-12 h-12 rounded-full border-2 border-background" />
              </Button>
            );
          }
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}