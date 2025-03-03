
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
    <div className="mb-6">
      <h3 className="font-bold text-[#272f3c] mb-3">Categorias</h3>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(activeCategory === category.id ? null : category.id)}
            className={cn(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
              activeCategory === category.id
                ? "bg-[#ea2be2] text-white"
                : "bg-white hover:bg-gray-100 text-[#67748a] border border-gray-200"
            )}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};
