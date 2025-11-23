import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Moon, Sun, Plus } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "@/components/notifications/NotificationBell";
import { motion } from "framer-motion";
import CreateChallengeDialog from "@/components/challenges/CreateChallengeDialog";

export default function Challenges() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchChallenges();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUserId(session.user.id);
  };

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch challenges created by user
      const { data: createdChallenges, error: createdError } = await supabase
        .from("friend_challenges")
        .select(`
          *,
          creator:profiles!creator_id(username, avatar_url)
        `)
        .eq("creator_id", session.user.id);

      if (createdError) throw createdError;

      // Fetch challenges user is participating in
      const { data: participantData, error: participantError } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", session.user.id);

      if (participantError) throw participantError;

      const participantChallengeIds = participantData?.map(p => p.challenge_id) || [];
      
      let participatedChallenges = [];
      if (participantChallengeIds.length > 0) {
        const { data: participatedData, error: participatedError } = await supabase
          .from("friend_challenges")
          .select(`
            *,
            creator:profiles!creator_id(username, avatar_url)
          `)
          .in("id", participantChallengeIds);

        if (participatedError) throw participatedError;
        participatedChallenges = participatedData || [];
      }

      // Combine and deduplicate
      const allChallenges = [...(createdChallenges || []), ...participatedChallenges];
      const uniqueChallenges = Array.from(
        new Map(allChallenges.map(c => [c.id, c])).values()
      );

      // Get participant counts
      const challengesWithCounts = await Promise.all(
        uniqueChallenges.map(async (challenge) => {
          const { count } = await supabase
            .from("challenge_participants")
            .select("*", { count: "exact", head: true })
            .eq("challenge_id", challenge.id);

          return {
            ...challenge,
            participants: [{ count: count || 0 }]
          };
        })
      );

      challengesWithCounts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

  const activeChallenges = challenges.filter((c) => c.status === "active" && new Date(c.end_date) > new Date());
  const completedChallenges = challenges.filter((c) => c.status === "completed");

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
              <Trophy className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-display font-bold">Friend Challenges</h1>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
              <p className="text-2xl font-bold text-primary">{activeChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary/5 border border-secondary/10">
              <p className="text-2xl font-bold text-secondary">{completedChallenges.length}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <CreateChallengeDialog onSuccess={fetchChallenges}>
          <Button size="lg" className="w-full mb-6 shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Create New Challenge
          </Button>
        </CreateChallengeDialog>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">Active ({activeChallenges.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedChallenges.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No active challenges</p>
                <p className="text-sm text-muted-foreground">Create a challenge to compete with friends!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                     <Card
                      className="cursor-pointer hover:shadow-elevated transition-all"
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="text-base font-bold mb-1">{challenge.title}</h3>
                            <p className="text-xs text-muted-foreground mb-1 line-clamp-1">{challenge.description}</p>
                            <p className="text-xs text-primary font-medium line-clamp-1">{challenge.challenge_prompt}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">{challenge.points_reward} pts</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{challenge.creator.username}</span>
                          <span>•</span>
                          <span>{challenge.participants?.[0]?.count || 0} joined</span>
                          <span>•</span>
                          <span>{new Date(challenge.end_date).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedChallenges.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No completed challenges</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedChallenges.map((challenge) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card
                      className="cursor-pointer hover:shadow-elevated transition-all opacity-75"
                      onClick={() => navigate(`/challenges/${challenge.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-bold">{challenge.title}</h3>
                              <Badge variant="secondary" className="text-xs">Completed</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-1">{challenge.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{challenge.creator.username}</span>
                          {challenge.winner_id && <><span>•</span><span className="text-primary">Winner!</span></>}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
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