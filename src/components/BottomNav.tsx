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
    { icon: Link2, label: "Spotlight", path: "/spotlight" },
    { icon: Camera, label: "Camera", path: "/camera" },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-14 max-w-2xl mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          const isCameraItem = path === "/camera";
          
          // Show capture button instead of camera icon when on camera page
          if (isCameraItem && isOnCamera) {
            return (
              <Button
                key={path}
                onClick={handleCapture}
                size="icon"
                className="w-12 h-12 rounded-full bg-white hover:bg-white/95 shadow-lg transition-transform active:scale-90 -mt-6"
              >
                <div className="w-10 h-10 rounded-full border-[2.5px] border-black/20" />
              </Button>
            );
          }
          
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative group ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                isActive ? "bg-primary/10" : "group-hover:bg-primary/5"
              }`}>
                <Icon 
                  className="w-4 h-4" 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] mt-0.5 font-medium ${isActive ? "font-semibold" : ""}`}>
                {label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
