import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy } from "lucide-react";

export default function Challenges() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      }
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="text-xl font-display font-bold text-primary">Challenges</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <Card className="shadow-nature">
          <CardContent className="p-6 text-center text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50 text-secondary" />
            <p>Challenges coming soon! Get ready for exciting photography missions.</p>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
