import { Link, useLocation } from "react-router-dom";
import { Home, Camera, Trophy, User, Link2 } from "lucide-react";

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: "Feed", path: "/feed" },
    { icon: Link2, label: "Spotlight", path: "/spotlight" },
    { icon: Camera, label: "Camera", path: "/camera" },
    { icon: Trophy, label: "Challenges", path: "/challenges" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-2xl mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? "fill-primary" : ""}`} />
              <span className="text-xs mt-1">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
