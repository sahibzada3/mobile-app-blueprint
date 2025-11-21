import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SubmitDialogProps {
  challengeId: string;
  onSuccess?: () => void;
  children: React.ReactNode;
}

export default function SubmitDialog({ challengeId, onSuccess, children }: SubmitDialogProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo");
      return;
    }

    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in to submit");
        navigate("/login");
        return;
      }

      // Upload to storage
      const fileName = `${session.user.id}/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      // Create photo record
      const { data: photoData, error: photoError } = await supabase
        .from("photos")
        .insert({
          user_id: session.user.id,
          image_url: publicUrl,
          caption,
        })
        .select()
        .single();

      if (photoError) throw photoError;

      // Create challenge submission
      const { error: submissionError } = await supabase
        .from("challenge_submissions")
        .insert({
          challenge_id: challengeId,
          user_id: session.user.id,
          photo_id: photoData.id,
        });

      if (submissionError) throw submissionError;

      toast.success("Challenge entry submitted successfully!");
      setOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      onSuccess?.();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.message || "Failed to submit entry");
    } finally {
      setUploading(false);
    }
  };

  const handleCameraCapture = () => {
    setOpen(false);
    navigate("/camera", { state: { challengeId } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Challenge Entry</DialogTitle>
          <DialogDescription>
            Choose how you'd like to submit your photo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={handleCameraCapture}
            >
              <Camera className="w-6 h-6" />
              <span className="text-sm">Use Camera</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-6 h-6" />
              <span className="text-sm">Upload Photo</span>
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-3">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caption">Caption (optional)</Label>
                <Textarea
                  id="caption"
                  placeholder="Describe your photo..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setCaption("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 shadow-glow"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Entry"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
