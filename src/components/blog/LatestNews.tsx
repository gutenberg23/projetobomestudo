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
    <div>
      {(title || viewAllLink) && (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#272f3c]">{title}</h2>
        {viewAllLink && (
          <Link 
            to={viewAllLink} 
            className="text-sm text-[#5f2ebe] hover:text-[#5f2ebe] flex items-center"
          >
            Ver todos <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        )}
      </div>
      )}
      
      <div className="space-y-3">
        {posts.map(post => (
          <Link 
            key={post.id} 
            to={`/blog/${post.slug}`} 
            className="flex items-start gap-2 group"
          >
            <ChevronRight className="h-5 w-5 mt-0.5 text-[#5f2ebe] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
            <span className="font-medium leading-snug text-[#272f3c] group-hover:text-[#5f2ebe] transition-colors line-clamp-2">
              {post.title}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
