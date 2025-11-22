import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { FriendsList } from "@/components/spotlight/FriendsList";
import { ChatInterface } from "@/components/spotlight/ChatInterface";

interface Conversation {
  friend_id: string;
  username: string;
  avatar_url: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export default function Messages() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
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
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(username, avatar_url),
        recipient:profiles!messages_recipient_id_fkey(username, avatar_url)
      `)
      .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (messages) {
      const convMap = new Map<string, Conversation>();
      
      messages.forEach((msg: any) => {
        const isSender = msg.sender_id === currentUserId;
        const friendId = isSender ? msg.recipient_id : msg.sender_id;
        const friend = isSender ? msg.recipient : msg.sender;
        
        if (!convMap.has(friendId)) {
          convMap.set(friendId, {
            friend_id: friendId,
            username: friend.username,
            avatar_url: friend.avatar_url,
            last_message: msg.content || "Media",
            last_message_time: msg.created_at,
            unread_count: !msg.read && !isSender ? 1 : 0,
          });
        } else if (!msg.read && !isSender) {
          const conv = convMap.get(friendId)!;
          conv.unread_count++;
        }
      });

      setConversations(Array.from(convMap.values()));
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedFriend) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ChatInterface
          friendId={selectedFriend}
          currentUserId={currentUserId!}
          onBack={() => setSelectedFriend(null)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Messages</h1>
          <MessageCircle className="w-6 h-6 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <FriendsList
              currentUserId={currentUserId!}
              onSelectFriend={setSelectedFriend}
            />
          </div>

          <div className="md:col-span-2">
            <Card className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {filteredConversations.map((conv) => (
                    <motion.div
                      key={conv.friend_id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => setSelectedFriend(conv.friend_id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conv.avatar_url || undefined} />
                            <AvatarFallback>
                              {conv.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold truncate">
                                {conv.username}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.last_message}
                            </p>
                          </div>
                          {conv.unread_count > 0 && (
                            <Badge variant="default" className="ml-2">
                              {conv.unread_count}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}

                  {filteredConversations.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start chatting with your friends!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
