import * as React from "react";
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
  const [challenge, setChallenge] = React.useState<any>(null);
  const [submissions, setSubmissions] = React.useState<any[]>([]);
  const [userSubmission, setUserSubmission] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [judgingLoading, setJudgingLoading] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
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

    if (submissions.length < 3) {
      sonnerToast.error("Need at least 3 participants to judge");
      return;
    }

    if (submissions.length > 10) {
      sonnerToast.error("Maximum 10 participants allowed");
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
    <div className="min-h-screen flex flex-col bg-gradient-soft">
      <header className="sticky top-0 flex-shrink-0 bg-card/95 backdrop-blur-lg border-b border-border z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/challenges")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Trophy className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-display font-bold">Challenge Details</h1>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <Card className="overflow-hidden shadow-elevated">
          <div className="relative h-24 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center z-10 px-4">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{challenge.title}</h2>
              <div className="flex gap-2 justify-center flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {challenge.points_reward} points
                </Badge>
                {challenge.status === "completed" && (
                  <Badge variant="secondary" className="text-xs">Completed</Badge>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">{challenge.description}</p>

            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <div className="flex items-center gap-2 mb-1">
                <Camera className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold">Challenge Prompt</h3>
              </div>
              <p className="text-sm">{challenge.challenge_prompt}</p>
            </div>

            <div className="bg-secondary/5 rounded-lg p-3 border border-secondary/10">
              <h3 className="text-sm font-semibold mb-2">🏆 Point Distribution</h3>
              <div className="space-y-1 text-xs">
                <p>🥇 1st Place: <span className="font-bold text-primary">{challenge.points_reward} pts</span></p>
                <p>🥈 2nd Place: <span className="font-bold text-primary">{Math.round(challenge.points_reward * 0.6)} pts</span></p>
                <p>🥉 3rd Place: <span className="font-bold text-primary">{Math.round(challenge.points_reward * 0.3)} pts</span></p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 bg-secondary/5">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Ends</span>
                </div>
                <p className="text-xs font-semibold">{formatDate(challenge.end_date)}</p>
                <p className="text-xs text-muted-foreground">{formatTimeRemaining()}</p>
              </Card>
              <Card className="p-3 bg-secondary/5">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Participants</span>
                </div>
                <p className="text-xs font-semibold">{submissions.length}</p>
              </Card>
            </div>

            {challenge.winner && (
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg p-3 border-2 border-yellow-400/30">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">Winner</p>
                    <p className="text-xs text-yellow-800 dark:text-yellow-200">{challenge.winner.username}</p>
                  </div>
                </div>
              </div>
            )}

            {canJudge && (
              <Button 
                size="sm" 
                className="w-full shadow-glow" 
                onClick={handleJudge}
                disabled={judgingLoading || submissions.length < 3}
              >
                {judgingLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI is Judging...
                  </>
                ) : submissions.length < 3 ? (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Need {3 - submissions.length} More
                  </>
                ) : (
                  <>
                    <Trophy className="w-4 h-4 mr-2" />
                    Judge with AI
                  </>
                )}
              </Button>
            )}

            {challenge.auto_judge_scheduled && challenge.status === "active" && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
                  ⏰ Auto-judging scheduled - Ready to judge!
                </p>
              </div>
            )}

            {!userSubmission && challenge.status === "active" && new Date(challenge.end_date) > new Date() && (
              <SubmitDialog challengeId={challenge.id} onSuccess={fetchChallengeData}>
                <Button size="sm" className="w-full shadow-glow">
                  <Camera className="w-4 h-4 mr-2" />
                  Submit Entry
                </Button>
              </SubmitDialog>
            )}

            {userSubmission && (
              <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">
                  Entry submitted
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="submissions" className="text-sm">
              <Camera className="w-4 h-4 mr-2" />
              Submissions ({submissions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="submissions">
            {submissions.length === 0 ? (
              <Card className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm font-medium text-muted-foreground">No submissions yet</p>
                <p className="text-xs text-muted-foreground">Be the first to submit!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <div className="absolute top-2 right-2">
                              <Badge 
                                className={
                                  submission.rank === 1 
                                    ? "bg-yellow-500 text-white text-xs" 
                                    : submission.rank === 2 
                                    ? "bg-gray-400 text-white text-xs" 
                                    : submission.rank === 3 
                                    ? "bg-orange-600 text-white text-xs"
                                    : "bg-muted text-xs"
                                }
                              >
                                #{submission.rank}
                              </Badge>
                            </div>
                          )}
                        </div>
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={submission.profile.avatar_url || undefined} />
                              <AvatarFallback className="text-xs">{submission.profile.username[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{submission.profile.username}</p>
                              {submission.ai_score && (
                                <p className="text-xs text-primary font-medium">
                                  Score: {submission.ai_score}/100
                                </p>
                              )}
                            </div>
                          </div>
                          {submission.photo.caption && (
                            <p className="text-xs text-muted-foreground line-clamp-2">{submission.photo.caption}</p>
                          )}
                          {submission.ai_feedback && (
                            <div className="bg-primary/5 rounded-lg p-2 border border-primary/10">
                              <p className="text-xs font-semibold text-primary mb-1">AI Feedback:</p>
                              <p className="text-xs text-muted-foreground line-clamp-3">{submission.ai_feedback}</p>
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
        </div>
      </main>
    </div>
  );
}