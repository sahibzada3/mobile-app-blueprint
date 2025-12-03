import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card } from "@/components/ui/card";
import { Sparkles, Camera, MessageCircle } from "lucide-react";
import NotificationBell from "@/components/notifications/NotificationBell";
import { Button } from "@/components/ui/button";
import CategorySection from "@/components/ideas/CategorySection";
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
        <div className="max-w-2xl mx-auto px-5 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">Get Ideas</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Learn to talk through images</p>
          </div>
          <NotificationBell />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-6 space-y-6">
        {/* Hero Section */}
        <Card className="glass-card border-border/30 overflow-hidden">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Talk Through Images</h2>
                <p className="text-xs text-muted-foreground">Express feelings, stories & emotions</p>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every photo tells a story. Here you'll find ideas for capturing moments that speak — 
              from nature's quiet lessons to everyday objects holding hidden meaning. 
              Let your images become words.
            </p>

            <div className="flex gap-2 pt-2">
              <Button 
                onClick={() => navigate("/camera")}
                className="flex-1 gap-2"
                size="sm"
              >
                <Camera className="w-4 h-4" />
                Start Capturing
              </Button>
              <Button 
                onClick={() => navigate("/editor")}
                variant="outline"
                className="flex-1 gap-2"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
                Add Words
              </Button>
            </div>
          </div>
        </Card>

        {/* Inspirational Quote */}
        <div className="text-center py-4">
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            "A photograph is a secret about a secret. The more it tells you, the less you know."
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">— Diane Arbus</p>
        </div>

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

        {/* Bottom Inspiration */}
        <Card className="glass-card border-primary/20 mt-8">
          <div className="p-5 text-center space-y-3">
            <p className="text-sm font-medium text-foreground">
              Your Next Shot Awaits
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The best photographs come from seeing the world differently. 
              Take these ideas, make them yours, and let your images speak what words cannot.
            </p>
            <Button 
              onClick={() => navigate("/camera")}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Open Camera
            </Button>
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
