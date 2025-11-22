import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface VoteButtonsProps {
  photoId: string;
  currentUserId?: string;
}

export const VoteButtons = ({ photoId, currentUserId }: VoteButtonsProps) => {
  const [userVote, setUserVote] = useState<string | null>(null);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadVotes();
  }, [photoId, currentUserId]);

  const loadVotes = async () => {
    const { data: votes } = await supabase
      .from("votes")
      .select("*")
      .eq("photo_id", photoId);

    if (votes) {
      setUpvotes(votes.filter(v => v.vote_type === "upvote").length);
      setDownvotes(votes.filter(v => v.vote_type === "downvote").length);
      
      if (currentUserId) {
        const myVote = votes.find(v => v.user_id === currentUserId);
        setUserVote(myVote?.vote_type || null);
      }
    }
  };

  const handleVote = async (voteType: "upvote" | "downvote") => {
    if (!currentUserId) {
      toast({ title: "Please login to vote", variant: "destructive" });
      return;
    }

    if (voteType === "downvote" && userVote !== "downvote") {
      setShowFeedbackDialog(true);
      return;
    }

    await submitVote(voteType, "");
  };

  const submitVote = async (voteType: string, feedbackText: string) => {
    if (userVote === voteType) {
      // Remove vote
      await supabase
        .from("votes")
        .delete()
        .eq("photo_id", photoId)
        .eq("user_id", currentUserId);
      setUserVote(null);
    } else {
      // Upsert vote
      await supabase
        .from("votes")
        .upsert({
          photo_id: photoId,
          user_id: currentUserId,
          vote_type: voteType,
          feedback: feedbackText || null,
        }, {
          onConflict: "user_id,photo_id"
        });
      setUserVote(voteType);
    }

    await loadVotes();
    setShowFeedbackDialog(false);
    setFeedback("");
  };

  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleVote("upvote")}
          className={userVote === "upvote" ? "text-primary" : ""}
        >
          <ThumbsUp className="w-4 h-4 mr-1" />
          {upvotes}
        </Button>
      </motion.div>

      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogTrigger asChild>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote("downvote")}
              className={userVote === "downvote" ? "text-destructive" : ""}
            >
              <ThumbsDown className="w-4 h-4 mr-1" />
              {downvotes}
            </Button>
          </motion.div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Constructive Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Help the creator improve by sharing constructive feedback
            </p>
            <Textarea
              placeholder="What could be improved? (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={() => submitVote("downvote", feedback)}
              className="w-full"
            >
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
