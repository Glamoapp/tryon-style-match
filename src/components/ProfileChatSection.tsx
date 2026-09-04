import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { containsContactInfo, CONTACT_INFO_WARNING } from "@/lib/messageFilter";
import { notifyNewMessage } from "@/lib/notifyMessage";

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

interface ProfileChatSectionProps {
  recipientId: string;
  recipientName: string;
  recipientAvatar: string | null;
}

const ProfileChatSection = ({ recipientId, recipientName, recipientAvatar }: ProfileChatSectionProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setAuthChecked(true);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    fetchMessages();

    const channel = supabase
      .channel(`profile-chat-${recipientId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as Message;
        if (
          (msg.sender_id === userId && msg.receiver_id === recipientId) ||
          (msg.sender_id === recipientId && msg.receiver_id === userId)
        ) {
          setMessages((prev) => [...prev, msg]);
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, recipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${recipientId}),and(sender_id.eq.${recipientId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });
    setMessages(data || []);

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", recipientId)
      .eq("receiver_id", userId)
      .eq("is_read", false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !userId) return;

    if (containsContactInfo(newMessage)) {
      toast.error(CONTACT_INFO_WARNING);
      return;
    }

    setSending(true);
    try {
      const conversationId = [userId, recipientId].sort().join("_");
      const { data: inserted, error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: recipientId,
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
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (!authChecked) return null;

  // Not logged in
  if (!userId) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" /> Message {recipientName}
        </h2>
        <p className="text-sm text-muted-foreground font-body mb-4">
          Sign in to send a message to {recipientName} before booking.
        </p>
        <Button
          variant="hero"
          size="sm"
          onClick={() => navigate(`/auth?redirect=/stylist/${recipientId}`)}
        >
          Sign In to Message
        </Button>
      </div>
    );
  }

  // Don't show chat to the provider viewing their own profile
  if (userId === recipientId) return null;

  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Avatar className="w-9 h-9">
          <AvatarImage src={recipientAvatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm">
            {recipientName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-display font-bold text-foreground text-base">Message {recipientName}</h2>
          <p className="text-xs text-muted-foreground font-body">Chat directly before booking</p>
        </div>
      </div>

      <div className="mx-4 mt-3 px-3 py-2 bg-secondary/50 rounded-lg flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground font-body">
          Messaging is restricted to this platform only.
        </p>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8 font-body">
            Start a conversation with {recipientName}
          </p>
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
                {formatTime(msg.created_at)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
        className="p-3 border-t border-border flex gap-2"
      >
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};

export default ProfileChatSection;
