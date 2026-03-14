import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Bell, Send, Users } from "lucide-react";

const AdminNotifications = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState<"all" | "customer" | "provider">("all");
  const [sending, setSending] = useState(false);
  const [users, setUsers] = useState<{ id: string; full_name: string; role: string }[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, role");
      setUsers(data || []);
    };
    fetchUsers();
  }, []);

  const sendNotification = async () => {
    if (!title || !message) {
      toast({ title: "Please fill in title and message", variant: "destructive" });
      return;
    }
    setSending(true);
    const targetUsers = target === "all" ? users : users.filter((u) => u.role === target);

    const inserts = targetUsers.map((u) => ({
      user_id: u.id,
      title,
      message,
      type: "announcement",
    }));

    const { error } = await supabase.from("notifications").insert(inserts);
    if (error) {
      toast({ title: "Failed to send", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Notification sent to ${targetUsers.length} users` });
      setTitle("");
      setMessage("");
    }
    setSending(false);
  };

  const customerCount = users.filter((u) => u.role === "customer").length;
  const providerCount = users.filter((u) => u.role === "provider").length;

  return (
    <div className="space-y-6">
      {/* User stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6 text-center">
            <Users className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-foreground">{users.length}</p>
            <p className="text-xs text-muted-foreground font-body">All Users</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6 text-center">
            <Users className="w-6 h-6 text-accent mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-foreground">{customerCount}</p>
            <p className="text-xs text-muted-foreground font-body">Customers</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6 text-center">
            <Users className="w-6 h-6 text-gold mx-auto mb-2" />
            <p className="text-2xl font-display font-bold text-foreground">{providerCount}</p>
            <p className="text-xs text-muted-foreground font-body">Stylists</p>
          </CardContent>
        </Card>
      </div>

      {/* Send notification */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Send Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Target selector */}
          <div>
            <p className="text-sm font-body text-muted-foreground mb-2">Send to:</p>
            <div className="flex gap-2">
              {([["all", "All Users"], ["customer", "Customers Only"], ["provider", "Stylists Only"]] as const).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setTarget(val)}
                  className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                    target === val
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Input
            placeholder="Notification title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-body"
          />
          <Textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="font-body"
          />
          <Button variant="hero" onClick={sendNotification} disabled={sending}>
            <Send className="w-4 h-4 mr-1" />
            {sending ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminNotifications;
