
import React from "react";
import { BlogPost } from "./types";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Clock } from "lucide-react";

interface SidebarPostsProps {
  posts: BlogPost[];
  title: string;
  icon?: React.ReactNode;
}

export const SidebarPosts: React.FC<SidebarPostsProps> = ({ posts, title, icon }) => {
  if (!posts.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-lg font-bold text-[#272f3c]">{title}</h3>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="flex gap-3 group">
            {post.featuredImage && (
              <Link to={`/blog/${post.slug}`} className="shrink-0">
                <div className="w-16 h-16 rounded overflow-hidden">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
            )}
            <div>
              <Link to={`/blog/${post.slug}`}>
                <h4 className="font-medium text-[#272f3c] line-clamp-2 group-hover:text-[#ea2be2] transition-colors">
                  {post.title}
                </h4>
              </Link>
              <div className="flex items-center text-xs text-[#67748a] mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{format(new Date(post.createdAt), "dd/MM/yyyy")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
