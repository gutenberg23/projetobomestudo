import React from "react";
import { cn } from "@/lib/utils";

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onSelectTag: (tag: string | null) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ 
  tags, 
  activeTag, 
  onSelectTag 
}) => {
  return (
    <div className="mb-6">
      <h3 className="font-bold text-[#272f3c] mb-3">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <button
            key={index}
            onClick={() => onSelectTag(activeTag === tag ? null : tag)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeTag === tag
                ? "bg-[#ea2be2] text-white"
                : "bg-white hover:bg-gray-100 text-[#67748a] border border-gray-200"
            )}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};