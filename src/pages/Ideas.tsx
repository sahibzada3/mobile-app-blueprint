import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Lightbulb, MapPin, Cloud, Camera } from "lucide-react";
import { photographyIdeas, IdeaCategory, DifficultyLevel } from "@/data/photographyIdeas";
import IdeaCard from "@/components/ideas/IdeaCard";
import { useTheme } from "@/hooks/useTheme";
import { Moon, Sun } from "lucide-react";

export default function Ideas() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [bookmarkedIdeas, setBookmarkedIdeas] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "all">("all");
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | "all">("all");

  useEffect(() => {
    checkAuth();
    loadBookmarks();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
      return;
    }
    setUser(session.user);
  };

  const loadBookmarks = () => {
    const stored = localStorage.getItem("bookmarkedIdeas");
    if (stored) {
      setBookmarkedIdeas(JSON.parse(stored));
    }
  };

  const handleBookmark = (ideaId: string) => {
    const newBookmarks = bookmarkedIdeas.includes(ideaId)
      ? bookmarkedIdeas.filter(id => id !== ideaId)
      : [...bookmarkedIdeas, ideaId];
    
    setBookmarkedIdeas(newBookmarks);
    localStorage.setItem("bookmarkedIdeas", JSON.stringify(newBookmarks));
  };

  const filteredIdeas = photographyIdeas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tips.some(tip => tip.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = selectedDifficulty === "all" || idea.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === "all" || idea.category === selectedCategory;

    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const bookmarkedIdeaObjects = photographyIdeas.filter(idea => bookmarkedIdeas.includes(idea.id));

  const categories: Array<{ value: IdeaCategory | "all"; label: string; icon: any }> = [
    { value: "all", label: "All", icon: Camera },
    { value: "composition", label: "Composition", icon: Lightbulb },
    { value: "lighting", label: "Lighting", icon: Sun },
    { value: "weather", label: "Weather", icon: Cloud },
    { value: "location", label: "Locations", icon: MapPin },
    { value: "technique", label: "Techniques", icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      <header className="sticky top-0 bg-card/80 backdrop-blur-lg border-b border-border z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-primary">Photography Ideas</h1>
            <p className="text-sm text-muted-foreground">Tips, techniques & inspiration</p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="p-4 mb-6 shadow-nature">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tips, techniques, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Difficulty Level</p>
              <div className="flex gap-2">
                <Badge
                  variant={selectedDifficulty === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDifficulty("all")}
                >
                  All
                </Badge>
                <Badge
                  variant={selectedDifficulty === "beginner" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDifficulty("beginner")}
                >
                  Beginner
                </Badge>
                <Badge
                  variant={selectedDifficulty === "intermediate" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDifficulty("intermediate")}
                >
                  Intermediate
                </Badge>
                <Badge
                  variant={selectedDifficulty === "advanced" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedDifficulty("advanced")}
                >
                  Advanced
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Badge
                      key={cat.value}
                      variant={selectedCategory === cat.value ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {cat.label}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{photographyIdeas.length}</p>
            <p className="text-sm text-muted-foreground">Total Ideas</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{bookmarkedIdeas.length}</p>
            <p className="text-sm text-muted-foreground">Bookmarked</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{filteredIdeas.length}</p>
            <p className="text-sm text-muted-foreground">Found</p>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">
              All Ideas ({filteredIdeas.length})
            </TabsTrigger>
            <TabsTrigger value="bookmarked">
              Bookmarked ({bookmarkedIdeaObjects.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredIdeas.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No ideas found matching your filters.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedDifficulty("all");
                    setSelectedCategory("all");
                  }}
                >
                  Clear Filters
                </Button>
              </Card>
            ) : (
              filteredIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isBookmarked={bookmarkedIdeas.includes(idea.id)}
                  onBookmark={handleBookmark}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-4">
            {bookmarkedIdeaObjects.length === 0 ? (
              <Card className="p-8 text-center">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No bookmarked ideas yet</p>
                <p className="text-sm text-muted-foreground">
                  Bookmark your favorite photography tips to access them quickly later!
                </p>
              </Card>
            ) : (
              bookmarkedIdeaObjects.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  isBookmarked={true}
                  onBookmark={handleBookmark}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
