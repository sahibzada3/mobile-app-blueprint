import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Lightbulb, Camera } from "lucide-react";
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
      <header className="sticky top-0 glass-strong border-b border-border/30 z-40 shadow-elevated backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">Get Ideas</h1>
              <p className="text-xs text-muted-foreground">Learn to speak through photos</p>
            </div>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {/* App Features Guide */}
        <AppFeaturesGuide />

        {/* Divider */}
        <div className="flex items-center gap-3 py-2">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground font-medium">Photography Ideas</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Inspirational Quote */}
        <Card className="glass-card border-border/30 p-4">
          <p className="text-sm italic text-muted-foreground leading-relaxed text-center">
            "A photograph is a secret about a secret. The more it tells you, the less you know."
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2 text-center">— Diane Arbus</p>
        </Card>

        {/* Category Sections */}
        <div className="space-y-4">
          {inspirationCategories.map((category, index) => (
            <CategorySection 
              key={category.id} 
              category={category}
              defaultExpanded={index === 0}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <Card className="glass-card border-primary/20 mt-6">
          <div className="p-5 text-center space-y-3">
            <p className="text-sm font-medium text-foreground">
              Ready to Capture?
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Take these ideas and make them yours. Let your images speak what words cannot.
            </p>
            <Button 
              onClick={() => navigate("/camera")}
              size="sm"
              className="mt-2 gap-2"
            >
              <Camera className="w-4 h-4" />
              Open Camera
            </Button>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
