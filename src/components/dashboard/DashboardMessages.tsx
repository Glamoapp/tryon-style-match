import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MessageCircle, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type Conversation = {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
};

export const DashboardMessages = ({ userId }: { userId: string }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();

    // Realtime subscription
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
      }, (payload) => {
        const msg = payload.new as Message;
        if (msg.sender_id === userId || msg.receiver_id === userId) {
          if (selectedConvo && (msg.sender_id === selectedConvo || msg.receiver_id === selectedConvo)) {
            setMessages((prev) => [...prev, msg]);
          }
          fetchConversations();
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, selectedConvo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchConversations = async () => {
    // Get all messages involving this user
    const { data: allMessages } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!allMessages) return;

    // Group by conversation partner
    const convoMap = new Map<string, { messages: any[]; otherUserId: string }>();
    for (const msg of allMessages) {
      const otherId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!convoMap.has(otherId)) {
        convoMap.set(otherId, { messages: [], otherUserId: otherId });
      }
      convoMap.get(otherId)!.messages.push(msg);
    }

    // Get profile info for each conversation partner
    const otherIds = Array.from(convoMap.keys());
    if (otherIds.length === 0) { setConversations([]); return; }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", otherIds);

    const convos: Conversation[] = otherIds.map((otherId) => {
      const convo = convoMap.get(otherId)!;
      const profile = profiles?.find((p) => p.id === otherId);
      const unread = convo.messages.filter((m) => m.receiver_id === userId && !m.is_read).length;
      return {
        id: otherId,
        otherUserId: otherId,
        otherUserName: profile?.full_name || "User",
        otherUserAvatar: profile?.avatar_url,
        lastMessage: convo.messages[0]?.content || "",
        lastMessageTime: convo.messages[0]?.created_at || "",
        unreadCount: unread,
      };
    });

    convos.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
    setConversations(convos);
  };

  const openConversation = async (otherUserId: string) => {
    setSelectedConvo(otherUserId);

    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    // Mark messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", otherUserId)
      .eq("receiver_id", userId)
      .eq("is_read", false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConvo) return;
    setSending(true);
    try {
      const conversationId = [userId, selectedConvo].sort().join("_");
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        receiver_id: selectedConvo,
        content: newMessage.trim(),
      });
      if (error) throw error;
      setNewMessage("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const selectedConvoData = conversations.find((c) => c.id === selectedConvo);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800000) return date.toLocaleDateString([], { weekday: "short" });
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-bold">Messages</h2>

      <div className="rounded-xl border border-border bg-card overflow-hidden" style={{ height: "500px" }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className={`${selectedConvo ? "hidden md:block" : ""} w-full md:w-80 border-r border-border overflow-y-auto`}>
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6">
                <MessageCircle className="w-12 h-12 opacity-40 mb-3" />
                <p className="font-medium">No messages yet</p>
                <p className="text-sm text-center">Messages from clients will appear here</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => openConversation(convo.otherUserId)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left border-b border-border ${
                    selectedConvo === convo.id ? "bg-primary/5" : ""
                  }`}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={convo.otherUserAvatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {convo.otherUserName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">{convo.otherUserName}</p>
                      <span className="text-xs text-muted-foreground">{formatTime(convo.lastMessageTime)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                  </div>
                  {convo.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center shrink-0">
                      {convo.unreadCount}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Chat area */}
          <div className={`${selectedConvo ? "flex" : "hidden md:flex"} flex-1 flex-col`}>
            {selectedConvo ? (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <button onClick={() => setSelectedConvo(null)} className="md:hidden text-muted-foreground">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedConvoData?.otherUserAvatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {selectedConvoData?.otherUserName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium">{selectedConvoData?.otherUserName}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
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
                <div className="p-4 border-t border-border">
                  <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex gap-2"
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 opacity-40 mx-auto mb-3" />
                  <p>Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
