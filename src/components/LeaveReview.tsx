import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface LeaveReviewProps {
  providerId: string;
  providerName: string;
  onReviewSubmitted: () => void;
}

const LeaveReview = ({ providerId, providerName, onReviewSubmitted }: LeaveReviewProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate(`/auth?redirect=/stylist/${providerId}`);
      return;
    }

    if (user.id === providerId) {
      toast({ title: "You can't review yourself", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("reviews").insert({
      provider_id: providerId,
      customer_id: user.id,
      rating,
      comment: comment.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      toast({ title: "Failed to submit review", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Review submitted!" });
    setRating(0);
    setComment("");
    onReviewSubmitted();
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-5">
      <h3 className="font-display font-bold text-foreground mb-3">
        Rate {providerName.split(" ")[0]}
      </h3>
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            onMouseEnter={() => setHoveredRating(i + 1)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(i + 1)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-7 h-7 ${
                (hoveredRating || rating) > i
                  ? "fill-gold text-gold"
                  : "text-muted"
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-sm text-muted-foreground font-body ml-2">
            {rating}/5
          </span>
        )}
      </div>
      <Textarea
        placeholder="Leave a comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="mb-3 resize-none"
        rows={3}
      />
      <Button variant="hero" size="sm" onClick={handleSubmit} disabled={submitting || rating === 0}>
        {submitting ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
};

export default LeaveReview;
