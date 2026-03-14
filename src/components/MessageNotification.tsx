import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const MessageNotification = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchUnread(user.id);
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        fetchUnread(session.user.id);
      } else {
        setUserId(null);
        setUnreadCount(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("unread-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` },
        () => fetchUnread(userId)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "messages", filter: `receiver_id=eq.${userId}` },
        () => fetchUnread(userId)
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const fetchUnread = async (uid: string) => {
    const { count } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", uid)
      .eq("is_read", false);
    setUnreadCount(count || 0);
  };

  if (!userId) return null;

  return (
    <Link to="/messages" className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-secondary transition-colors">
      <MessageCircle className="w-5 h-5 text-muted-foreground" />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default MessageNotification;
