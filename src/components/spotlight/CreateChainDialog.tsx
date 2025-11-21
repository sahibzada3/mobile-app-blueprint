import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CreateChainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateChainDialog({ open, onOpenChange, onSuccess }: CreateChainDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("You must be logged in to create a chain");
        return;
      }

      // Create the chain
      const { data: chainData, error: chainError } = await supabase
        .from("spotlight_chains")
        .insert({
          title: title.trim(),
          description: description.trim() || null,
          max_participants: maxParticipants,
          creator_id: session.user.id,
        })
        .select()
        .single();

      if (chainError) throw chainError;

      // Automatically add creator as first participant
      const { error: participantError } = await supabase
        .from("chain_participants")
        .insert({
          chain_id: chainData.id,
          user_id: session.user.id,
        });

      if (participantError) throw participantError;

      toast.success("Chain created successfully!");
      setTitle("");
      setDescription("");
      setMaxParticipants(10);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error("Failed to create chain");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Spotlight Chain</DialogTitle>
          <DialogDescription>
            Start a collaborative photo story with your friends
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Chain Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Summer Adventures 2024"
              maxLength={100}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this chain is about..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <Label htmlFor="maxParticipants">Maximum Participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Math.max(2, Math.min(10, parseInt(e.target.value) || 10)))}
              min={2}
              max={10}
            />
            <p className="text-xs text-muted-foreground mt-1">Between 2 and 10 participants</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Chain"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
