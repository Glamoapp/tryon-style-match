import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MapPin, Clock, Users } from "lucide-react";

interface VisitorLog {
  id: string;
  city: string | null;
  region: string | null;
  country: string | null;
  page_url: string | null;
  created_at: string;
}

const AdminVisitors = () => {
  const [visitors, setVisitors] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const fetchVisitors = async () => {
      const { data, error } = await supabase
        .from("visitor_logs")
        .select("id, city, region, country, page_url, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setVisitors(data);
        const today = new Date().toISOString().split("T")[0];
        setTodayCount(data.filter((v) => v.created_at.startsWith(today)).length);
      }
      setLoading(false);
    };

    fetchVisitors();

    // Subscribe to realtime visitor updates
    const channel = supabase
      .channel("visitor-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitor_logs" },
        (payload) => {
          const newVisitor = payload.new as VisitorLog;
          setVisitors((prev) => [newVisitor, ...prev].slice(0, 50));
          setTodayCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-foreground">{todayCount}</p>
              <p className="text-xs text-muted-foreground font-body">Visitors Today</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold font-display text-foreground">{visitors.length}</p>
              <p className="text-xs text-muted-foreground font-body">Recent Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live visitor feed */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Live Visitor Feed
            <span className="ml-auto flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground font-body">Live</span>
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground font-body text-sm">Loading visitors...</p>
          ) : visitors.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No visitors tracked yet.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {visitors.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-foreground text-sm">
                      {[v.city, v.region, v.country].filter(Boolean).join(", ") || "Unknown Location"}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-body">
                      {v.page_url || "/"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground font-body">{timeAgo(v.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminVisitors;
