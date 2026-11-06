
import React from "react";
import { CategoryFilter as CategoryFilterType } from "./types";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: CategoryFilterType[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onSelectCategory 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5">
      <h3 className="text-lg font-bold text-[#272f3c] mb-3">Categorias</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(activeCategory === category.id ? null : category.id)}
            aria-pressed={activeCategory === category.id}
            className={cn(
              "px-2.5 py-1 text-sm font-medium rounded-md transition-colors",
              activeCategory === category.id
                ? "bg-[#ea2be2] text-white"
                : "bg-[rgb(242,244,246)] hover:bg-[#ede7f9] hover:text-[#5f2ebe] text-[#67748a]"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};
