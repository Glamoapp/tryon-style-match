import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { MessageCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Conversation {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/auth?redirect=/messages"); return; }
      setUserId(user.id);
      await fetchConversations(user.id);
    };
    init();
  }, []);

  const fetchConversations = async (uid: string) => {
    setLoading(true);
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (!messages) { setLoading(false); return; }

    const convMap = new Map<string, { messages: typeof messages }>();
    messages.forEach((msg) => {
      const otherId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(otherId)) convMap.set(otherId, { messages: [] });
      convMap.get(otherId)!.messages.push(msg);
    });

    const recipientIds = Array.from(convMap.keys());
    if (recipientIds.length === 0) { setConversations([]); setLoading(false); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", recipientIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const convos: Conversation[] = recipientIds.map((rid) => {
      const msgs = convMap.get(rid)!.messages;
      const profile = profileMap.get(rid);
      const unread = msgs.filter((m) => m.receiver_id === uid && !m.is_read).length;
      return {
        recipientId: rid,
        recipientName: profile?.full_name || "Unknown",
        recipientAvatar: profile?.avatar_url || null,
        lastMessage: msgs[0].content,
        lastMessageAt: msgs[0].created_at,
        unreadCount: unread,
      };
    });

    convos.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    setConversations(convos);
    setLoading(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = diffMs / (1000 * 60 * 60);
    if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`;
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" /> Messages
          </h1>

          {loading ? (
            <p className="text-muted-foreground text-center py-12 font-body">Loading...</p>
          ) : conversations.length === 0 ? (
            <div className="text-center py-16">
              <MessageCircle className="w-12 h-12 text-muted mx-auto mb-3" />
              <p className="text-muted-foreground font-body">No messages yet</p>
              <Link to="/stylists">
                <Button variant="hero" size="sm" className="mt-4">Find Stylists</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((c) => (
                <Link
                  key={c.recipientId}
                  to={`/stylist/${c.recipientId}`}
                  className="flex items-center gap-4 bg-card rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="w-11 h-11 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                    {c.recipientAvatar ? (
                      <img src={c.recipientAvatar} alt={c.recipientName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-display font-bold text-muted-foreground">{c.recipientName[0]}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-semibold text-foreground">{c.recipientName}</span>
                      <span className="text-xs text-muted-foreground font-body">{formatTime(c.lastMessageAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-body truncate mt-0.5">{c.lastMessage}</p>
                  </div>
                  {c.unreadCount > 0 && (
                    <span className="min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold px-1.5">
                      {c.unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MessagesPage;
