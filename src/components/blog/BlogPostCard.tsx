
import React from "react";
import { MessageSquare, Heart } from "lucide-react";
import { BlogPost } from "./types";

interface BlogPostCardProps {
  post: BlogPost;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <article className="flex flex-col rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <div className="flex flex-col flex-grow p-5">
        <h2 className="text-xl font-bold text-[#272f3c] mb-2 line-clamp-2 hover:text-[#ea2be2] transition-colors">
          <a href={`/blog/${post.id}`}>
            {post.title}
          </a>
        </h2>
        
        <p className="text-[#67748a] mb-4 line-clamp-3 flex-grow">
          {post.excerpt}
        </p>
        
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div className="text-sm text-[#67748a]">
            <span className="font-medium">Por {post.author}</span>
            <span className="block text-xs mt-1">{post.date}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center text-[#67748a]">
              <MessageSquare size={16} className="mr-1" />
              <span className="text-sm">{post.commentCount}</span>
            </div>
            
            <div className="flex items-center text-[#67748a]">
              <Heart size={16} className="mr-1" />
              <span className="text-sm">{post.likeCount}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
