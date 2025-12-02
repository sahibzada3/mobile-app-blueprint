import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Zap, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useConfetti } from "@/hooks/useConfetti";
import { motion } from "framer-motion";

interface VoteButtonsProps {
  photoId: string;
  currentUserId?: string;
}

export function VoteButtons({ photoId, currentUserId }: VoteButtonsProps) {
  const [flareCount, setFlareCount] = React.useState(0);
  const [commentCount, setCommentCount] = React.useState(0);
  const [hasFlared, setHasFlared] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const { celebrate } = useConfetti();

  React.useEffect(() => {
    loadVotesAndComments();
    checkUserVote();

    // Subscribe to real-time vote changes
    const votesChannel = supabase
      .channel(`votes-${photoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: `photo_id=eq.${photoId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new.vote_type === 'upvote') {
            setFlareCount(prev => {
              const newCount = prev + 1;
              checkMilestone(newCount);
              return newCount;
            });
          } else if (payload.eventType === 'DELETE' && payload.old.vote_type === 'upvote') {
            setFlareCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // Subscribe to real-time comment changes
    const commentsChannel = supabase
      .channel(`comments-${photoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `photo_id=eq.${photoId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setCommentCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setCommentCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(commentsChannel);
    };
  }, [photoId, currentUserId]);

  const checkMilestone = (count: number) => {
    // Celebrate milestones: 10, 25, 50, 100, 250, 500, 1000
    const milestones = [10, 25, 50, 100, 250, 500, 1000];
    if (milestones.includes(count)) {
      celebrate();
      toast.success(`⚡ ${count} flares milestone reached!`, {
        duration: 3000,
      });
    }
  };

  const loadVotesAndComments = async () => {
    try {
      // Load like count
      const { count: likesCount } = await supabase
        .from("votes")
        .select("*", { count: "exact", head: true })
        .eq("photo_id", photoId)
        .eq("vote_type", "upvote");

      setFlareCount(likesCount || 0);

      // Load comment count
      const { count: commentsCount } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("photo_id", photoId);

      setCommentCount(commentsCount || 0);
    } catch (error) {
      console.error("Error loading counts:", error);
    }
  };

  const checkUserVote = async () => {
    if (!currentUserId) return;

    try {
      const { data } = await supabase
        .from("votes")
        .select("*")
        .eq("photo_id", photoId)
        .eq("user_id", currentUserId)
        .eq("vote_type", "upvote")
        .maybeSingle();

      setHasFlared(!!data);
    } catch (error) {
      console.error("Error checking vote:", error);
    }
  };

  const handleFlare = async () => {
    if (!currentUserId) {
      toast.error("Please log in to flare photos");
      return;
    }

    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);

    try {
      if (hasFlared) {
        // Remove flare
        const { error } = await supabase
          .from("votes")
          .delete()
          .eq("photo_id", photoId)
          .eq("user_id", currentUserId)
          .eq("vote_type", "upvote");

        if (error) throw error;
        setHasFlared(false);
      } else {
        // Add flare
        const { error } = await supabase
          .from("votes")
          .insert({
            photo_id: photoId,
            user_id: currentUserId,
            vote_type: "upvote",
          });

        if (error) throw error;
        setHasFlared(true);
      }
    } catch (error: any) {
      console.error("Error toggling flare:", error);
      toast.error("Failed to update flare");
    }
  };

  return (
    <div className="flex items-center gap-4">
      <motion.div
        className="flex items-center gap-2"
        animate={isAnimating ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={handleFlare}
          className="h-9 w-9 hover:bg-muted/60 rounded-lg transition-all duration-200 relative"
        >
          <motion.div
            animate={hasFlared ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            <Zap
              className={`w-6 h-6 transition-all duration-200 ${
                hasFlared
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
              strokeWidth={hasFlared ? 0 : 2}
            />
          </motion.div>
          
          {/* Zap burst animation on flare */}
          {isAnimating && hasFlared && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Zap className="w-6 h-6 fill-yellow-400 text-yellow-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </motion.div>
          )}
        </Button>
        
        <span className="text-sm font-semibold text-foreground min-w-[32px]">
          <AnimatedCounter value={flareCount} />
        </span>
      </motion.div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 hover:bg-muted/60 rounded-lg transition-all duration-200"
        >
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
        </Button>
        <span className="text-sm font-semibold text-foreground min-w-[32px]">
          <AnimatedCounter value={commentCount} />
        </span>
      </div>
    </div>
  );
}
