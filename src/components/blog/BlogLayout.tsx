
import React, { useState } from "react";
import { BlogHeader } from "./BlogHeader";
import { CategoryFilter } from "./CategoryFilter";
import { StateFilter } from "./StateFilter";
import { RegionFilter } from "./RegionFilter";
import { SidebarPosts } from "./SidebarPosts";
import { BlogPost, CategoryFilter as CategoryFilterType, RegionFilter as RegionFilterType, StateFilter as StateFilterType } from "./types";

interface BlogLayoutProps {
  children: React.ReactNode;
  categories?: CategoryFilterType[];
  regions?: RegionFilterType[];
  states?: StateFilterType[];
  selectedCategory?: string | null;
  selectedRegion?: string | null;
  selectedState?: string | null;
  onCategoryChange?: (category: string | null) => void;
  onRegionChange?: (region: string | null) => void;
  onStateChange?: (state: string | null) => void;
  featuredPosts?: BlogPost[];
  latestPosts?: BlogPost[];
  showSidebar?: boolean;
  fullWidth?: boolean;
}

export const BlogLayout: React.FC<BlogLayoutProps> = ({
  children,
  categories,
  regions,
  states,
  selectedCategory,
  selectedRegion,
  selectedState,
  onCategoryChange,
  onRegionChange,
  onStateChange,
  featuredPosts,
  latestPosts,
  showSidebar = true,
  fullWidth = false
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = () => {
    // Implementação da busca
    console.log("Buscando por:", searchTerm);
  };
  
  return (
    <div className="bg-[#f6f8fa] min-h-screen">
      <BlogHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm} 
        onSearch={handleSearch} 
      />
      
      <div className={`container mx-auto px-4 py-8 ${fullWidth ? "max-w-none" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {showSidebar && (
            <div className="md:col-span-3 space-y-6">
              {categories && categories.length > 0 && (
                <CategoryFilter 
                  categories={categories}
                  activeCategory={selectedCategory}
                  onSelectCategory={onCategoryChange}
                />
              )}
              
              {regions && regions.length > 0 && (
                <RegionFilter 
                  regions={regions}
                  activeRegion={selectedRegion}
                  onSelectRegion={onRegionChange}
                />
              )}
              
              {states && states.length > 0 && (
                <StateFilter 
                  states={states}
                  activeState={selectedState}
                  onSelectState={onStateChange}
                />
              )}
              
              {(featuredPosts || latestPosts) && (
                <div>
                  {featuredPosts && featuredPosts.length > 0 && (
                    <SidebarPosts 
                      posts={featuredPosts}
                      title="Posts Destacados"
                    />
                  )}
                  
                  {latestPosts && latestPosts.length > 0 && (
                    <SidebarPosts 
                      posts={latestPosts}
                      title="Posts Recentes"
                    />
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className={`${showSidebar ? "md:col-span-9" : "md:col-span-12"}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
