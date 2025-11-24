import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import ModernChatInterface from "@/components/chat/ModernChatInterface";
import FriendsList from "@/components/spotlight/FriendsList";
import { useDebounce } from "@/hooks/useDebounce";

interface Conversation {
  friendId: string;
  friendUsername: string;
  friendAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface SelectedFriend {
  id: string;
  username: string;
  avatar_url: string | null;
}

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<SelectedFriend | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
      setupRealtimeSubscription();
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

  const loadConversations = async () => {
    if (!currentUserId) return;

    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (messages) {
      const convMap = new Map<string, Conversation>();
      
      for (const msg of messages) {
        const isSender = msg.sender_id === currentUserId;
        const friendId = isSender ? msg.recipient_id : msg.sender_id;
        
        if (!convMap.has(friendId)) {
          // Load friend profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", friendId)
            .single();

          if (profile) {
            convMap.set(friendId, {
              friendId,
              friendUsername: profile.username,
              friendAvatar: profile.avatar_url,
              lastMessage: msg.content || msg.audio_url ? "🎵 Voice message" : "📷 Image",
              lastMessageTime: msg.created_at,
              unreadCount: !msg.read && !isSender ? 1 : 0,
            });
          }
        } else if (!msg.read && !isSender) {
          const conv = convMap.get(friendId)!;
          conv.unreadCount++;
        }
      }

      setConversations(Array.from(convMap.values()));
    }
  };

  const setupRealtimeSubscription = () => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("messages-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `or(sender_id=eq.${currentUserId},recipient_id=eq.${currentUserId})`,
        },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.friendUsername.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <>
      {selectedFriend ? (
        <ModernChatInterface
          friend={selectedFriend}
          onBack={() => {
            setSelectedFriend(null);
            loadConversations();
          }}
        />
      ) : (
        <div className="min-h-screen bg-background pb-20">
          <header className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b px-5 py-4 shadow-sm">
            <h1 className="text-xl font-bold">Messages</h1>
          </header>

          <div className="max-w-2xl mx-auto">
            {currentUserId && (
              <div className="p-5">
                <FriendsList 
                  currentUserId={currentUserId}
                  onSelectFriend={(friendId, friendName, friendAvatar) => 
                    setSelectedFriend({
                      id: friendId,
                      username: friendName,
                      avatar_url: friendAvatar
                    })
                  }
                />
              </div>
            )}

            <div className="px-5 mb-6">
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            {filteredConversations.length === 0 ? (
              <div className="px-5">
                <Card>
                  <CardContent className="text-center py-16">
                    <p className="text-muted-foreground">No conversations yet</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="px-5 space-y-2">
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.friendId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      className="overflow-hidden cursor-pointer transition-all hover:shadow-md"
                      onClick={() => setSelectedFriend({
                        id: conversation.friendId,
                        username: conversation.friendUsername,
                        avatar_url: conversation.friendAvatar
                      })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12 shrink-0">
                            <AvatarFallback className="bg-primary/10">
                              {conversation.friendUsername.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-sm truncate">
                                {conversation.friendUsername}
                              </p>
                              <span className="text-xs text-muted-foreground shrink-0 ml-2">
                                {formatDistanceToNow(new Date(conversation.lastMessageTime), { 
                                  addSuffix: false 
                                })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage}
                            </p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <div className="flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-primary text-primary-foreground text-xs font-semibold shrink-0">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <BottomNav />
        </div>
      )}
    </>
  );
}
