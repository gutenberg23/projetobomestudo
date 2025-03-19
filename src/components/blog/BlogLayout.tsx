
import React from "react";
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
  selectedCategory?: string;
  selectedRegion?: string;
  selectedState?: string;
  onCategoryChange?: (category: string) => void;
  onRegionChange?: (region: string) => void;
  onStateChange?: (state: string) => void;
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
  return (
    <div className="bg-[#f6f8fa] min-h-screen">
      <BlogHeader />
      
      <div className={`container mx-auto px-4 py-8 ${fullWidth ? "max-w-none" : ""}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {showSidebar && (
            <div className="md:col-span-3 space-y-6">
              {categories && categories.length > 0 && (
                <CategoryFilter 
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={onCategoryChange}
                />
              )}
              
              {regions && regions.length > 0 && (
                <RegionFilter 
                  regions={regions}
                  selectedRegion={selectedRegion}
                  onRegionChange={onRegionChange}
                />
              )}
              
              {states && states.length > 0 && (
                <StateFilter 
                  states={states}
                  selectedState={selectedState}
                  onStateChange={onStateChange}
                />
              )}
              
              {(featuredPosts || latestPosts) && (
                <SidebarPosts 
                  featuredPosts={featuredPosts}
                  latestPosts={latestPosts}
                />
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
