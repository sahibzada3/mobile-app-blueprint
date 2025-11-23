import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Lightbulb, MapPin, Cloud, Camera, Sun, Moon, Zap, Palette } from "lucide-react";
import { photographyIdeas, IdeaCategory, DifficultyLevel } from "@/data/photographyIdeas";
import { filterGuides } from "@/data/filterGuides";
import IdeaCard from "@/components/ideas/IdeaCard";
import FilterGuideCard from "@/components/ideas/FilterGuideCard";
import { useTheme } from "@/hooks/useTheme";

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
    { value: "composition", label: "Composition", icon: Palette },
    { value: "lighting", label: "Lighting", icon: Sun },
    { value: "weather", label: "Weather", icon: Cloud },
    { value: "location", label: "Locations", icon: MapPin },
    { value: "technique", label: "Techniques", icon: Zap },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedDifficulty("all");
    setSelectedCategory("all");
  };

  return (
    <div className="min-h-screen bg-gradient-soft pb-20">
      {/* Header */}
      <header className="sticky top-0 bg-card/95 backdrop-blur-lg border-b border-border z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-display font-bold text-primary">Photography Ideas</h1>
              <p className="text-sm text-muted-foreground mt-1">Master cinematic techniques with expert guidance</p>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <Card className="p-3 text-center bg-primary/5 border-primary/20">
              <p className="text-2xl font-bold text-primary">{photographyIdeas.length}</p>
              <p className="text-xs text-muted-foreground">Total Ideas</p>
            </Card>
            <Card className="p-3 text-center bg-secondary/5 border-secondary/20">
              <p className="text-2xl font-bold text-secondary">{bookmarkedIdeas.length}</p>
              <p className="text-xs text-muted-foreground">Bookmarked</p>
            </Card>
            <Card className="p-3 text-center bg-accent/5 border-accent/20">
              <p className="text-2xl font-bold text-accent">{filteredIdeas.length}</p>
              <p className="text-xs text-muted-foreground">Matches</p>
            </Card>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filters */}
        <Card className="p-4 mb-6 shadow-nature">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tips, techniques, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>

            {/* Category Filter */}
            <div>
              <p className="text-sm font-semibold mb-2 text-foreground">Category</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <Badge
                      key={cat.value}
                      variant={selectedCategory === cat.value ? "default" : "outline"}
                      className="cursor-pointer px-3 py-2 transition-all hover:scale-105"
                      onClick={() => setSelectedCategory(cat.value)}
                    >
                      <Icon className="w-3.5 h-3.5 mr-1.5" />
                      {cat.label}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <p className="text-sm font-semibold mb-2 text-foreground">Difficulty Level</p>
              <div className="flex gap-2">
                <Badge
                  variant={selectedDifficulty === "all" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 hover:scale-105 transition-all"
                  onClick={() => setSelectedDifficulty("all")}
                >
                  All Levels
                </Badge>
                <Badge
                  variant={selectedDifficulty === "beginner" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 hover:scale-105 transition-all"
                  onClick={() => setSelectedDifficulty("beginner")}
                >
                  Beginner
                </Badge>
                <Badge
                  variant={selectedDifficulty === "intermediate" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 hover:scale-105 transition-all"
                  onClick={() => setSelectedDifficulty("intermediate")}
                >
                  Intermediate
                </Badge>
                <Badge
                  variant={selectedDifficulty === "advanced" ? "default" : "outline"}
                  className="cursor-pointer px-3 py-2 hover:scale-105 transition-all"
                  onClick={() => setSelectedDifficulty("advanced")}
                >
                  Advanced
                </Badge>
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedDifficulty !== "all" || selectedCategory !== "all") && (
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
                Clear All Filters
              </Button>
            )}
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="filters" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-12">
            <TabsTrigger value="filters" className="text-sm">
              <Palette className="w-4 h-4 mr-2" />
              Filter Guides
            </TabsTrigger>
            <TabsTrigger value="all" className="text-sm">
              <Camera className="w-4 h-4 mr-2" />
              All Ideas
            </TabsTrigger>
            <TabsTrigger value="bookmarked" className="text-sm">
              <Lightbulb className="w-4 h-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filters" className="space-y-6">
            <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-4 mb-6 border border-primary/20">
              <h3 className="text-lg font-bold mb-2">🎨 Master Our 12 Cinematic Filters</h3>
              <p className="text-sm text-muted-foreground">
                Learn from a mentor's perspective - each guide includes detailed camera settings, 
                step-by-step instructions, common mistakes to avoid, and pro techniques to elevate your photography.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filterGuides.map((guide) => (
                <FilterGuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            {filteredIdeas.length === 0 ? (
              <Card className="p-12 text-center">
                <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No ideas found</p>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    isBookmarked={bookmarkedIdeas.includes(idea.id)}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-6">
            {bookmarkedIdeaObjects.length === 0 ? (
              <Card className="p-12 text-center">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No bookmarked ideas yet</p>
                <p className="text-sm text-muted-foreground">
                  Bookmark your favorite photography tips to access them quickly later!
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarkedIdeaObjects.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    isBookmarked={true}
                    onBookmark={handleBookmark}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
