import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, TrendingUp, Award, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface RankData {
  rank_name: string;
  rank_level: number;
  total_points: number;
  photos_count: number;
  challenges_won: number;
  chains_created: number;
}

interface EarningsData {
  total_earned: number;
  available_balance: number;
}

interface BadgeData {
  badge_id: string;
  earned_at: string;
  badges: {
    name: string;
    icon: string;
    rarity: string;
    description: string;
  };
}

export default function RankBadgeDisplay({ userId }: { userId: string }) {
  const [rankData, setRankData] = useState<RankData | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      // Load rank data
      const { data: rankResponse } = await supabase
        .from("user_ranks")
        .select("*")
        .eq("user_id", userId)
        .single();

      setRankData(rankResponse);

      // Load earnings
      const { data: earningsResponse } = await supabase
        .from("user_earnings")
        .select("*")
        .eq("user_id", userId)
        .single();

      setEarnings(earningsResponse);

      // Load badges
      const { data: badgesResponse } = await supabase
        .from("user_badges")
        .select(`
          badge_id,
          earned_at,
          badges (name, icon, rarity, description)
        `)
        .eq("user_id", userId)
        .order("earned_at", { ascending: false });

      setBadges(badgesResponse || []);
    } catch (error) {
      console.error("Error loading rank/badge data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rankData) return null;

  const getRankColor = (level: number) => {
    if (level >= 5) return "from-yellow-500/20 to-amber-500/20";
    if (level >= 4) return "from-purple-500/20 to-pink-500/20";
    if (level >= 3) return "from-blue-500/20 to-cyan-500/20";
    if (level >= 2) return "from-green-500/20 to-emerald-500/20";
    return "from-gray-500/20 to-slate-500/20";
  };

  const getRankIcon = (level: number) => {
    if (level >= 5) return "👑";
    if (level >= 4) return "💎";
    if (level >= 3) return "🏆";
    if (level >= 2) return "⭐";
    return "🌱";
  };

  const getNextRankPoints = (level: number) => {
    const thresholds = [0, 500, 2000, 5000, 10000];
    return thresholds[level] || 10000;
  };

  const nextRankPoints = getNextRankPoints(rankData.rank_level);
  const progress = (rankData.total_points / nextRankPoints) * 100;

  return (
    <div className="space-y-4">
      {/* Rank Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className={`border-0 shadow-lg bg-gradient-to-br ${getRankColor(rankData.rank_level)}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{getRankIcon(rankData.rank_level)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-2xl font-bold text-foreground">{rankData.rank_name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Level {rankData.rank_level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {rankData.total_points.toLocaleString()} total points
                </p>
              </div>
            </div>

            {rankData.rank_level < 5 && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress to next rank</span>
                  <span>{rankData.total_points} / {nextRankPoints}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                  <Trophy className="w-5 h-5 text-primary" />
                  {rankData.challenges_won}
                </div>
                <p className="text-xs text-muted-foreground">Challenges Won</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                  <Star className="w-5 h-5 text-primary" />
                  {rankData.chains_created}
                </div>
                <p className="text-xs text-muted-foreground">Chains Created</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-2xl font-bold mb-1">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {rankData.photos_count}
                </div>
                <p className="text-xs text-muted-foreground">Photos Posted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Earnings Card */}
      {earnings && earnings.total_earned > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">Earnings</h4>
                  <p className="text-xs text-muted-foreground">From tips and rewards</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/5">
                  <p className="text-2xl font-bold text-primary">
                    ${earnings.available_balance.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Available</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">
                    ${earnings.total_earned.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Badges Grid */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
                <h4 className="font-semibold">Badges Earned</h4>
                <Badge variant="secondary" className="ml-auto">{badges.length}</Badge>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {badges.map((badge, index) => (
                  <motion.div
                    key={badge.badge_id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="text-center group cursor-pointer"
                    title={badge.badges.description}
                  >
                    <div className="w-16 h-16 mx-auto mb-2 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {badge.badges.icon}
                    </div>
                    <p className="text-xs font-medium truncate">{badge.badges.name}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {badge.badges.rarity}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
