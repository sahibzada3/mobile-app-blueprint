import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Camera, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

interface Chain {
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
  const navigate = useNavigate();
  const [chain, setChain] = useState<Chain | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    checkAuth();
    loadChainData();

    const channel = supabase
      .channel(`chain-${chainId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_participants', filter: `chain_id=eq.${chainId}` }, loadChainData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_contributions', filter: `chain_id=eq.${chainId}` }, loadChainData)
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

  const loadChainData = async () => {
    try {
      // Load chain details
      const { data: chainData, error: chainError } = await supabase
        .from("spotlight_chains")
        .select("*")
        .eq("id", chainId)
        .single();

      if (chainError) throw chainError;

      // Load creator profile
      const { data: creatorProfile } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", chainData.creator_id)
        .single();

      setChain({ ...chainData, profiles: creatorProfile || undefined });

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
      toast.error("Failed to load chain data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChain = async () => {
    if (!user) return;

    if (participants.length >= (chain?.max_participants || 10)) {
      toast.error("This chain is full");
      return;
    }

    try {
      const { error } = await supabase
        .from("chain_participants")
        .insert({ chain_id: chainId, user_id: user.id });

      if (error) throw error;
      toast.success("Joined chain successfully!");
      loadChainData();
    } catch (error: any) {
      toast.error("Failed to join chain");
      console.error(error);
    }
  };

  const handleAddContribution = () => {
    // Navigate to camera with chain context
    navigate(`/camera?chainId=${chainId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading chain...</p>
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Chain not found</p>
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
          Back to Chains
        </Button>

        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={chain.profiles?.avatar_url || ""} />
                <AvatarFallback>{chain.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{chain.title}</h1>
                <p className="text-sm text-muted-foreground">Created by {chain.profiles?.username}</p>
              </div>
            </div>
            <Badge variant={chain.status === "active" ? "default" : "secondary"}>
              {chain.status}
            </Badge>
          </div>

          {chain.description && (
            <p className="text-muted-foreground mb-4">{chain.description}</p>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{participants.length}/{chain.max_participants} participants</span>
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
              <Button onClick={handleJoinChain} className="flex-1">
                <UserPlus className="w-4 h-4 mr-2" />
                Join Chain
              </Button>
            ) : (
              <Button onClick={handleAddContribution} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Add Photo
              </Button>
            )}
          </div>
        </Card>

        <h2 className="text-xl font-semibold mb-4">Contributions</h2>
        {contributions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No contributions yet. Be the first to add a photo!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contributions.map((contribution) => (
              <Card key={contribution.id} className="overflow-hidden">
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
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
