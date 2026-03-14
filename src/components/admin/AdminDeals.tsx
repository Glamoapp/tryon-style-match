import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Tag, Plus, Trash2, Percent } from "lucide-react";

interface Deal {
  id: string;
  title: string;
  description: string;
  discountPercent: number;
  type: "service" | "product" | "featured";
  active: boolean;
}

const AdminDeals = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState("");
  const [type, setType] = useState<Deal["type"]>("service");

  const addDeal = () => {
    if (!title || !discount) {
      toast({ title: "Please fill in title and discount", variant: "destructive" });
      return;
    }
    const newDeal: Deal = {
      id: crypto.randomUUID(),
      title,
      description,
      discountPercent: Number(discount),
      type,
      active: true,
    };
    setDeals([newDeal, ...deals]);
    setTitle("");
    setDescription("");
    setDiscount("");
    toast({ title: "Deal created successfully" });
  };

  const removeDeal = (id: string) => {
    setDeals(deals.filter((d) => d.id !== id));
    toast({ title: "Deal removed" });
  };

  const toggleDeal = (id: string) => {
    setDeals(deals.map((d) => d.id === id ? { ...d, active: !d.active } : d));
  };

  return (
    <div className="space-y-6">
      {/* Create deal */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Create New Deal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            {([["service", "Service Discount"], ["product", "Product Sale"], ["featured", "Featured Promo"]] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setType(val)}
                className={`px-4 py-2 rounded-full text-sm font-body font-semibold transition-all ${
                  type === val
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Input placeholder="Deal title" value={title} onChange={(e) => setTitle(e.target.value)} className="font-body" />
          <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="font-body" />
          <Input placeholder="Discount %" type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="font-body w-32" />
          <Button variant="hero" onClick={addDeal}>
            <Tag className="w-4 h-4 mr-1" /> Create Deal
          </Button>
        </CardContent>
      </Card>

      {/* Active deals */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-display text-lg">Active Deals ({deals.filter(d => d.active).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {deals.length === 0 ? (
            <p className="text-muted-foreground font-body text-sm">No deals created yet. Create one above to get started.</p>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <div key={deal.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${deal.active ? "bg-card border-primary/20" : "bg-muted/50 border-border opacity-60"}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Percent className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-body font-semibold text-foreground text-sm">{deal.title}</p>
                      <p className="text-xs text-muted-foreground font-body">{deal.type} • {deal.discountPercent}% off</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleDeal(deal.id)} className="text-xs font-body">
                      {deal.active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeDeal(deal.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
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

export default AdminDeals;
