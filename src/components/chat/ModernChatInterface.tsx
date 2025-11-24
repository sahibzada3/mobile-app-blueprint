import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Send, Mic, Image as ImageIcon, Smile, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "./AudioPlayer";
import VoiceRecorder from "./VoiceRecorder";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string | null;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read: boolean;
  image_url: string | null;
  audio_url: string | null;
  audio_duration: number | null;
  edited_at: string | null;
}

interface ModernChatInterfaceProps {
  friend: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  onBack: () => void;
}

export default function ModernChatInterface({ friend, onBack }: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId && friend.id) {
      fetchMessages();
      markMessagesAsRead();
      setupRealtimeSubscription();
    }
  }, [currentUserId, friend.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!currentUserId || !friend.id) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${friend.id}),and(sender_id.eq.${friend.id},recipient_id.eq.${currentUserId})`)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
  };

  const markMessagesAsRead = async () => {
    if (!currentUserId || !friend.id) return;

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("sender_id", friend.id)
      .eq("recipient_id", currentUserId)
      .eq("read", false);
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel(`chat-realtime-${currentUserId}-${friend.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `or(and(sender_id=eq.${currentUserId},recipient_id=eq.${friend.id}),and(sender_id=eq.${friend.id},recipient_id=eq.${currentUserId}))`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMsg = payload.new as Message;
            setMessages((prev) => [...prev, newMsg]);
            if (newMsg.sender_id === friend.id) {
              markMessagesAsRead();
            }
            scrollToBottom();
          } else if (payload.eventType === "UPDATE") {
            const updatedMsg = payload.new as Message;
            setMessages((prev) =>
              prev.map((msg) => (msg.id === updatedMsg.id ? updatedMsg : msg))
            );
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUserId || !friend.id) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    const { error } = await supabase.from("messages").insert({
      content: messageText,
      sender_id: currentUserId,
      recipient_id: friend.id,
    });

    if (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      setNewMessage(messageText);
    }
  };

  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    if (!currentUserId || !friend.id) return;

    try {
      const fileName = `voice_${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("voice-messages")
        .upload(fileName, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("voice-messages")
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from("messages").insert({
        sender_id: currentUserId,
        recipient_id: friend.id,
        audio_url: publicUrl,
        audio_duration: duration,
      });

      if (insertError) throw insertError;

      setIsRecording(false);
      toast.success("Voice message sent");
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isSent = message.sender_id === currentUserId;
    const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
    const isLastInGroup = index === messages.length - 1 || messages[index + 1].sender_id !== message.sender_id;

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className={`flex items-end gap-2 mb-1 ${isSent ? "justify-end" : "justify-start"}`}
      >
        {!isSent && showAvatar && (
          <Avatar className="w-7 h-7 shrink-0">
            <AvatarFallback className="bg-primary/10 text-xs">
              {friend.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}
        {!isSent && !showAvatar && <div className="w-7 shrink-0" />}

        <div className={`flex flex-col ${isSent ? "items-end" : "items-start"} max-w-[75%]`}>
          <div
            className={`px-3 py-2 ${
              isSent
                ? "bg-primary text-primary-foreground rounded-l-2xl rounded-tr-2xl"
                : "bg-muted text-foreground rounded-r-2xl rounded-tl-2xl"
            } ${isLastInGroup ? (isSent ? "rounded-br-md" : "rounded-bl-md") : ""} shadow-sm`}
          >
            {message.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            )}
            {message.image_url && (
              <img
                src={message.image_url}
                alt="Shared image"
                className="rounded-lg max-w-full h-auto"
              />
            )}
            {message.audio_url && (
              <AudioPlayer audioUrl={message.audio_url} duration={message.audio_duration || undefined} />
            )}
          </div>
          {isLastInGroup && (
            <div className="flex items-center gap-1 mt-1 px-1">
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
              </span>
              {isSent && (
                <span className={`text-xs ${message.read ? "text-primary" : "text-muted-foreground"}`}>
                  {message.read ? "Read" : "Sent"}
                </span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Modern Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarFallback className="bg-primary/10">
            {friend.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-sm truncate">{friend.username}</h2>
          {friendTyping && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-primary"
            >
              typing...
            </motion.p>
          )}
        </div>
        <Button variant="ghost" size="icon" className="shrink-0">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((message, index) => renderMessage(message, index))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card p-3">
        <AnimatePresence mode="wait">
          {isRecording ? (
            <VoiceRecorder
              onSend={handleSendVoice}
              onCancel={() => setIsRecording(false)}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <Smile className="w-5 h-5 text-muted-foreground" />
                </Button>
                <Input
                  type="text"
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <ImageIcon className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>
              {newMessage.trim() ? (
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  className="rounded-full h-11 w-11 shrink-0 shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => setIsRecording(true)}
                  className="rounded-full h-11 w-11 shrink-0"
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
