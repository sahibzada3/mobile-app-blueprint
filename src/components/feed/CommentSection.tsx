import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentSectionProps {
  photoId: string;
  currentUserId?: string;
}

export const CommentSection = ({ photoId, currentUserId }: CommentSectionProps) => {
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editContent, setEditContent] = React.useState("");
  const [showComments, setShowComments] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    loadComments();
    
    const channel = supabase
      .channel(`comments-${photoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `photo_id=eq.${photoId}`
        },
        () => loadComments()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [photoId]);

  const loadComments = async () => {
    const { data } = await supabase
      .from("comments")
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq("photo_id", photoId)
      .order("created_at", { ascending: false });

    if (data) setComments(data);
  };

  const handleAddComment = async () => {
    if (!currentUserId) {
      toast({ title: "Please login to comment", variant: "destructive" });
      return;
    }

    if (!newComment.trim()) return;

    const { error } = await supabase
      .from("comments")
      .insert({
        photo_id: photoId,
        user_id: currentUserId,
        content: newComment.trim(),
      });

    if (error) {
      toast({ title: "Failed to add comment", variant: "destructive" });
    } else {
      setNewComment("");
      toast({ title: "Comment added!" });
    }
  };

  const handleEdit = async (commentId: string) => {
    if (!editContent.trim()) return;

    const { error } = await supabase
      .from("comments")
      .update({ content: editContent.trim() })
      .eq("id", commentId);

    if (error) {
      toast({ title: "Failed to update comment", variant: "destructive" });
    } else {
      setEditingId(null);
      setEditContent("");
      toast({ title: "Comment updated!" });
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    } else {
      toast({ title: "Comment deleted" });
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowComments(!showComments)}
        className="gap-2"
      >
        <MessageCircle className="w-4 h-4" />
        {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
      </Button>

      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <div className="space-y-4">
                {comments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {comment.profiles.username[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">
                          {comment.profiles.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      
                      {editingId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEdit(comment.id)}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm">{comment.content}</p>
                      )}

                      {currentUserId === comment.user_id && editingId !== comment.id && (
                        <div className="flex gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(comment.id);
                              setEditContent(comment.content);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(comment.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button onClick={handleAddComment} size="icon">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
