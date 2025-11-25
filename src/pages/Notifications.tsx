import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Heart, MessageCircle, UserPlus, Users, Camera, Trophy, Check, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import BottomNav from "@/components/BottomNav";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  related_id: string | null;
  related_type: string | null;
  read: boolean;
  created_at: string;
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    fetchNotifications();

    const channel = supabase
      .channel("notifications-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/login");
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setNotifications(data);
    }
    setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", session.user.id)
      .eq("read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const deleteNotification = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .delete()
      .eq("id", notificationId);

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    toast.success("Notification deleted");
  };

  const deleteAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase
      .from("notifications")
      .delete()
      .eq("user_id", session.user.id);

    setNotifications([]);
    toast.success("All notifications deleted");
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.related_type === "challenge" && notification.related_id) {
      navigate(`/challenges/${notification.related_id}`);
    } else if (notification.related_type === "chain" && notification.related_id) {
      navigate(`/spotlight/${notification.related_id}`);
    } else if (notification.related_type === "profile" && notification.related_id) {
      navigate(`/profile/${notification.related_id}`);
    } else if (notification.related_type === "friendship") {
      navigate("/friends");
    } else if (notification.related_type === "message") {
      navigate("/messages");
    } else if (notification.related_type === "photo") {
      navigate("/feed");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-primary fill-primary" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "friend_request":
        return <UserPlus className="w-5 h-5 text-primary" />;
      case "friend_accepted":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case "chain_invite":
        return <Users className="w-5 h-5 text-primary" />;
      case "chain_contribution":
        return <Camera className="w-5 h-5 text-primary" />;
      case "achievement":
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case "feedback":
        return <MessageCircle className="w-5 h-5 text-orange-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-lg px-4 py-2">
              {unreadCount}
            </Badge>
          )}
        </div>

        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between gap-2">
            <Tabs value={filter} onValueChange={setFilter} className="flex-1">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="like">Likes</TabsTrigger>
                <TabsTrigger value="comment">Comments</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </Card>

        {unreadCount > 0 && (
          <div className="flex gap-2 mb-4">
            <Button variant="outline" onClick={markAllAsRead} className="gap-2">
              <Check className="w-4 h-4" />
              Mark All Read
            </Button>
            <Button variant="outline" onClick={deleteAll} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
        )}

        <Card className="p-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">No notifications</p>
                <p className="text-sm">
                  {filter === "unread"
                    ? "You're all caught up!"
                    : "You'll see notifications here when something happens"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                          !notification.read
                            ? "border-primary/20 bg-primary/5"
                            : "hover:bg-accent/50"
                        }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                !notification.read ? "bg-primary/10" : "bg-muted"
                              }`}
                            >
                              {getNotificationIcon(notification.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-semibold text-sm">
                                {notification.title}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            {notification.message && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatDistanceToNow(new Date(notification.created_at), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                          {!notification.read && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="flex-shrink-0 w-3 h-3 bg-primary rounded-full mt-2"
                            />
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
