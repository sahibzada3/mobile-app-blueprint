import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Users, Camera, Link2, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface SearchUser {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
}

interface SearchPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  user_id: string;
  profiles: {
    username: string;
  };
}

interface SearchChain {
  id: string;
  title: string;
  description: string | null;
  status: string;
  profiles: {
    username: string;
  };
}

export default function Search() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [photos, setPhotos] = useState<SearchPhoto[]>([]);
  const [chains, setChains] = useState<SearchChain[]>([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<string[]>([
    "Golden Hour",
    "Landscape",
    "Wildlife",
    "Urban",
    "Minimalist",
  ]);

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      performSearch();
    } else {
      clearResults();
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const query = searchQuery.toLowerCase();

      // Search users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, bio")
        .ilike("username", `%${query}%`)
        .limit(10);

      // Search photos with user info
      const { data: photosData } = await supabase
        .from("photos")
        .select("id, image_url, caption, user_id")
        .ilike("caption", `%${query}%`)
        .limit(20);

      // Get usernames for photos
      let photosWithProfiles: SearchPhoto[] = [];
      if (photosData) {
        const userIds = [...new Set(photosData.map(p => p.user_id))];
        const { data: usersData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", userIds);

        photosWithProfiles = photosData.map(photo => ({
          ...photo,
          profiles: {
            username: usersData?.find(u => u.id === photo.user_id)?.username || "Unknown"
          }
        }));
      }

      // Search chains with creator info
      const { data: chainsData } = await supabase
        .from("spotlight_chains")
        .select("id, title, description, status, creator_id")
        .ilike("title", `%${query}%`)
        .limit(10);

      // Get creator usernames for chains
      let chainsWithProfiles: SearchChain[] = [];
      if (chainsData) {
        const creatorIds = chainsData.map(c => c.creator_id);
        const { data: creatorsData } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", creatorIds);

        chainsWithProfiles = chainsData.map(chain => ({
          ...chain,
          profiles: {
            username: creatorsData?.find(p => p.id === chain.creator_id)?.username || "Unknown"
          }
        }));
      }

      setUsers(usersData || []);
      setPhotos(photosWithProfiles);
      setChains(chainsWithProfiles);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setUsers([]);
    setPhotos([]);
    setChains([]);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search users, photos, chains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 text-lg h-12"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {searchQuery.trim().length < 2 ? (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Trending Topics</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    onClick={() => setSearchQuery(tag)}
                    className="rounded-full"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="chains">Chains</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {users.length > 0 && (
                <ResultSection title="Users" icon={Users}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.slice(0, 4).map((user) => (
                      <UserCard key={user.id} user={user} onClick={() => navigate(`/profile/${user.id}`)} />
                    ))}
                  </div>
                </ResultSection>
              )}

              {photos.length > 0 && (
                <ResultSection title="Photos" icon={Camera}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.slice(0, 8).map((photo) => (
                      <PhotoCard key={photo.id} photo={photo} />
                    ))}
                  </div>
                </ResultSection>
              )}

              {chains.length > 0 && (
                <ResultSection title="Chains" icon={Link2}>
                  <div className="space-y-4">
                    {chains.slice(0, 4).map((chain) => (
                      <ChainCard key={chain.id} chain={chain} onClick={() => navigate(`/spotlight/${chain.id}`)} />
                    ))}
                  </div>
                </ResultSection>
              )}
            </TabsContent>

            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map((user) => (
                  <UserCard key={user.id} user={user} onClick={() => navigate(`/profile/${user.id}`)} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="photos">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chains">
              <div className="space-y-4">
                {chains.map((chain) => (
                  <ChainCard key={chain.id} chain={chain} onClick={() => navigate(`/spotlight/${chain.id}`)} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function ResultSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function UserCard({ user, onClick }: { user: SearchUser; onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="cursor-pointer" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback>{user.username[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{user.username}</h3>
              {user.bio && (
                <p className="text-sm text-muted-foreground truncate">{user.bio}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PhotoCard({ photo }: { photo: SearchPhoto }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="overflow-hidden cursor-pointer aspect-square">
        <img src={photo.image_url} alt={photo.caption || ""} className="w-full h-full object-cover" />
      </Card>
    </motion.div>
  );
}

function ChainCard({ chain, onClick }: { chain: SearchChain; onClick: () => void }) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Card className="cursor-pointer" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0">
              <Link2 className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{chain.title}</h3>
              {chain.description && (
                <p className="text-sm text-muted-foreground truncate">{chain.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                by {chain.profiles.username}
              </p>
            </div>
            <Badge variant={chain.status === 'active' ? 'default' : 'secondary'}>
              {chain.status}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}