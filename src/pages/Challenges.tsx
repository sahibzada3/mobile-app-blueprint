import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Moon, Sun, Target, Zap, Filter } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import ChallengeCard from "@/components/challenges/ChallengeCard";
import { Badge } from "@/components/ui/badge";

export default function Challenges() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    checkAuth();
    fetchChallenges();
  }, [navigate]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("status", "active")
        .order("end_date", { ascending: true });

      if (error) throw error;

      // Fetch submission counts for each challenge
      const challengesWithCounts = await Promise.all(
        (data || []).map(async (challenge) => {
          const { count } = await supabase
            .from("challenge_submissions")
            .select("*", { count: "exact", head: true })
            .eq("challenge_id", challenge.id);

          return { ...challenge, submissionCount: count || 0 };
        })
      );

      setChallenges(challengesWithCounts);
    } catch (error: any) {
      console.error("Error fetching challenges:", error);
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter((challenge) => {
    const matchesDifficulty = selectedDifficulty === "all" || challenge.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "all" || challenge.category === selectedCategory;
    return matchesDifficulty && matchesCategory;
  });

  const activeChallenges = filteredChallenges.filter((c) => {
    const now = new Date();
    const end = new Date(c.end_date);
    return end > now;
  });

  const upcomingChallenges = filteredChallenges.filter((c) => {
    const now = new Date();
    const start = new Date(c.start_date);
    return start > now;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-secondary" />
              <h1 className="text-2xl font-display font-bold text-primary">Challenges</h1>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">{challenges.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
              <p className="text-2xl font-bold text-secondary">{activeChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
              <p className="text-2xl font-bold text-accent">{upcomingChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Upcoming</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Difficulty</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={selectedDifficulty === "all" ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedDifficulty("all")}
              >
                All
              </Badge>
              <Badge
                variant={selectedDifficulty === "beginner" ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedDifficulty("beginner")}
              >
                Beginner
              </Badge>
              <Badge
                variant={selectedDifficulty === "intermediate" ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedDifficulty("intermediate")}
              >
                Intermediate
              </Badge>
              <Badge
                variant={selectedDifficulty === "advanced" ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedDifficulty("advanced")}
              >
                Advanced
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-semibold">Category</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={selectedCategory === "all" ? "default" : "outline"}
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setSelectedCategory("all")}
              >
                All
              </Badge>
              {["lighting", "composition", "weather", "technique", "location"].map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className="cursor-pointer hover:scale-105 transition-transform capitalize"
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">
              <Zap className="w-4 h-4 mr-2" />
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              <Trophy className="w-4 h-4 mr-2" />
              Upcoming ({upcomingChallenges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No active challenges</p>
                <p className="text-sm text-muted-foreground">Check back soon for new challenges!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    submissionCount={challenge.submissionCount}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingChallenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No upcoming challenges</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={challenge}
                    submissionCount={challenge.submissionCount}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
