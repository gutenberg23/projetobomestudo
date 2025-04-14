import React from "react";
import { BlogPost } from "./types";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";

interface LatestNewsProps {
  posts: BlogPost[];
  title?: string;
  viewAllLink?: string | null;
}

export const LatestNews: React.FC<LatestNewsProps> = ({
  posts,
  title = "Últimas notícias",
  viewAllLink = null
}) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#272f3c]">{title}</h2>
        {viewAllLink && (
          <Link 
            to={viewAllLink} 
            className="text-sm text-[#5f2ebe] hover:text-[#5f2ebe] flex items-center"
          >
            Ver todos <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      
      <div className="space-y-4">
        {posts.map(post => (
          <Link 
            key={post.id} 
            to={`/blog/${post.slug}`} 
            className="flex items-center gap-2 group"
          >
            <ChevronRight className="h-5 w-5 text-[#5f2ebe] flex-shrink-0" />
            <span className="font-medium text-[#272f3c] group-hover:text-[#5f2ebe] transition-colors">
              {post.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
