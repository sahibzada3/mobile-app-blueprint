import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface ContributionSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chainId: string;
  photoId: string;
  photoUrl: string;
}

export default function ContributionSubmitDialog({
  open,
  onOpenChange,
  chainId,
  photoId,
  photoUrl,
}: ContributionSubmitDialogProps) {
  const [caption, setCaption] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please login to contribute");
        return;
      }

      // Add contribution to chain
      const { error } = await supabase
        .from("chain_contributions")
        .insert({
          chain_id: chainId,
          user_id: session.user.id,
          photo_id: photoId,
        });

      if (error) throw error;

      // Update photo caption if provided
      if (caption.trim()) {
        await supabase
          .from("photos")
          .update({ caption: caption.trim() })
          .eq("id", photoId);
      }

      toast.success("Contribution added successfully! 🎉");
      onOpenChange(false);
      navigate(`/spotlight/${chainId}`);
    } catch (error: any) {
      toast.error("Failed to add contribution");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add to Spotlight Chain
          </DialogTitle>
          <DialogDescription>
            Your photo will be shared with all chain participants
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary/20"
          >
            <img
              src={photoUrl}
              alt="Your contribution"
              className="w-full h-full object-cover"
            />
          </motion.div>

          <div className="space-y-2">
            <Label htmlFor="caption">Caption (Optional)</Label>
            <Textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Share your thoughts about this photo..."
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {caption.length}/200 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add to Chain
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
