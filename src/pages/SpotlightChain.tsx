import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Camera, UserPlus, Users, MessageCircle, Trophy } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import BottomNav from "@/components/BottomNav";
import GroupChatInterface from "@/components/spotlight/GroupChatInterface";
import ContributionSubmitDialog from "@/components/spotlight/ContributionSubmitDialog";
import InviteFriendsDialog from "@/components/spotlight/InviteFriendsDialog";

interface Flare {
  id: string;
  title: string;
  description: string | null;
  max_participants: number;
  status: string;
  created_at: string;
  creator_id: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

interface Participant {
  id: string;
  user_id: string;
  joined_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

interface Contribution {
  id: string;
  created_at: string;
  user_id: string;
  photos: {
    id: string;
    image_url: string;
    caption: string | null;
  };
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export default function SpotlightChain() {
  const { chainId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flare, setFlare] = useState<Flare | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  
  // Check if we have a new photo to submit
  const photoIdToSubmit = searchParams.get("photoId");
  const photoUrlToSubmit = searchParams.get("photoUrl");
  const [showSubmitDialog, setShowSubmitDialog] = useState(!!photoIdToSubmit);

  useEffect(() => {
    checkAuth();
    loadFlareData();

    const channel = supabase
      .channel(`chain-${chainId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_participants', filter: `chain_id=eq.${chainId}` }, loadFlareData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_contributions', filter: `chain_id=eq.${chainId}` }, loadFlareData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chainId]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
  };

  const loadFlareData = async () => {
    try {
      // Load flare details
      const { data: flareData, error: flareError } = await supabase
        .from("spotlight_chains")
        .select("*")
        .eq("id", chainId)
        .single();

      if (flareError) throw flareError;

      // Load creator profile
      const { data: creatorProfile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", flareData.creator_id)
        .single();

      setFlare({ ...flareData, profiles: creatorProfile || undefined });

      // Load participants
      const { data: participantsData, error: participantsError } = await supabase
        .from("chain_participants")
        .select("*")
        .eq("chain_id", chainId)
        .order("joined_at", { ascending: true });

      if (participantsError) throw participantsError;

      // Load profiles for participants
      const participantsWithProfiles = await Promise.all(
        (participantsData || []).map(async (participant) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", participant.user_id)
            .single();
          
          return { ...participant, profiles: profile || undefined };
        })
      );

      setParticipants(participantsWithProfiles);

      // Check if current user is participant
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const isUserParticipant = participantsData?.some(p => p.user_id === session.user.id);
        setIsParticipant(!!isUserParticipant);
      }

      // Load contributions
      const { data: contributionsData, error: contributionsError } = await supabase
        .from("chain_contributions")
        .select("*, photos (id, image_url, caption)")
        .eq("chain_id", chainId)
        .order("created_at", { ascending: false });

      if (contributionsError) throw contributionsError;

      // Load profiles for contributions
      const contributionsWithProfiles = await Promise.all(
        (contributionsData || []).map(async (contribution) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", contribution.user_id)
            .single();
          
          return { ...contribution, profiles: profile || undefined };
        })
      );

      setContributions(contributionsWithProfiles);
    } catch (error: any) {
      toast.error("Failed to load flare data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinFlare = async () => {
    if (!user) return;

    if (participants.length >= (flare?.max_participants || 10)) {
      toast.error("This flare is full");
      return;
    }

    try {
      const { error } = await supabase
        .from("chain_participants")
        .insert({ chain_id: chainId, user_id: user.id });

      if (error) throw error;
      toast.success("Joined flare successfully!");
      loadFlareData();
    } catch (error: any) {
      toast.error("Failed to join flare");
      console.error(error);
    }
  };

  const handleAddContribution = () => {
    // Navigate to camera with flare context
    navigate(`/camera?chainId=${chainId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading flare...</p>
      </div>
    );
  }

  if (!flare) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Flare not found</p>
          <Button onClick={() => navigate("/spotlight")}>Back to Spotlight</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate("/spotlight")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Flares
        </Button>

        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={flare.profiles?.avatar_url || ""} />
                <AvatarFallback>{flare.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{flare.title}</h1>
                <p className="text-sm text-muted-foreground">Created by {flare.profiles?.username}</p>
              </div>
            </div>
            <Badge variant={flare.status === "active" ? "default" : "secondary"}>
              {flare.status}
            </Badge>
          </div>

          {flare.description && (
            <p className="text-muted-foreground mb-4">{flare.description}</p>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participants.length}/{flare.max_participants} participants</span>
            </div>
            <div className="flex -space-x-2">
              {participants.slice(0, 5).map((participant) => (
                <Avatar key={participant.id} className="border-2 border-background w-8 h-8">
                  <AvatarImage src={participant.profiles?.avatar_url || ""} />
                  <AvatarFallback>{participant.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              ))}
              {participants.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                  +{participants.length - 5}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isParticipant ? (
              <Button onClick={handleJoinFlare} className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Flare
              </Button>
            ) : (
              <>
                <Button onClick={handleAddContribution} className="flex-1">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowInviteDialog(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              </>
            )}
          </div>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Flare Content</h2>
        
        <Tabs defaultValue="contributions" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contributions">
              <Camera className="w-4 h-4 mr-2" />
              Contributions
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Group Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contributions">
            {contributions.length === 0 ? (
              <Card className="p-8 text-center">
                <Camera className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                <p className="text-muted-foreground mb-2">No contributions yet</p>
                <p className="text-sm text-muted-foreground">Be the first to add a photo!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contributions.map((contribution, index) => (
                  <motion.div
                    key={contribution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                      {index < 3 && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge variant="secondary" className="gap-1">
                            <Trophy className="w-3 h-3" />
                            #{index + 1}
                          </Badge>
                        </div>
                      )}
                      <img
                        src={contribution.photos.image_url}
                        alt="Contribution"
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={contribution.profiles?.avatar_url || ""} />
                            <AvatarFallback>
                              {contribution.profiles?.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{contribution.profiles?.username}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(contribution.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {contribution.photos.caption && (
                          <p className="text-sm text-muted-foreground">{contribution.photos.caption}</p>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="chat">
            {isParticipant && user ? (
              <div className="h-[600px]">
                <GroupChatInterface
                  chainId={chainId!}
                  chainTitle={flare.title}
                  currentUserId={user.id}
                />
              </div>
            ) : (
              <Card className="p-8 text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-2">Join this flare to access the group chat</p>
                <p className="text-sm text-muted-foreground">
                  Chat with other participants and share your thoughts about the flare
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {photoIdToSubmit && photoUrlToSubmit && (
        <ContributionSubmitDialog
          open={showSubmitDialog}
          onOpenChange={setShowSubmitDialog}
          chainId={chainId!}
          photoId={photoIdToSubmit}
          photoUrl={photoUrlToSubmit}
        />
      )}

      <InviteFriendsDialog
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        chainId={chainId!}
        currentParticipants={participants.map(p => p.user_id)}
      />

      <BottomNav />
    </div>
  );
}
