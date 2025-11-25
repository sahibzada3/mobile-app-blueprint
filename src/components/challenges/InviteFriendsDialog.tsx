import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, UserPlus } from "lucide-react";

interface InviteFriendsDialogProps {
  challengeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InviteFriendsDialog({ challengeId, open, onOpenChange }: InviteFriendsDialogProps) {
  const [friends, setFriends] = React.useState<any[]>([]);
  const [invited, setInvited] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(true);
  const [challenge, setChallenge] = React.useState<any>(null);

  React.useEffect(() => {
    if (open) {
      fetchChallengeAndFriends();
    }
  }, [open, challengeId]);

  const fetchChallengeAndFriends = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Fetch challenge details
      const { data: challengeData } = await supabase
        .from("friend_challenges")
        .select("min_participants, max_participants")
        .eq("id", challengeId)
        .single();
      
      setChallenge(challengeData);

      // Fetch current participants count
      const { data: participantsData } = await supabase
        .from("challenge_participants")
        .select("user_id")
        .eq("challenge_id", challengeId);

      const currentParticipants = new Set(participantsData?.map(p => p.user_id) || []);
      setInvited(currentParticipants);

      // Fetch friends
      const { data, error } = await supabase
        .from("friendships")
        .select("friend_id, profiles!friendships_friend_id_fkey(id, username, avatar_url)")
        .eq("user_id", session.user.id)
        .eq("status", "accepted");

      if (error) throw error;

      const friendsList = data?.map(f => f.profiles).filter(Boolean) || [];
      setFriends(friendsList);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (friendId: string) => {
    // Check max participants limit
    if (challenge && invited.size >= challenge.max_participants) {
      toast.error(`Maximum ${challenge.max_participants} participants allowed`);
      return;
    }

    try {
      const { error } = await supabase
        .from("challenge_participants")
        .insert({
          challenge_id: challengeId,
          user_id: friendId
        });

      if (error) {
        if (error.code === "23505") {
          toast.info("Friend already invited");
        } else {
          throw error;
        }
        return;
      }

      setInvited(prev => new Set(prev).add(friendId));
      toast.success("Friend invited!");
    } catch (error: any) {
      console.error("Error inviting friend:", error);
      toast.error("Failed to invite friend");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Friends to Challenge</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Invite 3-10 friends ({invited.size}/10 invited)
            {invited.size < 3 && <span className="text-destructive ml-1">⚠️ Min 3 required</span>}
          </p>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No friends to invite</p>
            <p className="text-sm text-muted-foreground mt-2">Add friends first to invite them to challenges</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={friend.avatar_url || undefined} />
                    <AvatarFallback>{friend.username[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{friend.username}</span>
                </div>
                <Button
                  size="sm"
                  variant={invited.has(friend.id) ? "secondary" : "default"}
                  onClick={() => handleInvite(friend.id)}
                  disabled={invited.has(friend.id) || (challenge && invited.size >= challenge.max_participants)}
                >
                  {invited.has(friend.id) ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Invited
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-1" />
                      Invite
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button onClick={() => onOpenChange(false)} variant="outline" className="w-full mt-4">
          Done
        </Button>
      </DialogContent>
    </Dialog>
  );
}