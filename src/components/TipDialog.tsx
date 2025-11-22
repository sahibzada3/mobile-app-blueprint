import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DollarSign, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientId: string;
  recipientUsername: string;
  photoId?: string;
}

export default function TipDialog({
  open,
  onOpenChange,
  recipientId,
  recipientUsername,
  photoId
}: TipDialogProps) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const presetAmounts = [1, 5, 10, 20];

  const handleSendTip = async () => {
    const tipAmount = parseFloat(amount);
    
    if (!tipAmount || tipAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (tipAmount > 100) {
      toast.error("Maximum tip amount is $100");
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to send tips");
        return;
      }

      const { error } = await supabase
        .from("tips")
        .insert({
          sender_id: session.user.id,
          recipient_id: recipientId,
          photo_id: photoId || null,
          amount: tipAmount,
          message: message.trim() || null
        });

      if (error) throw error;

      // Create notification
      await supabase.from("notifications").insert({
        user_id: recipientId,
        type: "tip",
        title: `You received a $${tipAmount.toFixed(2)} tip!`,
        message: message || "Someone appreciated your work",
        related_type: photoId ? "photo" : "profile",
        related_id: photoId || recipientId
      });

      toast.success(`Tip of $${tipAmount.toFixed(2)} sent to ${recipientUsername}!`);
      onOpenChange(false);
      setAmount("");
      setMessage("");
    } catch (error) {
      console.error("Error sending tip:", error);
      toast.error("Failed to send tip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Send a Tip to {recipientUsername}
          </DialogTitle>
          <DialogDescription>
            Show your appreciation for their amazing photography
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">Amount ($)</Label>
            <div className="relative mt-2">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-8"
                min="0"
                max="100"
                step="0.01"
              />
            </div>
            <div className="flex gap-2 mt-2">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                  className="flex-1"
                >
                  ${preset}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Write a nice message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSendTip} disabled={loading || !amount}>
            {loading ? "Sending..." : `Send $${amount || "0.00"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
