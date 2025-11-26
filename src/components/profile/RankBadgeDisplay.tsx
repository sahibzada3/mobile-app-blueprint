import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import BadgeProgressDisplay from "@/components/badges/BadgeProgressDisplay";

interface RankData {
  rank_name: string;
  rank_level: number;
  total_points: number;
  photos_count: number;
  challenges_won: number;
  chains_created: number;
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
  const [rankData, setRankData] = React.useState<RankData | null>(null);
  const [badges, setBadges] = React.useState<BadgeData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  return (
    <div className="space-y-4">
      {/* Badge Progress Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <BadgeProgressDisplay currentPoints={rankData.total_points} />
      </motion.div>

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
