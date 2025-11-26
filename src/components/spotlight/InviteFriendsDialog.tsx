import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Loader2 } from "lucide-react";

interface Friend {
  id: string;
  username: string;
  avatar_url: string | null;
  isParticipant: boolean;
}

interface InviteFriendsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chainId: string;
  currentParticipants: string[];
}

export default function InviteFriendsDialog({
  open,
  onOpenChange,
  chainId,
  currentParticipants,
}: InviteFriendsDialogProps) {
  const [friends, setFriends] = React.useState<Friend[]>([]);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      loadFriends();
    }
  }, [open]);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: friendships } = await supabase
        .from("friendships")
        .select("friend_id, profiles!friendships_friend_id_fkey(id, username, avatar_url)")
        .eq("user_id", session.user.id)
        .eq("status", "accepted");

      if (friendships) {
        const friendsData = friendships.map((f: any) => ({
          id: f.profiles.id,
          username: f.profiles.username,
          avatar_url: f.profiles.avatar_url,
          isParticipant: currentParticipants.includes(f.profiles.id),
        }));
        setFriends(friendsData);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (friendId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelected(newSelected);
  };

  const handleInvite = async () => {
    if (selected.size === 0) {
      toast.error("Please select at least one friend");
      return;
    }

    setSubmitting(true);
    try {
      const invites = Array.from(selected).map((friendId) => ({
        chain_id: chainId,
        user_id: friendId,
      }));

      const { error } = await supabase
        .from("chain_participants")
        .insert(invites);

      if (error) throw error;

      toast.success(`Invited ${selected.size} friend${selected.size > 1 ? "s" : ""} successfully!`);
      setSelected(new Set());
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Failed to invite friends");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Friends to Chain
          </DialogTitle>
          <DialogDescription>
            Select friends to join this spotlight chain
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : friends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No friends to invite</p>
            <p className="text-sm mt-2">Add friends first to invite them to chains</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      friend.isParticipant
                        ? "bg-muted border-muted cursor-not-allowed"
                        : "hover:bg-accent cursor-pointer"
                    }`}
                    onClick={() => !friend.isParticipant && handleToggle(friend.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={friend.avatar_url || undefined} />
                        <AvatarFallback>
                          {friend.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{friend.username}</p>
                        {friend.isParticipant && (
                          <p className="text-xs text-muted-foreground">Already a participant</p>
                        )}
                      </div>
                    </div>
                    <Checkbox
                      checked={selected.has(friend.id)}
                      disabled={friend.isParticipant}
                      onCheckedChange={() => handleToggle(friend.id)}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleInvite}
                className="flex-1"
                disabled={selected.size === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Inviting...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite ({selected.size})
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
