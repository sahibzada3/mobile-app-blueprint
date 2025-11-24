import { Link, useLocation } from "react-router-dom";
import { Camera, Trophy, User, Lightbulb, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BottomNav() {
  const location = useLocation();
  const isOnCamera = location.pathname === "/camera";
  
  const handleCapture = () => {
    window.dispatchEvent(new Event('camera-capture'));
  };
  
  const navItems = [
    { icon: Lightbulb, label: "Ideas", path: "/ideas" },
    { icon: Link2, label: "Flares", path: "/spotlight" },
    { icon: Camera, label: "Camera", path: "/camera" },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border/20 z-50 safe-area-inset-bottom shadow-elevated backdrop-blur-xl">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto px-3">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isCameraItem = path === "/camera";
          
          if (isCameraItem && isOnCamera) {
            return (
              <Button
                key={path}
                onClick={handleCapture}
                size="icon"
                className="w-16 h-16 rounded-full bg-primary hover:bg-primary/90 shadow-elevated hover:shadow-card-hover -mt-7 transition-all duration-300 hover:scale-105"
              >
                <div className="w-14 h-14 rounded-full border-[3px] border-background shadow-inner" />
              </Button>
            );
          }
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1.5 flex-1 h-full transition-all duration-300 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-semibold tracking-wide uppercase">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}