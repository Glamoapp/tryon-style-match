import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  size?: "sm" | "md";
}

const FavoriteButton = ({ isFavorite, onClick, className, size = "md" }: FavoriteButtonProps) => {
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnSize = size === "sm" ? "w-7 h-7" : "w-8 h-8";

  return (
    <button
      onClick={onClick}
      className={cn(
        btnSize,
        "rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center transition-all hover:scale-110",
        className
      )}
    >
      <Heart
        className={cn(
          iconSize,
          "transition-colors",
          isFavorite ? "fill-primary text-primary" : "text-muted-foreground"
        )}
      />
    </button>
  );
};

export default FavoriteButton;
