import * as React from "react";
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
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [challengePrompt, setChallengePrompt] = React.useState("");
  const [endDate, setEndDate] = React.useState<Date>();
  const [pointsReward, setPointsReward] = React.useState(150);
  const [minParticipants] = React.useState(3); // Fixed at 3 minimum
  const [maxParticipants] = React.useState(10); // Fixed at 10 maximum
  const [createdChallengeId, setCreatedChallengeId] = React.useState<string | null>(null);
  const [showInviteFriends, setShowInviteFriends] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !challengePrompt || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (pointsReward < 100 || pointsReward > 200) {
      toast.error("Points must be between 100 and 200");
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
          max_participants: maxParticipants,
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
      setPointsReward(150);
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Create Friend Challenge</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="title" className="text-sm">Challenge Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Golden Hour Challenge"
                className="h-9 text-sm"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="description" className="text-sm">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Let's see who can capture the best!"
                className="text-sm min-h-[60px]"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="prompt" className="text-sm">Challenge Prompt *</Label>
              <Input
                id="prompt"
                value={challengePrompt}
                onChange={(e) => setChallengePrompt(e.target.value)}
                placeholder="Capture the best golden hour photo"
                className="h-9 text-sm"
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="text-sm">End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-9 justify-start text-left font-normal text-sm"
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
              <Label htmlFor="points" className="text-sm">Points Reward (100-200)</Label>
              <Input
                id="points"
                type="number"
                value={pointsReward}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setPointsReward(100);
                    return;
                  }
                  const numValue = parseInt(value);
                  if (!isNaN(numValue)) {
                    if (numValue < 100) {
                      setPointsReward(100);
                    } else if (numValue > 200) {
                      setPointsReward(200);
                    } else {
                      setPointsReward(numValue);
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = parseInt(e.target.value);
                  if (isNaN(value) || value < 100) {
                    setPointsReward(100);
                  } else if (value > 200) {
                    setPointsReward(200);
                  }
                }}
                min={100}
                max={200}
                className="h-9 text-sm"
                placeholder="Enter points (100-200)"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                🥇 {pointsReward} | 🥈 {Math.round(pointsReward * 0.6)} | 🥉 {Math.round(pointsReward * 0.3)} pts
              </p>
            </div>

            <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
              <p className="text-xs font-medium mb-0.5">3-10 friends required</p>
              <p className="text-[10px] text-muted-foreground">
                Invite friends to compete in this challenge
              </p>
            </div>

            <Button type="submit" className="w-full h-9 text-sm" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
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