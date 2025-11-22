import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Mountain, Sparkles, Sun, Cloud } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/feed");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 left-10 text-primary/10"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      >
        <Mountain className="w-32 h-32" />
      </motion.div>
      <motion.div
        className="absolute bottom-20 right-10 text-accent/10"
        animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity }}
      >
        <Sun className="w-24 h-24" />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-1/4 text-muted-foreground/5"
        animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <Cloud className="w-40 h-40" />
      </motion.div>

      <motion.div
        className="text-center max-w-2xl w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-8 shadow-2xl"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Camera className="w-16 h-16 text-primary" strokeWidth={2.5} />
        </motion.div>

        <motion.h1
          className="text-7xl font-bold text-foreground mb-3 bg-clip-text"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          NatureFrame
        </motion.h1>

        <motion.div
          className="flex items-center justify-center gap-2 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Sparkles className="w-5 h-5 text-primary" />
          <p className="text-2xl text-muted-foreground font-medium">
            Cinematic Nature Photography
          </p>
          <Sparkles className="w-5 h-5 text-accent" />
        </motion.div>

        <motion.p
          className="text-lg text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Transform ordinary outdoor photography into artistic, collaborative experiences.
          Capture stunning moments with advanced filters, share with friends, and earn recognition.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={() => navigate("/register")}
            size="lg"
            className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
          >
            <Camera className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto text-lg px-8 py-6"
          >
            Sign In
          </Button>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Pro Filters</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm font-medium">AI Powered</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Mountain className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Social Collaboration</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
