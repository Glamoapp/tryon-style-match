import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MessageCircle, ArrowLeft, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { containsContactInfo, CONTACT_INFO_WARNING } from "@/lib/messageFilter";
import { notifyNewMessage } from "@/lib/notifyMessage";

interface Conversation {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

const MessagesPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
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

  // Realtime updates
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("inbox-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id !== userId && msg.receiver_id !== userId) return;
        const other = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        if (other === activeId) setMessages((prev) => [...prev, msg]);
        fetchConversations(userId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, activeId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async (uid: string) => {
    const { data: messages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order("created_at", { ascending: false });

    if (!messages) { setLoading(false); return; }

    const convMap = new Map<string, typeof messages>();
    messages.forEach((msg) => {
      const otherId = msg.sender_id === uid ? msg.receiver_id : msg.sender_id;
      if (!convMap.has(otherId)) convMap.set(otherId, []);
      convMap.get(otherId)!.push(msg);
    });

    const recipientIds = Array.from(convMap.keys());
    if (recipientIds.length === 0) { setConversations([]); setLoading(false); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", recipientIds);

    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    const convos: Conversation[] = recipientIds.map((rid) => {
      const msgs = convMap.get(rid)!;
      const profile = profileMap.get(rid);
      return {
        recipientId: rid,
        recipientName: profile?.full_name || "Unknown",
        recipientAvatar: profile?.avatar_url || null,
        lastMessage: msgs[0].content,
        lastMessageAt: msgs[0].created_at,
        unreadCount: msgs.filter((m) => m.receiver_id === uid && !m.is_read).length,
      };
    });

    convos.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    setConversations(convos);
    setLoading(false);
  };

  const openConversation = async (otherId: string) => {
    if (!userId) return;
    setActiveId(otherId);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", otherId)
      .eq("receiver_id", userId)
      .eq("is_read", false);
    fetchConversations(userId);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId || !activeId) return;
    if (containsContactInfo(newMessage)) {
      toast.error(CONTACT_INFO_WARNING);
      return;
    }
    setSending(true);
    try {
      const conversationId = [userId, activeId].sort().join("_");
      const { data: inserted, error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: activeId,
        content: newMessage.trim(),
      }).select("id").single();
      if (error) throw error;
      if (inserted?.id) notifyNewMessage(inserted.id);
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const diffH = diffMs / (1000 * 60 * 60);
    if (diffH < 1) return `${Math.max(1, Math.floor(diffMs / 60000))}m ago`;
    if (diffH < 24) return `${Math.floor(diffH)}h ago`;
    return d.toLocaleDateString();
  };

  const active = conversations.find((c) => c.recipientId === activeId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-2xl">
          {activeId ? (
            <button
              onClick={() => { setActiveId(null); setMessages([]); }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body"
            >
              <ArrowLeft className="w-4 h-4" /> All messages
            </button>
          ) : (
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 font-body">
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          )}

          {!activeId && (
            <h1 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary" /> Messages
            </h1>
          )}

          {activeId ? (
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <div className="p-4 border-b border-border flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
                  {active?.recipientAvatar ? (
                    <img src={active.recipientAvatar} alt={active.recipientName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-muted-foreground">{active?.recipientName?.[0] || "?"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-foreground truncate">{active?.recipientName || "Conversation"}</p>
                  <Link to={`/stylist/${activeId}`} className="text-xs text-primary font-body hover:underline">View profile</Link>
                </div>
              </div>

              <div className="mx-4 mt-3 px-3 py-2 bg-secondary/50 rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground font-body">Messaging is restricted to this platform only.</p>
              </div>

              <div className="h-[380px] overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8 font-body">No messages yet</p>
                )}
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                        msg.sender_id === userId
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender_id === userId ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="p-3 border-t border-border flex gap-2"
              >
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          ) : loading ? (
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
                <button
                  key={c.recipientId}
                  onClick={() => openConversation(c.recipientId)}
                  className="w-full text-left flex items-center gap-4 bg-card rounded-xl border border-border/50 p-4 hover:border-primary/30 transition-colors"
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
                </button>
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
