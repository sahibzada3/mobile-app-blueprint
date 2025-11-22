import { Link, useLocation } from "react-router-dom";
import { Home, Camera, Trophy, User, UserPlus } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: UserPlus, label: "Friends", path: "/friends" },
    { icon: Camera, label: "Camera", path: "/camera" },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border/50 z-50 safe-area-inset-bottom">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-2">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
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
              <div className={`p-2.5 rounded-xl transition-all duration-200 ${
                isActive ? "bg-primary/10" : "group-hover:bg-primary/5"
              }`}>
                <Icon 
                  className="w-5 h-5" 
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isActive ? "font-semibold" : ""}`}>
                {label}
              </span>
              {isActive && (
                <div className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
