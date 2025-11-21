import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Image as ImageIcon, Users, Smile, Edit2, Trash2, MoreVertical, Mic } from "lucide-react";
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

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

interface Message {
  id: string;
  chain_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  audio_url: string | null;
  audio_duration: number | null;
  created_at: string;
  edited_at: string | null;
  sender?: {
    username: string;
    avatar_url: string | null;
  };
  reactions?: Reaction[];
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
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const presenceChannelRef = useRef<any>(null);

  const commonEmojis = ["❤️", "👍", "😂", "😮", "😢", "🙏"];

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

    // Fetch reactions for all messages
    const messagesWithReactions = await Promise.all(
      (data || []).map(async (msg) => {
        const { data: reactions } = await supabase
          .from("chain_message_reactions")
          .select("*")
          .eq("message_id", msg.id);
        return { ...msg, reactions: reactions || [] };
      })
    );

    setMessages(messagesWithReactions);
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

    // Extract mentions from message
    const mentionRegex = /@(\w+)/g;
    const mentions = [...newMessage.matchAll(mentionRegex)].map(match => match[1]);
    const mentionedUserIds = participants
      .filter(p => mentions.includes(p.profiles.username))
      .map(p => p.user_id);

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

    // Create notifications for mentioned users
    if (mentionedUserIds.length > 0) {
      const currentUser = participants.find(p => p.user_id === currentUserId);
      await Promise.all(
        mentionedUserIds.map(userId =>
          supabase.from("notifications").insert({
            user_id: userId,
            type: "mention",
            title: "You were mentioned",
            message: `${currentUser?.profiles.username || 'Someone'} mentioned you in ${chainTitle}`,
            related_type: "chain",
            related_id: chainId
          })
        )
      );
    }

    setNewMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    setNewMessage(value);
    setCursorPosition(cursorPos);
    handleTyping();

    // Check if user is typing @ for mentions
    const textBeforeCursor = value.slice(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtSymbol + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length >= 0) {
        setMentionSearch(textAfterAt.toLowerCase());
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (username: string) => {
    const textBeforeCursor = newMessage.slice(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    const beforeMention = newMessage.slice(0, lastAtSymbol);
    const afterCursor = newMessage.slice(cursorPosition);
    
    const newText = `${beforeMention}@${username} ${afterCursor}`;
    setNewMessage(newText);
    setShowMentions(false);
    
    // Focus input after mention
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const getFilteredParticipants = () => {
    return participants.filter(p => 
      p.user_id !== currentUserId &&
      p.profiles.username.toLowerCase().includes(mentionSearch)
    );
  };

  const renderMessageContent = (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, index) => {
      // Check if this part is a username (odd indices after split)
      if (index % 2 === 1) {
        const participant = participants.find(p => p.profiles.username === part);
        if (participant) {
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${participant.user_id}`);
              }}
              className="bg-primary/20 text-primary font-semibold px-1 rounded hover:bg-primary/30 transition-colors cursor-pointer inline-flex items-center"
            >
              @{part}
            </button>
          );
        }
      }
      return <span key={index}>{part}</span>;
    });
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

  const handleReaction = async (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    const existingReaction = message?.reactions?.find(
      r => r.user_id === currentUserId && r.emoji === emoji
    );

    if (existingReaction) {
      await supabase
        .from("chain_message_reactions")
        .delete()
        .eq("id", existingReaction.id);
    } else {
      await supabase
        .from("chain_message_reactions")
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
      .from("chain_messages")
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
      .from("chain_messages")
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

  const formatTypingIndicator = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
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
        .from("chain_messages")
        .insert({
          chain_id: chainId,
          sender_id: currentUserId,
          audio_url: publicUrl,
          audio_duration: duration
        });

      if (messageError) throw messageError;

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
              const groupedReactions = groupReactions(message.reactions || []);
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-4 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                      {!isOwnMessage && (
                        <Avatar className="w-8 h-8 mt-auto">
                          <AvatarImage src={message.sender?.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {message.sender?.username?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className="flex flex-col gap-1 flex-1">
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
                      {message.audio_url && (
                        <AudioPlayer
                          audioUrl={message.audio_url}
                          duration={message.audio_duration || undefined}
                        />
                      )}
                      {message.content && (
                        <p className="text-sm">
                          {renderMessageContent(message.content)}
                        </p>
                      )}
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                            {message.edited_at && " (edited)"}
                          </p>
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

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mt-auto opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setShowReactions(showReactions === message.id ? null : message.id)}
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
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
        <div className="border-t p-4">
          {isRecordingVoice ? (
            <VoiceRecorder
              onSend={handleVoiceSend}
              onCancel={() => setIsRecordingVoice(false)}
            />
          ) : (
            <div className="relative">
              {/* Mention dropdown */}
              <AnimatePresence>
                {showMentions && getFilteredParticipants().length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {getFilteredParticipants().map((participant) => (
                      <button
                        key={participant.id}
                        onClick={() => handleMentionSelect(participant.profiles.username)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors text-left"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={participant.profiles.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {participant.profiles.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{participant.profiles.username}</p>
                          <p className="text-xs text-muted-foreground">
                            Tap to mention
                          </p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

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
                  ref={inputRef}
                  placeholder="Type @ to mention someone..."
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !showMentions) {
                      handleSendMessage();
                    }
                  }}
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
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
