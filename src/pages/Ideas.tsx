import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Lightbulb, Camera, Sparkles } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import CategorySection from "@/components/ideas/CategorySection";
import AppFeaturesGuide from "@/components/ideas/AppFeaturesGuide";
import { inspirationCategories } from "@/data/inspirationIdeas";

export default function Ideas() {
  const navigate = useNavigate();

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
  };

  return (
    <div className="min-h-screen gradient-soft pb-24">
      {/* Header */}
      <motion.header 
        className="sticky top-0 glass-strong border-b border-border/30 z-40 shadow-elevated backdrop-blur-xl"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20"
              whileHover={{ scale: 1.1, rotate: 5 }}
              animate={{ 
                boxShadow: ["0 0 0 0 rgba(6,182,212,0)", "0 0 20px 4px rgba(6,182,212,0.3)", "0 0 0 0 rgba(6,182,212,0)"]
              }}
              transition={{ 
                boxShadow: { duration: 2, repeat: Infinity }
              }}
            >
              <Lightbulb className="w-5 h-5 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">Get Ideas</h1>
              <p className="text-xs text-muted-foreground">Learn to speak through photos</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </motion.header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-8">
        {/* App Features Guide */}
        <AppFeaturesGuide />

        {/* Divider */}
        <motion.div 
          className="flex items-center gap-4 py-2"
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <span className="text-xs text-muted-foreground font-medium flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            Photography Ideas
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-border via-border to-transparent" />
        </motion.div>

        {/* Inspirational Quote */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5"
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{ duration: 10, repeat: Infinity }}
            style={{ backgroundSize: "200% 100%" }}
          />
          
          <div className="relative z-10">
            <p className="text-sm italic text-foreground/90 leading-relaxed text-center">
              "A photograph is a secret about a secret. The more it tells you, the less you know."
            </p>
            <p className="text-xs text-muted-foreground/70 mt-3 text-center">— Diane Arbus</p>
          </div>
        </motion.div>

        {/* Category Sections */}
        <motion.div 
          className="space-y-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {inspirationCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <CategorySection 
                category={category}
                defaultExpanded={index === 0}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div 
          className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/50 to-accent/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          whileHover={{ scale: 1.01 }}
        >
          {/* Animated shine */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 3 }}
          />
          
          <div className="relative z-10 p-6 text-center space-y-4">
            <motion.div
              className="w-14 h-14 mx-auto rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30"
              animate={{ 
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0 0 rgba(6,182,212,0.3)", "0 0 30px 10px rgba(6,182,212,0.2)", "0 0 0 0 rgba(6,182,212,0.3)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Camera className="w-7 h-7 text-primary" />
            </motion.div>
            
            <div>
              <p className="text-base font-display font-bold text-foreground">
                Ready to Capture?
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
                Take these ideas and make them yours. Let your images speak what words cannot.
              </p>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => navigate("/camera")}
                size="lg"
                className="gap-2 px-8"
              >
                <Camera className="w-4 h-4" />
                Open Camera
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  );
}
