import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  chain_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

interface Participant {
  id: string;
  user_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

interface TypingUser {
  user_id: string;
  username: string;
  timestamp: number;
}

interface GroupChatInterfaceProps {
  chainId: string;
  chainTitle: string;
  currentUserId: string;
}

export default function GroupChatInterface({ chainId, chainTitle, currentUserId }: GroupChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<any>(null);

  useEffect(() => {
    fetchParticipants();
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    setupTypingPresence();

    return () => {
      unsubscribe();
      cleanupTypingPresence();
    };
  }, [chainId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from("chain_participants")
      .select("*")
      .eq("chain_id", chainId);

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    // Load profiles for participants
    const participantsWithProfiles = await Promise.all(
      (data || []).map(async (participant) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id, username, avatar_url")
          .eq("id", participant.user_id)
          .single();
        
        return { 
          ...participant, 
          profiles: profile || { id: '', username: 'Unknown', avatar_url: null }
        };
      })
    );

    setParticipants(participantsWithProfiles);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("chain_messages")
      .select(`
        *,
        sender:profiles!chain_messages_sender_id_fkey(username, avatar_url)
      `)
      .eq("chain_id", chainId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const setupTypingPresence = () => {
    const channelName = `chain-typing-${chainId}`;
    
    presenceChannelRef.current = supabase.channel(channelName);
    
    presenceChannelRef.current
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current.presenceState();
        const presences = Object.values(state).flat() as any[];
        
        const currentlyTyping = presences
          .filter((p: any) => p.typing && p.user_id !== currentUserId)
          .map((p: any) => ({
            user_id: p.user_id,
            username: p.username,
            timestamp: p.timestamp
          }));
        
        setTypingUsers(currentlyTyping);
      })
      .subscribe();
  };

  const cleanupTypingPresence = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (presenceChannelRef.current) {
      presenceChannelRef.current.untrack();
      supabase.removeChannel(presenceChannelRef.current);
    }
  };

  const updateTypingStatus = async (typing: boolean) => {
    if (!presenceChannelRef.current) return;

    const currentUser = participants.find(p => p.user_id === currentUserId);
    
    await presenceChannelRef.current.track({
      user_id: currentUserId,
      username: currentUser?.profiles.username || 'Unknown',
      typing,
      timestamp: Date.now()
    });
  };

  const handleTyping = () => {
    updateTypingStatus(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 2000);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chain-chat-${chainId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chain_messages",
          filter: `chain_id=eq.${chainId}`
        },
        async (payload) => {
          const { data } = await supabase
            .from("chain_messages")
            .select(`
              *,
              sender:profiles!chain_messages_sender_id_fkey(username, avatar_url)
            `)
            .eq("id", payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updateTypingStatus(false);

    const { error } = await supabase
      .from("chain_messages")
      .insert({
        chain_id: chainId,
        sender_id: currentUserId,
        content: newMessage.trim()
      });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(filePath);

      const { error: messageError } = await supabase
        .from("chain_messages")
        .insert({
          chain_id: chainId,
          sender_id: currentUserId,
          image_url: publicUrl
        });

      if (messageError) throw messageError;

      toast.success("Image sent!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const formatTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">{chainTitle}</h3>
              <p className="text-xs text-muted-foreground font-normal">
                {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {participants.slice(0, 5).map((participant) => (
              <Avatar key={participant.id} className="w-8 h-8 border-2 border-background">
                <AvatarImage src={participant.profiles.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {participant.profiles.username[0]}
                </AvatarFallback>
              </Avatar>
            ))}
            {participants.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                <span className="text-xs font-medium">+{participants.length - 5}</span>
              </div>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                    {!isOwnMessage && (
                      <Avatar className="w-8 h-8 mt-auto">
                        <AvatarImage src={message.sender?.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {message.sender?.username?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {message.sender?.username}
                        </p>
                      )}
                      {message.image_url && (
                        <img
                          src={message.image_url}
                          alt="Shared image"
                          className="rounded-lg mb-2 max-w-full"
                        />
                      )}
                      {message.content && <p className="text-sm">{message.content}</p>}
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {typingUsers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 flex justify-start"
              >
                <div className="flex gap-2 items-end">
                  <div className="flex -space-x-2">
                    {typingUsers.slice(0, 3).map((user) => {
                      const participant = participants.find(p => p.user_id === user.user_id);
                      return (
                        <Avatar key={user.user_id} className="w-6 h-6 border-2 border-background">
                          <AvatarImage src={participant?.profiles.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {participant?.profiles.username[0]}
                          </AvatarFallback>
                        </Avatar>
                      );
                    })}
                  </div>
                  <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-foreground/60 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-foreground/60 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-foreground/60 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTypingIndicator()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>
        <div className="border-t p-4 flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            <ImageIcon className="w-4 h-4" />
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
