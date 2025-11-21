import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Camera, Trophy, Users, Calendar, Clock, CheckCircle2, ThumbsUp, ThumbsDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import BadgeDisplay from "@/components/challenges/BadgeDisplay";
import SubmitDialog from "@/components/challenges/SubmitDialog";

export default function ChallengeDetail() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
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
      // Fetch challenge details
      const { data: challengeData, error: challengeError } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single();

      if (challengeError) throw challengeError;
      setChallenge(challengeData);

      // Fetch submissions with user profiles
      const { data: submissionsData, error: submissionsError } = await supabase
        .from("challenge_submissions")
        .select(`
          *,
          photo:photos(*),
          profile:profiles(username, avatar_url)
        `)
        .eq("challenge_id", challengeId)
        .order("score", { ascending: false })
        .order("submitted_at", { ascending: true });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);

      // Check if current user has submitted
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userSub = submissionsData?.find((s) => s.user_id === session.user.id);
        setUserSubmission(userSub);
      }

      // Fetch associated badges (from prize description)
      const { data: badgesData } = await supabase
        .from("badges")
        .select("*")
        .limit(3);
      
      setBadges(badgesData || []);

      // Fetch user's votes for these submissions
      if (session && submissionsData) {
        const photoIds = submissionsData.map(s => s.photo_id);
        const { data: votesData } = await supabase
          .from("votes")
          .select("photo_id, vote_type")
          .eq("user_id", session.user.id)
          .in("photo_id", photoIds);
        
        if (votesData) {
          const votesMap: Record<string, string> = {};
          votesData.forEach(vote => {
            votesMap[vote.photo_id] = vote.vote_type;
          });
          setUserVotes(votesMap);
        }
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

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} remaining`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
    return "Challenge ended";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "advanced":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const handleVote = async (photoId: string, voteType: "upvote" | "downvote") => {
    if (!user) {
      sonnerToast.error("Please sign in to vote");
      navigate("/login");
      return;
    }

    try {
      const existingVote = userVotes[photoId];

      // If clicking the same vote type, remove the vote
      if (existingVote === voteType) {
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("photo_id", photoId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        const newVotes = { ...userVotes };
        delete newVotes[photoId];
        setUserVotes(newVotes);

        // Update submission score
        setSubmissions(prev => prev.map(sub => {
          if (sub.photo_id === photoId) {
            const scoreChange = voteType === "upvote" ? -1 : 1;
            return { ...sub, score: sub.score + scoreChange };
          }
          return sub;
        }));
      } else {
        // Insert or update vote
        const { error } = await supabase
          .from("votes")
          .upsert({
            photo_id: photoId,
            user_id: user.id,
            vote_type: voteType,
          }, {
            onConflict: "user_id,photo_id"
          });

        if (error) throw error;

        // Update local state
        setUserVotes(prev => ({ ...prev, [photoId]: voteType }));

        // Update submission score
        setSubmissions(prev => prev.map(sub => {
          if (sub.photo_id === photoId) {
            let scoreChange = voteType === "upvote" ? 1 : -1;
            if (existingVote) {
              scoreChange = voteType === "upvote" ? 2 : -2;
            }
            return { ...sub, score: sub.score + scoreChange };
          }
          return sub;
        }));

        // Update challenge_submission score
        const submission = submissions.find(s => s.photo_id === photoId);
        if (submission) {
          await supabase
            .from("challenge_submissions")
            .update({ score: submission.score + (voteType === "upvote" ? 1 : -1) })
            .eq("id", submission.id);
        }
      }

      sonnerToast.success(voteType === "upvote" ? "Upvoted!" : "Downvoted!");
    } catch (error: any) {
      console.error("Vote error:", error);
      sonnerToast.error("Failed to vote");
    }
  };

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
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/challenges")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Trophy className="w-6 h-6 text-secondary" />
          <h1 className="text-xl font-display font-bold text-primary">Challenge Details</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Challenge Hero */}
        <Card className="overflow-hidden mb-6 shadow-nature">
          <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <div className="text-center z-10">
              <h2 className="text-3xl font-bold text-foreground mb-2">{challenge.title}</h2>
              <div className="flex gap-2 justify-center flex-wrap">
                <Badge className={getDifficultyColor(challenge.difficulty)}>
                  {challenge.difficulty}
                </Badge>
                <Badge variant="outline">{challenge.category}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeRemaining()}
                </Badge>
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            <p className="text-muted-foreground leading-relaxed">{challenge.description}</p>

            {/* Challenge Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 bg-secondary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Start Date</span>
                </div>
                <p className="text-sm font-semibold">{formatDate(challenge.start_date)}</p>
              </Card>
              <Card className="p-4 bg-secondary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">End Date</span>
                </div>
                <p className="text-sm font-semibold">{formatDate(challenge.end_date)}</p>
              </Card>
              <Card className="p-4 bg-secondary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Participants</span>
                </div>
                <p className="text-sm font-semibold">{submissions.length}</p>
              </Card>
              <Card className="p-4 bg-secondary/5">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Max Entries</span>
                </div>
                <p className="text-sm font-semibold">{challenge.max_submissions}</p>
              </Card>
            </div>

            {/* Requirements */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Requirements</h3>
              </div>
              <p className="text-sm text-muted-foreground">{challenge.requirements}</p>
            </div>

            {/* Prize */}
            {challenge.prize_description && (
              <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="w-5 h-5 text-secondary" />
                  <h3 className="font-semibold text-foreground">Prize</h3>
                </div>
                <p className="text-sm text-muted-foreground">{challenge.prize_description}</p>
              </div>
            )}

            {/* Action Button */}
            {!userSubmission ? (
              <SubmitDialog challengeId={challenge.id} onSuccess={fetchChallengeData}>
                <Button size="lg" className="w-full shadow-glow">
                  <Camera className="w-5 h-5 mr-2" />
                  Submit Entry
                </Button>
              </SubmitDialog>
            ) : (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  You have submitted an entry
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="gallery" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="gallery">
              <Camera className="w-4 h-4 mr-2" />
              Gallery ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="leaderboard">
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Trophy className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            {submissions.length === 0 ? (
              <Card className="p-12 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No submissions yet</p>
                <p className="text-sm text-muted-foreground">Be the first to take on this challenge!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {submissions.map((submission, index) => (
                  <Card key={submission.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-square bg-muted">
                      {submission.photo?.image_url ? (
                        <img
                          src={submission.photo.image_url}
                          alt={`Submission by ${submission.profile?.username || "Anonymous"}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Camera className="w-12 h-12 text-muted-foreground opacity-20" />
                        </div>
                      )}
                      {index < 3 && (
                        <div className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          index === 0 ? "bg-amber-500 text-white" :
                          index === 1 ? "bg-gray-400 text-white" :
                          "bg-amber-700 text-white"
                        }`}>
                          {index + 1}
                        </div>
                      )}
                      {submission.is_winner && (
                        <div className="absolute top-2 left-2 bg-secondary text-secondary-foreground rounded-full p-2">
                          <Trophy className="w-4 h-4" />
                        </div>
                      )}
                      
                      {/* Voting Buttons - Only show if not user's own submission */}
                      {user && submission.user_id !== user.id && (
                        <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="icon"
                            variant={userVotes[submission.photo_id] === "upvote" ? "default" : "secondary"}
                            className="h-8 w-8 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(submission.photo_id, "upvote");
                            }}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant={userVotes[submission.photo_id] === "downvote" ? "default" : "secondary"}
                            className="h-8 w-8 shadow-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVote(submission.photo_id, "downvote");
                            }}
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="font-semibold text-sm truncate">{submission.profile?.username || "Anonymous"}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-semibold text-primary">{submission.score} pts</span>
                        <span>{new Date(submission.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                      </div>
                      {submission.photo?.caption && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {submission.photo.caption}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            {submissions.length === 0 ? (
              <Card className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No submissions yet</p>
                <p className="text-sm text-muted-foreground">Be the first to take on this challenge!</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {submissions.map((submission, index) => (
                  <Card key={submission.id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        index === 0 ? "bg-amber-500 text-white" :
                        index === 1 ? "bg-gray-400 text-white" :
                        index === 2 ? "bg-amber-700 text-white" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{submission.profile?.username || "Anonymous"}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{submission.score} points</span>
                          <span>•</span>
                          <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                          {submission.is_winner && (
                            <>
                              <span>•</span>
                              <Trophy className="w-3 h-3 text-secondary" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="badges" className="space-y-4">
            {badges.length === 0 ? (
              <Card className="p-12 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No badges available</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {badges.map((badge) => (
                  <BadgeDisplay key={badge.id} badge={badge} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}