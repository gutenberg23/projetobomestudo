
import React from "react";
import { BlogPost } from "./types";
import { MessageSquare, Heart, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface BlogPostCardProps {
  post: BlogPost;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const formattedDate = format(new Date(post.createdAt), "dd/MM/yyyy 'às' HH:mm");

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-4 hover:shadow-md transition-shadow">
      <Link to={`/blog/${post.slug}`}>
        <h2 className="text-2xl font-bold text-[#272f3c] hover:text-[#ea2be2] transition-colors">{post.title}</h2>
      </Link>
      <p className="text-[#67748a] my-3">{post.summary}</p>
      <div className="flex flex-wrap items-center justify-between mt-4 text-sm text-[#67748a]">
        <div className="flex items-center space-x-6">
          <span className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            {post.commentCount} comentários
          </span>
          <span className="flex items-center">
            <Heart className="h-4 w-4 mr-1.5" />
            {post.likesCount} curtidas
          </span>
        </div>
        <div className="flex items-center mt-2 sm:mt-0">
          <Clock className="h-4 w-4 mr-1.5" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};
