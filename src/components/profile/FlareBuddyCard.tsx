import * as React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, Sparkles, Star } from "lucide-react";
import { useConfetti } from "@/hooks/useConfetti";

interface FlareBuddy {
  id: string;
  username: string;
  avatar_url: string | null;
  interactionCount: number;
  sharedChains: number;
  sharedChallenges: number;
}

interface FlareBuddyCardProps {
  userId: string;
  compact?: boolean;
}

export default function FlareBuddyCard({ userId, compact = false }: FlareBuddyCardProps) {
  const navigate = useNavigate();
  const { celebrate } = useConfetti();
  const [flareBuddy, setFlareBuddy] = React.useState<FlareBuddy | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const hasTriggeredConfetti = React.useRef(false);

  React.useEffect(() => {
    calculateFlareBuddy();
  }, [userId]);

  const calculateFlareBuddy = async () => {
    try {
      // Get all accepted friends
      const { data: friendships } = await supabase
        .from("friendships")
        .select("friend_id, user_id")
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq("status", "accepted");

      if (!friendships || friendships.length === 0) {
        setLoading(false);
        return;
      }

      const friendIds = friendships.map(f => 
        f.user_id === userId ? f.friend_id : f.user_id
      );

      // Count interactions per friend
      const interactionCounts: { [friendId: string]: { chains: number; challenges: number } } = {};
      
      for (const friendId of friendIds) {
        interactionCounts[friendId] = { chains: 0, challenges: 0 };
      }

      // Get chains where user participates
      const { data: userChains } = await supabase
        .from("chain_participants")
        .select("chain_id")
        .eq("user_id", userId);

      const userChainIds = userChains?.map(c => c.chain_id) || [];

      // Count shared chains with each friend
      if (userChainIds.length > 0) {
        for (const friendId of friendIds) {
          const { data: friendChains } = await supabase
            .from("chain_participants")
            .select("chain_id")
            .eq("user_id", friendId)
            .in("chain_id", userChainIds);
          
          interactionCounts[friendId].chains = friendChains?.length || 0;
        }
      }

      // Get challenges where user participates
      const { data: userChallenges } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", userId);

      const userChallengeIds = userChallenges?.map(c => c.challenge_id) || [];

      // Count shared challenges with each friend
      if (userChallengeIds.length > 0) {
        for (const friendId of friendIds) {
          const { data: friendChallenges } = await supabase
            .from("challenge_participants")
            .select("challenge_id")
            .eq("user_id", friendId)
            .in("challenge_id", userChallengeIds);
          
          interactionCounts[friendId].challenges = friendChallenges?.length || 0;
        }
      }

      // Find the friend with most interactions
      let maxInteractions = 0;
      let buddyId = "";

      for (const friendId of friendIds) {
        const total = interactionCounts[friendId].chains + interactionCounts[friendId].challenges;
        if (total > maxInteractions) {
          maxInteractions = total;
          buddyId = friendId;
        }
      }

      if (buddyId && maxInteractions > 0) {
        // Get buddy profile
        const { data: buddyProfile } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", buddyId)
          .single();

        if (buddyProfile) {
          // Check if this is the first time finding a buddy
          const buddyKey = `flare_buddy_celebrated_${userId}`;
          const hasCelebrated = localStorage.getItem(buddyKey);
          
          setFlareBuddy({
            ...buddyProfile,
            interactionCount: maxInteractions,
            sharedChains: interactionCounts[buddyId].chains,
            sharedChallenges: interactionCounts[buddyId].challenges,
          });
          
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
          
          // Trigger confetti for first buddy discovery
          if (!hasCelebrated && !hasTriggeredConfetti.current) {
            hasTriggeredConfetti.current = true;
            setTimeout(() => {
              celebrate('high');
              localStorage.setItem(buddyKey, 'true');
            }, 500);
          }
        }
      }
    } catch (error) {
      console.error("Error calculating flare buddy:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  // Placeholder when no buddy exists
  if (!flareBuddy) {
    if (compact) {
      return (
        <div 
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border/50 cursor-pointer hover:bg-muted/70 transition-colors"
          onClick={() => navigate("/spotlight")}
        >
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent/60" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-accent font-medium">Find Your Flare Buddy</p>
            <p className="text-sm text-muted-foreground">Start a chain with friends</p>
          </div>
          <Sparkles className="w-5 h-5 text-muted-foreground/50" />
        </div>
      );
    }

    return (
      <Card className="relative overflow-hidden border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-primary/5" />
        <CardContent className="p-5 relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-accent/60" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Find Your Flare Buddy</h3>
              <p className="text-xs text-muted-foreground">Collaborate to unlock</p>
            </div>
          </div>

          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Sparkles className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Your Flare Buddy is the friend you share the most chains and challenges with
            </p>
            <button
              onClick={() => navigate("/spotlight")}
              className="px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-sm font-medium"
            >
              Start a Flare Chain
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (compact) {
    return (
      <div 
        className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20 border border-accent/30 cursor-pointer hover:scale-[1.02] transition-transform"
        onClick={() => navigate(`/profile/${flareBuddy.id}`)}
      >
        <div className="relative">
          <Avatar className="w-10 h-10 ring-2 ring-accent shadow-lg">
            <AvatarImage src={flareBuddy.avatar_url || ""} />
            <AvatarFallback className="bg-accent text-accent-foreground">
              {flareBuddy.username[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
            <Zap className="w-3 h-3 text-accent-foreground" fill="currentColor" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-accent font-medium">Your Flare Buddy</p>
          <p className="font-semibold text-foreground truncate">{flareBuddy.username}</p>
        </div>
        <Sparkles className="w-5 h-5 text-accent animate-pulse" />
      </div>
    );
  }

  return (
    <Card className="relative overflow-hidden border-accent/30 shadow-lg">
      {/* Celebration particles */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 2 === 0 ? 'hsl(var(--accent))' : 'hsl(var(--primary))',
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animation: `confettiFall ${1 + Math.random() * 2}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/10" />
      
      {/* Sparkle decorations */}
      <div className="absolute top-2 right-2 opacity-60">
        <Sparkles className="w-6 h-6 text-accent animate-pulse" />
      </div>
      <div className="absolute bottom-2 left-2 opacity-40">
        <Star className="w-4 h-4 text-primary animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>

      <CardContent className="p-5 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-accent" fill="currentColor" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Your Flare Buddy</h3>
            <p className="text-xs text-muted-foreground">Most active friend</p>
          </div>
        </div>

        <div 
          className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate(`/profile/${flareBuddy.id}`)}
        >
          <div className="relative">
            <Avatar className="w-16 h-16 ring-4 ring-accent/50 shadow-xl">
              <AvatarImage src={flareBuddy.avatar_url || ""} />
              <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white text-xl">
                {flareBuddy.username[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-accent flex items-center justify-center shadow-lg">
              <Trophy className="w-4 h-4 text-accent-foreground" />
            </div>
          </div>
          
          <div className="flex-1">
            <p className="font-bold text-lg text-foreground">{flareBuddy.username}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
                {flareBuddy.interactionCount} interactions
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{flareBuddy.sharedChains} shared flares</span>
              <span>•</span>
              <span>{flareBuddy.sharedChallenges} challenges together</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-accent/10 border border-accent/20">
          <p className="text-sm text-center text-foreground/80">
            <Sparkles className="w-4 h-4 inline mr-1 text-accent" />
            You two are on fire! Keep creating together
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
