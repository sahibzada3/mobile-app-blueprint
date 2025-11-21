import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface TypingPresence {
  user_id: string;
  typing: boolean;
  timestamp: number;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  image_url: string | null;
  chain_id: string | null;
  read: boolean;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
}

interface ChatInterfaceProps {
  friendId: string;
  friendName: string;
  friendAvatar: string | null;
  currentUserId: string;
}

export default function ChatInterface({ friendId, friendName, friendAvatar, currentUserId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<any>(null);

  useEffect(() => {
    fetchMessages();
    const unsubscribe = subscribeToMessages();
    setupTypingPresence();

    return () => {
      unsubscribe();
      cleanupTypingPresence();
    };
  }, [friendId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, friendTyping]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(username, avatar_url)
      `)
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${friendId}),and(sender_id.eq.${friendId},recipient_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
    markMessagesAsRead(data || []);
  };

  const markMessagesAsRead = async (msgs: Message[]) => {
    const unreadIds = msgs
      .filter(m => m.recipient_id === currentUserId && !m.read)
      .map(m => m.id);

    if (unreadIds.length > 0) {
      await supabase
        .from("messages")
        .update({ read: true })
        .in("id", unreadIds);
    }
  };

  const setupTypingPresence = () => {
    const channelName = `typing-${[currentUserId, friendId].sort().join('-')}`;
    
    presenceChannelRef.current = supabase.channel(channelName);
    
    presenceChannelRef.current
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannelRef.current.presenceState();
        const presences = Object.values(state).flat() as TypingPresence[];
        
        const friendIsTyping = presences.some(
          (p: TypingPresence) => p.user_id === friendId && p.typing
        );
        
        setFriendTyping(friendIsTyping);
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

    await presenceChannelRef.current.track({
      user_id: currentUserId,
      typing,
      timestamp: Date.now()
    });
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      updateTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      updateTypingStatus(false);
    }, 2000);
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`chat-${currentUserId}-${friendId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${friendId},recipient_id=eq.${currentUserId}`
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { data } = await supabase
              .from("messages")
              .select(`
                *,
                sender:profiles!messages_sender_id_fkey(username, avatar_url)
              `)
              .eq("id", payload.new.id)
              .single();

            if (data) {
              setMessages(prev => [...prev, data]);
              await supabase
                .from("messages")
                .update({ read: true })
                .eq("id", data.id);
            }
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

    // Clear typing status when sending
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);
    updateTypingStatus(false);

    const { error } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        recipient_id: friendId,
        content: newMessage.trim()
      });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
    fetchMessages();
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
        .from("messages")
        .insert({
          sender_id: currentUserId,
          recipient_id: friendId,
          image_url: publicUrl
        });

      if (messageError) throw messageError;

      fetchMessages();
      toast.success("Image sent!");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={friendAvatar || undefined} />
            <AvatarFallback>{friendName[0]}</AvatarFallback>
          </Avatar>
          <span>{friendName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-4 flex ${
                  message.sender_id === currentUserId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender_id === currentUserId
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
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
              </motion.div>
            ))}
            
            {friendTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 flex justify-start"
              >
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
                  <span className="text-xs text-muted-foreground">{friendName} is typing...</span>
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
