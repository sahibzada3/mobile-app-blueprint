import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, UserPlus, Check, X, Search } from "lucide-react";
import { toast } from "sonner";

interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  status: string;
  friend: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  unread_count?: number;
}

interface FriendsListProps {
  currentUserId: string;
  onSelectFriend: (friendId: string, friendName: string, friendAvatar: string | null) => void;
  selectedFriendId?: string;
}

export default function FriendsList({ currentUserId, onSelectFriend, selectedFriendId }: FriendsListProps) {
  const [friends, setFriends] = React.useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = React.useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchFriends();
    fetchPendingRequests();
    subscribeToFriendships();
  }, [currentUserId]);

  const fetchFriends = async () => {
    const { data, error } = await supabase
      .from("friendships")
      .select(`
        *,
        friend:profiles!friendships_friend_id_fkey(id, username, avatar_url)
      `)
      .eq("user_id", currentUserId)
      .eq("status", "accepted");

    if (error) {
      console.error("Error fetching friends:", error);
      return;
    }

    // Fetch unread message counts
    const friendsWithUnread = await Promise.all(
      (data || []).map(async (friendship) => {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("sender_id", friendship.friend_id)
          .eq("recipient_id", currentUserId)
          .eq("read", false);

        return { ...friendship, unread_count: count || 0 };
      })
    );

    setFriends(friendsWithUnread);
  };

  const fetchPendingRequests = async () => {
    const { data, error } = await supabase
      .from("friendships")
      .select(`
        *,
        friend:profiles!friendships_user_id_fkey(id, username, avatar_url)
      `)
      .eq("friend_id", currentUserId)
      .eq("status", "pending");

    if (error) {
      console.error("Error fetching pending requests:", error);
      return;
    }

    setPendingRequests(data || []);
  };

  const subscribeToFriendships = () => {
    const channel = supabase
      .channel(`friendships-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `user_id=eq.${currentUserId}`
        },
        () => {
          fetchFriends();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `friend_id=eq.${currentUserId}`
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .ilike("username", `%${searchQuery}%`)
      .neq("id", currentUserId)
      .limit(5);

    if (error) {
      console.error("Error searching users:", error);
      return;
    }

    setSearchResults(data || []);
  };

  const sendFriendRequest = async (friendId: string) => {
    const { error } = await supabase
      .from("friendships")
      .insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: "pending"
      });

    if (error) {
      console.error("Error sending friend request:", error);
      toast.error("Failed to send friend request");
      return;
    }

    toast.success("Friend request sent!");
    setSearchQuery("");
    setSearchResults([]);
  };

  const acceptFriendRequest = async (friendshipId: string, friendId: string) => {
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (error) {
      console.error("Error accepting friend request:", error);
      toast.error("Failed to accept friend request");
      return;
    }

    // Create reciprocal friendship
    await supabase
      .from("friendships")
      .insert({
        user_id: currentUserId,
        friend_id: friendId,
        status: "accepted"
      });

    toast.success("Friend request accepted!");
    fetchFriends();
    fetchPendingRequests();
  };

  const rejectFriendRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) {
      console.error("Error rejecting friend request:", error);
      toast.error("Failed to reject friend request");
      return;
    }

    toast.success("Friend request rejected");
    fetchPendingRequests();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Friends
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="p-4 border-b space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyUp={searchUsers}
            />
            <Button variant="outline" size="icon" onClick={searchUsers}>
              <Search className="w-4 h-4" />
            </Button>
          </div>
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>{user.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.username}</span>
                  </div>
                  <Button size="sm" onClick={() => sendFriendRequest(user.id)}>
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {pendingRequests.length > 0 && (
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3 text-sm">Pending Requests</h3>
            <div className="space-y-2">
              {pendingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={request.friend.avatar_url || undefined} />
                      <AvatarFallback>{request.friend.username[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{request.friend.username}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => acceptFriendRequest(request.id, request.user_id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectFriendRequest(request.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {friends.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No friends yet</p>
                <p className="text-sm">Search for users to add friends</p>
              </div>
            ) : (
              friends.map((friendship) => (
                <div
                  key={friendship.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFriendId === friendship.friend_id
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  }`}
                  onClick={() =>
                    onSelectFriend(
                      friendship.friend_id,
                      friendship.friend.username,
                      friendship.friend.avatar_url
                    )
                  }
                >
                  <Avatar>
                    <AvatarImage src={friendship.friend.avatar_url || undefined} />
                    <AvatarFallback>{friendship.friend.username[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{friendship.friend.username}</p>
                  </div>
                  {friendship.unread_count! > 0 && (
                    <Badge variant="destructive">{friendship.unread_count}</Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
