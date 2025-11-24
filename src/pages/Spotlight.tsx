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

interface Flare {
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
  const [flares, setFlares] = useState<Flare[]>([]);
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
    loadFlares();
    loadFriends();

    const channel = supabase
      .channel('spotlight-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'spotlight_chains' }, loadFlares)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_participants' }, loadFlares)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chain_contributions' }, loadFlares)
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

  const loadFlares = async () => {
    try {
      const { data: flaresData, error } = await supabase
        .from("spotlight_chains")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Load participant, contribution counts, and creator profiles
      const flaresWithCounts = await Promise.all(
        (flaresData || []).map(async (flare) => {
          const [participantResult, contributionResult, profileResult] = await Promise.all([
            supabase.from("chain_participants").select("id", { count: "exact" }).eq("chain_id", flare.id),
            supabase.from("chain_contributions").select("id", { count: "exact" }).eq("chain_id", flare.id),
            supabase.from("profiles").select("username, avatar_url").eq("id", flare.creator_id).single(),
          ]);

          return {
            ...flare,
            participant_count: participantResult.count || 0,
            contribution_count: contributionResult.count || 0,
            profiles: profileResult.data || undefined,
          };
        })
      );

      setFlares(flaresWithCounts);
    } catch (error: any) {
      toast.error("Failed to load flares");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendingFlares = () => {
    return [...flares]
      .filter(flare => friendIds.includes(flare.creator_id) || flare.creator_id === user?.id)
      .sort((a, b) => (b.contribution_count || 0) - (a.contribution_count || 0))
      .slice(0, 10);
  };

  const FlareCard = ({ flare }: { flare: Flare }) => (
    <Card
      className="group glass-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover-lift border-border/50"
      onClick={() => navigate(`/spotlight/${flare.id}`)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="ring-2 ring-primary/10 shadow-sm">
              <AvatarImage src={flare.profiles?.avatar_url || ""} />
              <AvatarFallback className="text-xs font-semibold">{flare.profiles?.username?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-base tracking-tight group-hover:text-primary transition-colors">{flare.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">by {flare.profiles?.username}</p>
            </div>
          </div>
          <Badge 
            variant={flare.status === "active" ? "default" : "secondary"} 
            className="shadow-sm"
          >
            {flare.status}
          </Badge>
        </div>

        {flare.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{flare.description}</p>
        )}

        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-primary/70" />
            <span className="font-medium">{flare.participant_count}/{flare.max_participants}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-primary/70" />
            <span className="font-medium">{flare.contribution_count} photos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary/70" />
            <span className="font-medium">{new Date(flare.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading flares...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-soft pb-20">
      {/* Premium Header */}
      <header className="sticky top-0 glass-strong border-b border-border/30 z-40 shadow-elevated backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-display font-bold tracking-tight">Flares</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Collaborative photo stories</p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)} size="lg" className="shadow-card hover:shadow-card-hover">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-5 pt-6">

        <Tabs defaultValue="all" className="space-y-5">
          <TabsList className="grid w-full grid-cols-3 glass h-12 p-1.5">
            <TabsTrigger value="all" className="text-sm font-medium">All Flares</TabsTrigger>
            <TabsTrigger value="trending" className="text-sm font-medium">Trending</TabsTrigger>
            <TabsTrigger value="chat" className="text-sm font-medium">
              <MessageCircle className="w-4 h-4 mr-1.5" />
              Chat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {flares.length === 0 ? (
              <Card className="glass-card border-border/50">
                <div className="p-10 text-center">
                  <p className="text-muted-foreground mb-5 text-sm">No flares yet. Be the first to create one!</p>
                  <Button onClick={() => setShowCreateDialog(true)} size="lg" className="shadow-card">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Flare
                  </Button>
                </div>
              </Card>
            ) : (
              flares.map((flare) => <FlareCard key={flare.id} flare={flare} />)
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-4">
            {getTrendingFlares().length === 0 ? (
              <Card className="glass-card border-border/50">
                <div className="p-10 text-center">
                  <p className="text-muted-foreground text-sm">No trending flares yet</p>
                </div>
              </Card>
            ) : (
              getTrendingFlares().map((flare, index) => (
                <div key={flare.id} className="relative">
                  {index < 3 && (
                    <Badge className="absolute -left-2 -top-2 z-10 shadow-card" variant="secondary">
                      #{index + 1}
                    </Badge>
                  )}
                  <FlareCard flare={flare} />
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
        onSuccess={loadFlares}
      />

      <BottomNav />
    </div>
  );
}
