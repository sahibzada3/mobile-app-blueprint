import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ThumbsUp, ThumbsDown, Trophy, Calendar, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubmissionModalProps {
  submission: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVote: (photoId: string, voteType: "upvote" | "downvote") => void;
  userVote?: string;
  currentUserId?: string;
  rank?: number;
}

export default function SubmissionModal({
  submission,
  open,
  onOpenChange,
  onVote,
  userVote,
  currentUserId,
  rank,
}: SubmissionModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  const isOwnSubmission = currentUserId === submission.user_id;

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { color: "bg-amber-500", label: "1st Place" };
    if (rank === 2) return { color: "bg-gray-400", label: "2nd Place" };
    if (rank === 3) return { color: "bg-amber-700", label: "3rd Place" };
    return null;
  };

  const rankBadge = rank ? getRankBadge(rank) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden">
        <div className="grid md:grid-cols-[1fr,400px] h-full">
          {/* Image Section */}
          <div className="relative bg-black flex items-center justify-center overflow-hidden">
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
            <img
              src={submission.photo?.image_url}
              alt={`Submission by ${submission.profile?.username || "Anonymous"}`}
              className={cn(
                "max-w-full max-h-full object-contain transition-opacity duration-300",
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImageLoaded(true)}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Details Section */}
          <div className="flex flex-col bg-card overflow-y-auto">
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={submission.profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {submission.profile?.username?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-lg truncate">
                      {submission.profile?.username || "Anonymous"}
                    </DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(submission.submitted_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            {/* Rank and Winner Badge */}
            {(rankBadge || submission.is_winner) && (
              <>
                <div className="px-6 py-4 space-y-2">
                  {rankBadge && (
                    <Badge className={`${rankBadge.color} text-white`}>
                      <Trophy className="w-3 h-3 mr-1" />
                      {rankBadge.label}
                    </Badge>
                  )}
                  {submission.is_winner && (
                    <Badge className="bg-secondary text-secondary-foreground">
                      <Trophy className="w-3 h-3 mr-1" />
                      Challenge Winner
                    </Badge>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Score Section */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Score</span>
                <span className="text-2xl font-bold text-primary">{submission.score}</span>
              </div>

              {/* Voting Buttons */}
              {!isOwnSubmission && currentUserId && (
                <div className="flex gap-2">
                  <Button
                    variant={userVote === "upvote" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => onVote(submission.photo_id, "upvote")}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Upvote
                  </Button>
                  <Button
                    variant={userVote === "downvote" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => onVote(submission.photo_id, "downvote")}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Downvote
                  </Button>
                </div>
              )}

              {isOwnSubmission && (
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">This is your submission</p>
                </div>
              )}
            </div>

            <Separator />

            {/* Caption */}
            {submission.photo?.caption && (
              <>
                <div className="px-6 py-4">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    Caption
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {submission.photo.caption}
                  </p>
                </div>
                <Separator />
              </>
            )}

            {/* Photo Details */}
            <div className="px-6 py-4 space-y-3 flex-1">
              <h4 className="text-sm font-semibold mb-3">Submission Details</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Submitted</span>
                  <span className="font-medium">
                    {new Date(submission.submitted_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {submission.photo?.filters && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Filters Applied</span>
                    <Badge variant="outline" className="text-xs">
                      {Object.keys(submission.photo.filters).length} filters
                    </Badge>
                  </div>
                )}

                {submission.photo?.typography_data && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Typography</span>
                    <Badge variant="outline" className="text-xs">
                      Custom overlay
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
