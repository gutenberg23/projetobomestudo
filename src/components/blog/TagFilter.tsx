import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: { tag: string; count: number }[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
  /** Quantas tags aparecem antes de "Ver todas". */
  limit?: number;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  tags,
  activeTag,
  onSelectTag,
  limit = 12,
}) => {
  const [expanded, setExpanded] = useState(false);
  if (tags.length === 0) return null;

  let visible = expanded ? tags : tags.slice(0, limit);
  // A tag selecionada continua visível mesmo fora das mais usadas.
  if (activeTag && !visible.some((t) => t.tag.toLowerCase() === activeTag.toLowerCase())) {
    const active = tags.find((t) => t.tag.toLowerCase() === activeTag.toLowerCase());
    if (active) visible = [active, ...visible];
  }
  const hidden = tags.length - limit;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="text-lg font-bold text-[#272f3c] mb-3">Tags mais usadas</h3>
      <div className="flex flex-wrap gap-2">
        {visible.map(({ tag, count }) => {
          const isActive = activeTag?.toLowerCase() === tag.toLowerCase();
          return (
            <button
              key={tag}
              onClick={() => onSelectTag(isActive ? null : tag)}
              aria-pressed={isActive}
              className={cn(
                "px-2.5 py-1 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-[#ea2be2] text-white"
                  : "bg-[rgb(242,244,246)] hover:bg-[#ede7f9] hover:text-[#5f2ebe] text-[#67748a]"
              )}
            >
              #{tag}
              <span className={cn("ml-1 text-xs", isActive ? "text-white/70" : "text-[#9aa3b2]")}>{count}</span>
            </button>
          );
        })}
      </div>
      {hidden > 0 && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 text-sm font-medium text-[#5f2ebe] hover:underline"
        >
          {expanded ? "Mostrar menos" : `Ver todas (+${hidden})`}
        </button>
      )}
    </div>
  );
};
