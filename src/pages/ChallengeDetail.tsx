import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Camera, Trophy, Users, Calendar, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import SubmitDialog from "@/components/challenges/SubmitDialog";
import { motion, AnimatePresence } from "framer-motion";
import { useConfetti } from "@/hooks/useConfetti";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ChallengeDetail() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { celebrateTopThree } = useConfetti();
  const [challenge, setChallenge] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [judgingLoading, setJudgingLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
    if (challengeId) {
      fetchChallengeData();
    }
  }, [challengeId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
  };

  const fetchChallengeData = async () => {
    setLoading(true);
    try {
      const { data: challengeData, error: challengeError } = await supabase
        .from("friend_challenges")
        .select(`
          *,
          creator:profiles!creator_id(username, avatar_url),
          winner:profiles!winner_id(username, avatar_url)
        `)
        .eq("id", challengeId)
        .single();

      if (challengeError) throw challengeError;
      setChallenge(challengeData);

      const { data: submissionsData, error: submissionsError } = await supabase
        .from("challenge_submissions")
        .select(`
          *,
          photo:photos(*),
          profile:profiles!user_id(username, avatar_url)
        `)
        .eq("challenge_id", challengeId)
        .order("ai_score", { ascending: false, nullsFirst: false })
        .order("submitted_at", { ascending: true });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userSub = submissionsData?.find((s) => s.user_id === session.user.id);
        setUserSubmission(userSub);
      }
    } catch (error: any) {
      console.error("Error fetching challenge:", error);
      toast({
        title: "Error",
        description: "Failed to load challenge details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJudge = async () => {
    if (submissions.length === 0) {
      sonnerToast.error("No submissions to judge");
      return;
    }

    setJudgingLoading(true);
    try {
      const { error } = await supabase.functions.invoke('judge-challenge', {
        body: { challengeId: challenge.id }
      });

      if (error) throw error;

      sonnerToast.success("Challenge judged! Winner announced!");
      await fetchChallengeData();
      
      // Celebrate if user won
      if (userSubmission && challenge.winner_id === userSubmission.user_id) {
        celebrateTopThree(1);
      }
    } catch (error: any) {
      console.error("Error judging challenge:", error);
      sonnerToast.error("Failed to judge challenge");
    } finally {
      setJudgingLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTimeRemaining = () => {
    if (!challenge) return "";
    const now = new Date();
    const end = new Date(challenge.end_date);
    const diff = end.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (diff < 0) return "Challenge ended";
    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
    return "Ending soon";
  };

  const isCreator = user && challenge && user.id === challenge.creator_id;
  const canJudge = isCreator && challenge?.status === "active" && new Date(challenge.end_date) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">Challenge not found</p>
          <Button onClick={() => navigate("/challenges")} className="mt-4">
            Back to Challenges
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/challenges")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Trophy className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-display font-bold">Challenge Details</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Card className="overflow-hidden mb-6 shadow-elevated">
          <div className="relative h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center z-10">
              <h2 className="text-3xl font-bold text-foreground mb-2">{challenge.title}</h2>
              <div className="flex gap-2 justify-center flex-wrap">
                <Badge variant="outline">
                  {challenge.points_reward} points
                </Badge>
                {challenge.status === "completed" && (
                  <Badge variant="secondary">Completed</Badge>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <p className="text-muted-foreground">{challenge.description}</p>

            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Challenge Prompt</h3>
              </div>
              <p className="text-sm">{challenge.challenge_prompt}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-secondary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ends</span>
                </div>
                <p className="text-sm font-semibold">{formatDate(challenge.end_date)}</p>
                <p className="text-xs text-muted-foreground">{formatTimeRemaining()}</p>
              </Card>
              <Card className="p-4 bg-secondary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Participants</span>
                </div>
                <p className="text-sm font-semibold">{submissions.length}</p>
              </Card>
            </div>

            {challenge.winner && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-4 border-2 border-yellow-400/30">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">Winner</p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">{challenge.winner.username}</p>
                  </div>
                </div>
              </div>
            )}

            {canJudge && (
              <Button 
                size="lg" 
                className="w-full shadow-glow" 
                onClick={handleJudge}
                disabled={judgingLoading}
              >
                {judgingLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Judging...
                  </>
                ) : (
                  <>
                    <Trophy className="w-5 h-5 mr-2" />
                    Judge Challenge with AI
                  </>
                )}
              </Button>
            )}

            {!userSubmission && challenge.status === "active" && new Date(challenge.end_date) > new Date() && (
              <SubmitDialog challengeId={challenge.id} onSuccess={fetchChallengeData}>
                <Button size="lg" className="w-full shadow-glow">
                  <Camera className="w-5 h-5 mr-2" />
                  Submit Entry
                </Button>
              </SubmitDialog>
            )}

            {userSubmission && (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  You have submitted an entry
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="submissions">
              <Camera className="w-4 h-4 mr-2" />
              Submissions ({submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            {submissions.length === 0 ? (
              <Card className="p-12 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No submissions yet</p>
                <p className="text-sm text-muted-foreground">Be the first to submit!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {submissions.map((submission, index) => (
                    <motion.div
                      key={submission.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden hover:shadow-elevated transition-all">
                        <div className="relative aspect-square">
                          <img
                            src={submission.photo.image_url}
                            alt={submission.photo.caption || "Submission"}
                            className="w-full h-full object-cover"
                          />
                          {submission.rank && (
                            <div className="absolute top-3 right-3">
                              <Badge 
                                className={
                                  submission.rank === 1 
                                    ? "bg-yellow-500 text-white" 
                                    : submission.rank === 2 
                                    ? "bg-gray-400 text-white" 
                                    : submission.rank === 3 
                                    ? "bg-orange-600 text-white"
                                    : "bg-muted"
                                }
                              >
                                #{submission.rank}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={submission.profile.avatar_url || undefined} />
                              <AvatarFallback>{submission.profile.username[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">{submission.profile.username}</p>
                              {submission.ai_score && (
                                <p className="text-sm text-primary font-medium">
                                  Score: {submission.ai_score}/100
                                </p>
                              )}
                            </div>
                          </div>
                          {submission.photo.caption && (
                            <p className="text-sm text-muted-foreground">{submission.photo.caption}</p>
                          )}
                          {submission.ai_feedback && (
                            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                              <p className="text-xs font-semibold text-primary mb-1">AI Feedback:</p>
                              <p className="text-xs text-muted-foreground">{submission.ai_feedback}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}