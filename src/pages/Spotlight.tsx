import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, TrendingUp, Clock, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import CreateChainDialog from "@/components/spotlight/CreateChainDialog";
import FriendsList from "@/components/spotlight/FriendsList";
import ChatInterface from "@/components/spotlight/ChatInterface";

interface Chain {
  id: string;
  title: string;
  description: string | null;
  max_participants: number;
  status: string;
  created_at: string;
  creator_id: string;
  participant_count?: number;
  contribution_count?: number;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

export default function Spotlight() {
  const navigate = useNavigate();
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [friendIds, setFriendIds] = useState<string[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<{
    id: string;
    name: string;
    avatar: string | null;
  } | null>(null);

  useEffect(() => {
    checkAuth();
    loadChains();
    loadFriends();

    const channel = supabase
      .channel('spotlight-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spotlight_chains' }, loadChains)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_participants' }, loadChains)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_contributions' }, loadChains)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, loadFriends)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
  };

  const loadFriends = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("friendships")
        .select("friend_id")
        .eq("user_id", session.user.id)
        .eq("status", "accepted");

      if (error) throw error;

      setFriendIds(data?.map(f => f.friend_id) || []);
    } catch (error: any) {
      console.error("Failed to load friends:", error);
    }
  };

  const loadChains = async () => {
    try {
      const { data: chainsData, error } = await supabase
        .from("spotlight_chains")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load participant, contribution counts, and creator profiles
      const chainsWithCounts = await Promise.all(
        (chainsData || []).map(async (chain) => {
          const [participantResult, contributionResult, profileResult] = await Promise.all([
            supabase.from("chain_participants").select("id", { count: "exact" }).eq("chain_id", chain.id),
            supabase.from("chain_contributions").select("id", { count: "exact" }).eq("chain_id", chain.id),
            supabase.from("profiles").select("username, avatar_url").eq("id", chain.creator_id).single(),
          ]);

          return {
            ...chain,
            participant_count: participantResult.count || 0,
            contribution_count: contributionResult.count || 0,
            profiles: profileResult.data || undefined,
          };
        })
      );

      setChains(chainsWithCounts);
    } catch (error: any) {
      toast.error("Failed to load chains");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingChains = () => {
    return [...chains]
      .filter(chain => friendIds.includes(chain.creator_id) || chain.creator_id === user?.id)
      .sort((a, b) => (b.contribution_count || 0) - (a.contribution_count || 0))
      .slice(0, 10);
  };

  const ChainCard = ({ chain }: { chain: Chain }) => (
    <Card
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/spotlight/${chain.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={chain.profiles?.avatar_url || ""} />
            <AvatarFallback>{chain.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">{chain.title}</h3>
            <p className="text-sm text-muted-foreground">by {chain.profiles?.username}</p>
          </div>
        </div>
        <Badge variant={chain.status === "active" ? "default" : "secondary"}>
          {chain.status}
        </Badge>
      </div>

      {chain.description && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{chain.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{chain.participant_count}/{chain.max_participants}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{chain.contribution_count} photos</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{new Date(chain.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading chains...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Spotlight Chains</h1>
            <p className="text-muted-foreground">Collaborative photo stories with friends</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Chain
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Chains</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="chat">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {chains.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No chains yet. Be the first to create one!</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Chain
                </Button>
              </Card>
            ) : (
              chains.map((chain) => <ChainCard key={chain.id} chain={chain} />)
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-3">
            {getTrendingChains().length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No trending chains yet</p>
              </Card>
            ) : (
              getTrendingChains().map((chain, index) => (
                <div key={chain.id} className="relative">
                  {index < 3 && (
                    <Badge className="absolute -left-2 -top-2 z-10" variant="secondary">
                      #{index + 1}
                    </Badge>
                  )}
                  <ChainCard chain={chain} />
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="chat">
            <div className="grid md:grid-cols-3 gap-4 h-[calc(100vh-250px)]">
              <div className="md:col-span-1">
                {user && (
                  <FriendsList
                    currentUserId={user.id}
                    onSelectFriend={(id, name, avatar) =>
                      setSelectedFriend({ id, name, avatar })
                    }
                    selectedFriendId={selectedFriend?.id}
                  />
                )}
              </div>
              <div className="md:col-span-2">
                {selectedFriend && user ? (
                  <ChatInterface
                    friendId={selectedFriend.id}
                    friendName={selectedFriend.name}
                    friendAvatar={selectedFriend.avatar}
                    currentUserId={user.id}
                  />
                ) : (
                  <Card className="h-full flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a friend to start chatting</p>
                      <p className="text-sm mt-2">
                        Share pictures and discuss spotlight chains
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <CreateChainDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadChains}
      />

      <BottomNav />
    </div>
  );
}
