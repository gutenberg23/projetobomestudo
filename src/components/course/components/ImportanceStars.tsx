
import { cn } from "@/lib/utils";

interface ImportanceStarsProps {
  level: number;
  onChange?: (value: number) => void;
}

export const ImportanceStars = ({ level, onChange }: ImportanceStarsProps) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          className={cn(
            "text-[#F11CE3] transition-opacity",
            star <= level ? "opacity-100" : "opacity-20",
            onChange && "hover:opacity-100"
          )}
        >
          ★
        </button>
      ))}
    </div>
  );
};
