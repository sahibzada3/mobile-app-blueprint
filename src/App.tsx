import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { useOffline } from "@/hooks/useOffline";
import { WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Messages from "./pages/Messages";
import Friends from "./pages/Friends";
import Notifications from "./pages/Notifications";
import Feed from "./pages/Feed";
import Camera from "./pages/Camera";
import Editor from "./pages/Editor";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import Profile from "./pages/Profile";
import ProfileSettings from "./pages/ProfileSettings";
import WeatherRecommendations from "./pages/WeatherRecommendations";
import Spotlight from "./pages/Spotlight";
import SpotlightChain from "./pages/SpotlightChain";
import Ideas from "./pages/Ideas";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import NearbySpots from "./pages/NearbySpots";

const OfflineIndicator = () => {
  const isOffline = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm font-medium shadow-lg"
        >
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Viewing cached content.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  const [queryClient] = React.useState(() => new QueryClient());
  
  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <OfflineIndicator />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/camera" element={<Camera />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:challengeId" element={<ChallengeDetail />} />
            <Route path="/spotlight" element={<Spotlight />} />
            <Route path="/spotlight/:chainId" element={<SpotlightChain />} />
            <Route path="/ideas" element={<Ideas />} />
            <Route path="/weather" element={<WeatherRecommendations />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/settings" element={<ProfileSettings />} />
            <Route path="/profile/:userId" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/nearby-spots" element={<NearbySpots />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
