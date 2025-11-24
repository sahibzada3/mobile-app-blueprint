import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserPlus, UserCheck, UserX, Users, Mail, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface FriendWithProfile extends Profile {
  friendship_id: string;
  status: string;
  is_requester: boolean;
}

export default function Friends() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [friends, setFriends] = useState<FriendWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendWithProfile[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendWithProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadFriends();
      loadPendingRequests();
      loadSentRequests();
      subscribeToFriendships();
    }
  }, [currentUserId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setCurrentUserId(session.user.id);
  };

  const subscribeToFriendships = () => {
    const channel = supabase
      .channel("friendships-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `user_id=eq.${currentUserId}`,
        },
        () => {
          loadFriends();
          loadPendingRequests();
          loadSentRequests();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "friendships",
          filter: `friend_id=eq.${currentUserId}`,
        },
        () => {
          loadFriends();
          loadPendingRequests();
          loadSentRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const loadFriends = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          id,
          user_id,
          friend_id,
          status,
          profiles!friendships_friend_id_fkey(id, username, avatar_url, bio)
        `)
        .eq("user_id", currentUserId)
        .eq("status", "accepted");

      if (error) {
        console.error("Error fetching friends:", error);
        return;
      }

      if (data) {
        setFriends(
          data.map((f: any) => ({
            friendship_id: f.id,
            id: f.profiles.id,
            username: f.profiles.username,
            avatar_url: f.profiles.avatar_url,
            bio: f.profiles.bio,
            status: f.status,
            is_requester: true,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading friends:", error);
    }
  };

  const loadPendingRequests = async () => {
    if (!currentUserId) return;

    try {
      const { data, error } = await supabase
        .from("friendships")
        .select(`
          id,
          user_id,
          friend_id,
          status,
          profiles!friendships_user_id_fkey(id, username, avatar_url, bio)
        `)
        .eq("friend_id", currentUserId)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending requests:", error);
        return;
      }

      if (data) {
        setPendingRequests(
          data.map((f: any) => ({
            friendship_id: f.id,
            id: f.profiles.id,
            username: f.profiles.username,
            avatar_url: f.profiles.avatar_url,
            bio: f.profiles.bio,
            status: f.status,
            is_requester: false,
          }))
        );
      }
    } catch (error) {
      console.error("Error loading pending requests:", error);
    }
  };

  const loadSentRequests = async () => {
    if (!currentUserId) return;

    const { data } = await supabase
      .from("friendships")
      .select(`
        id,
        user_id,
        friend_id,
        status,
        profiles!friendships_friend_id_fkey(id, username, avatar_url, bio)
      `)
      .eq("user_id", currentUserId)
      .eq("status", "pending");

    if (data) {
      setSentRequests(
        data.map((f: any) => ({
          friendship_id: f.id,
          id: f.profiles.id,
          username: f.profiles.username,
          avatar_url: f.profiles.avatar_url,
          bio: f.profiles.bio,
          status: f.status,
          is_requester: true,
        }))
      );
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim() || !currentUserId) return;

    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio")
      .ilike("username", `%${searchQuery}%`)
      .neq("id", currentUserId)
      .limit(10);

    if (data) {
      setSearchResults(data);
    }
    setLoading(false);
  };

  const sendFriendRequest = async (friendId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase.from("friendships").insert({
      user_id: currentUserId,
      friend_id: friendId,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to send friend request");
    } else {
      toast.success("Friend request sent!");
      searchUsers(); // Refresh search results
    }
  };

  const acceptRequest = async (friendshipId: string, userId: string) => {
    const { error: updateError } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", friendshipId);

    if (updateError) {
      toast.error("Failed to accept request");
      return;
    }

    // Create reciprocal friendship
    const { error: insertError } = await supabase.from("friendships").insert({
      user_id: currentUserId,
      friend_id: userId,
      status: "accepted",
    });

    if (insertError) {
      toast.error("Failed to complete friendship");
    } else {
      toast.success("Friend request accepted!");
    }
  };

  const rejectRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) {
      toast.error("Failed to reject request");
    } else {
      toast.success("Request rejected");
    }
  };

  const removeFriend = async (friendId: string) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .or(`user_id.eq.${currentUserId},friend_id.eq.${currentUserId}`)
      .or(`user_id.eq.${friendId},friend_id.eq.${friendId}`);

    if (error) {
      toast.error("Failed to remove friend");
    } else {
      toast.success("Friend removed");
    }
  };

  const cancelRequest = async (friendshipId: string) => {
    const { error } = await supabase
      .from("friendships")
      .delete()
      .eq("id", friendshipId);

    if (error) {
      toast.error("Failed to cancel request");
    } else {
      toast.success("Request cancelled");
    }
  };

  const getFriendshipStatus = (userId: string) => {
    if (friends.some((f) => f.id === userId)) return "friends";
    if (sentRequests.some((r) => r.id === userId)) return "pending";
    if (pendingRequests.some((r) => r.id === userId)) return "requested";
    return "none";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Friends</h1>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {friends.length}
          </Badge>
        </div>

        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="friends" className="gap-2">
              <UserCheck className="w-4 h-4" />
              Friends
            </TabsTrigger>
            <TabsTrigger value="requests" className="gap-2">
              <Mail className="w-4 h-4" />
              Requests
              {pendingRequests.length > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Sent
            </TabsTrigger>
            <TabsTrigger value="search" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="space-y-4">
            <Card className="p-6">
              <ScrollArea className="h-[600px]">
                <AnimatePresence>
                  {friends.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-20" />
                      <p className="text-lg font-medium">No friends yet</p>
                      <p className="text-sm">Search for users to connect with!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {friends.map((friend) => (
                        <motion.div
                          key={friend.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <Card className="p-4 hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                                <AvatarImage src={friend.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {friend.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{friend.username}</p>
                                {friend.bio && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {friend.bio}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => navigate(`/profile/${friend.id}`)}
                                >
                                  View Profile
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFriend(friend.id)}
                                >
                                  <UserX className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-4">
            <Card className="p-6">
              <ScrollArea className="h-[600px]">
                {pendingRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="p-4 border-primary/20 bg-primary/5">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-14 h-14 ring-2 ring-primary/20">
                              <AvatarImage src={request.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {request.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{request.username}</p>
                              <p className="text-sm text-muted-foreground">
                                wants to be friends
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  acceptRequest(request.friendship_id, request.id)
                                }
                                className="gap-2"
                              >
                                <Check className="w-4 h-4" />
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => rejectRequest(request.friendship_id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            <Card className="p-6">
              <ScrollArea className="h-[600px]">
                {sentRequests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <UserPlus className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">No sent requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sentRequests.map((request) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <Card className="p-4">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-14 h-14">
                              <AvatarImage src={request.avatar_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {request.username[0].toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold truncate">{request.username}</p>
                              <Badge variant="outline" className="text-xs">
                                Pending
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelRequest(request.friendship_id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card className="p-6">
              <div className="flex gap-2 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && searchUsers()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={searchUsers} disabled={loading}>
                  Search
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                {searchResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Search for users</p>
                    <p className="text-sm">Find friends to connect with</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((user) => {
                      const status = getFriendshipStatus(user.id);
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Card className="p-4">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-14 h-14">
                                <AvatarImage src={user.avatar_url || undefined} />
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {user.username[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold truncate">{user.username}</p>
                                {user.bio && (
                                  <p className="text-sm text-muted-foreground truncate">
                                    {user.bio}
                                  </p>
                                )}
                              </div>
                              {status === "none" && (
                                <Button
                                  size="sm"
                                  onClick={() => sendFriendRequest(user.id)}
                                  className="gap-2"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  Add Friend
                                </Button>
                              )}
                              {status === "pending" && (
                                <Badge variant="outline">Request Sent</Badge>
                              )}
                              {status === "friends" && (
                                <Badge variant="secondary">
                                  <UserCheck className="w-4 h-4 mr-1" />
                                  Friends
                                </Badge>
                              )}
                              {status === "requested" && (
                                <Badge variant="default">Pending Request</Badge>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
