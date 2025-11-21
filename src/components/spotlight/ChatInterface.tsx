import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon, Smile, Edit2, Trash2, MoreVertical, Mic } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import AudioPlayer from "@/components/chat/AudioPlayer";

interface TypingPresence {
  user_id: string;
  typing: boolean;
  timestamp: number;
}

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  image_url: string | null;
  audio_url: string | null;
  audio_duration: number | null;
  chain_id: string | null;
  read: boolean;
  created_at: string;
  edited_at: string | null;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  reactions?: Reaction[];
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
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<any>(null);

  const commonEmojis = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

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

    // Fetch reactions for all messages
    const messagesWithReactions = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: reactions } = await supabase
          .from("message_reactions")
          .select("*")
          .eq("message_id", msg.id);
        return { ...msg, reactions: reactions || [] };
      })
    );

    setMessages(messagesWithReactions);
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
        .from("chat-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("chat-images")
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

  const handleReaction = async (messageId: string, emoji: string) => {
    // Check if user already reacted with this emoji
    const message = messages.find(m => m.id === messageId);
    const existingReaction = message?.reactions?.find(
      r => r.user_id === currentUserId && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      await supabase
        .from("message_reactions")
        .delete()
        .eq("id", existingReaction.id);
    } else {
      // Add reaction
      await supabase
        .from("message_reactions")
        .insert({
          message_id: messageId,
          user_id: currentUserId,
          emoji
        });
    }

    fetchMessages();
    setShowReactions(null);
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !editedContent.trim()) return;

    const { error } = await supabase
      .from("messages")
      .update({
        content: editedContent.trim(),
        edited_at: new Date().toISOString()
      })
      .eq("id", editingMessage.id);

    if (error) {
      toast.error("Failed to edit message");
      return;
    }

    setEditingMessage(null);
    setEditedContent("");
    fetchMessages();
    toast.success("Message edited");
  };

  const handleDeleteMessage = async (messageId: string) => {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) {
      toast.error("Failed to delete message");
      return;
    }

    fetchMessages();
    toast.success("Message deleted");
  };

  const groupReactions = (reactions: Reaction[]) => {
    const grouped: { [emoji: string]: { count: number; userIds: string[] } } = {};
    reactions.forEach(r => {
      if (!grouped[r.emoji]) {
        grouped[r.emoji] = { count: 0, userIds: [] };
      }
      grouped[r.emoji].count++;
      grouped[r.emoji].userIds.push(r.user_id);
    });
    return grouped;
  };

  const handleVoiceSend = async (audioBlob: Blob, duration: number) => {
    try {
      const fileExt = 'webm';
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUserId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("voice-messages")
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("voice-messages")
        .getPublicUrl(filePath);

      const { error: messageError } = await supabase
        .from("messages")
        .insert({
          sender_id: currentUserId,
          recipient_id: friendId,
          audio_url: publicUrl,
          audio_duration: duration
        });

      if (messageError) throw messageError;

      fetchMessages();
      setIsRecordingVoice(false);
      toast.success("Voice message sent!");
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message");
      setIsRecordingVoice(false);
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
            {messages.map((message) => {
              const isOwnMessage = message.sender_id === currentUserId;
              const groupedReactions = groupReactions(message.reactions || []);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-start gap-2">
                      <div
                        className={`rounded-lg p-3 relative group ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {isOwnMessage && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingMessage(message);
                                  setEditedContent(message.content || "");
                                }}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteMessage(message.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        
                        {message.image_url && (
                          <img
                            src={message.image_url}
                            alt="Shared image"
                            className="rounded-lg mb-2 max-w-full"
                          />
                        )}
                        {message.audio_url && (
                          <AudioPlayer
                            audioUrl={message.audio_url}
                            duration={message.audio_duration || undefined}
                          />
                        )}
                        {message.content && <p className="text-sm">{message.content}</p>}
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                          {message.edited_at && " (edited)"}
                        </p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Reactions display */}
                    {Object.keys(groupedReactions).length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(groupedReactions).map(([emoji, data]) => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message.id, emoji)}
                            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                              data.userIds.includes(currentUserId)
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            <span>{emoji}</span>
                            <span>{data.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Reaction picker */}
                    {showReactions === message.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex gap-1 p-2 bg-background border rounded-lg shadow-lg"
                      >
                        {commonEmojis.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(message.id, emoji)}
                            className="text-xl hover:scale-125 transition-transform"
                          >
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
            
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
        <div className="border-t p-4">
          {isRecordingVoice ? (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setIsRecordingVoice(false)}
            />
          ) : (
            <div className="flex gap-2">
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRecordingVoice(true)}
              >
                <Mic className="w-4 h-4" />
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
          )}
        </div>
      </CardContent>

      {/* Edit message dialog */}
      <Dialog open={!!editingMessage} onOpenChange={() => setEditingMessage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Message</DialogTitle>
          </DialogHeader>
          <Input
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleEditMessage()}
            placeholder="Edit your message..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>
              Cancel
            </Button>
            <Button onClick={handleEditMessage}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
