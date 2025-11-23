import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import InviteFriendsDialog from "./InviteFriendsDialog";

interface CreateChallengeDialogProps {
  children: React.ReactNode;
  onSuccess?: () => void;
}

export default function CreateChallengeDialog({ children, onSuccess }: CreateChallengeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [challengePrompt, setChallengePrompt] = useState("");
  const [endDate, setEndDate] = useState<Date>();
  const [pointsReward, setPointsReward] = useState(100);
  const [minParticipants] = useState(10); // Fixed at 10 minimum
  const [createdChallengeId, setCreatedChallengeId] = useState<string | null>(null);
  const [showInviteFriends, setShowInviteFriends] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !challengePrompt || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in");
        return;
      }

      const { data, error } = await supabase
        .from("friend_challenges")
        .insert({
          creator_id: session.user.id,
          title,
          description,
          challenge_prompt: challengePrompt,
          end_date: endDate.toISOString(),
          points_reward: pointsReward,
          min_participants: minParticipants,
          status: "active"
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically add creator as participant
      await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: data.id,
          user_id: session.user.id
        });

      setCreatedChallengeId(data.id);
      setShowInviteFriends(true);
      toast.success("Challenge created!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setChallengePrompt("");
      setEndDate(undefined);
      setPointsReward(100);
    } catch (error: any) {
      console.error("Error creating challenge:", error);
      toast.error("Failed to create challenge");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteComplete = () => {
    setShowInviteFriends(false);
    setOpen(false);
    setCreatedChallengeId(null);
    onSuccess?.();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Friend Challenge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Challenge Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Golden Hour Challenge"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Let's see who can capture the best golden hour photo!"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="prompt">Challenge Prompt *</Label>
              <Input
                id="prompt"
                value={challengePrompt}
                onChange={(e) => setChallengePrompt(e.target.value)}
                placeholder="Capture the best golden hour photo"
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="points">Points Reward</Label>
              <Input
                id="points"
                type="number"
                value={pointsReward}
                onChange={(e) => setPointsReward(parseInt(e.target.value))}
                min={10}
                max={1000}
              />
              <p className="text-xs text-muted-foreground mt-1">
                🥇 1st: {pointsReward} pts | 🥈 2nd: {Math.round(pointsReward * 0.6)} pts | 🥉 3rd: {Math.round(pointsReward * 0.3)} pts
              </p>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="text-sm font-medium mb-1">⚠️ Minimum Participants: 10 friends</p>
              <p className="text-xs text-muted-foreground">
                You'll need to invite at least 10 friends to compete in this challenge
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Challenge"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {createdChallengeId && (
        <InviteFriendsDialog
          challengeId={createdChallengeId}
          open={showInviteFriends}
          onOpenChange={(open) => {
            if (!open) handleInviteComplete();
          }}
        />
      )}
    </>
  );
}