
import React from "react";
import { BlogPost } from "./types";
import { MessageSquare, Heart, Clock, Tag, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface BlogPostCardProps {
  post: BlogPost;
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  const formattedDate = format(new Date(post.createdAt), "dd/MM/yyyy 'às' HH:mm");
  
  // Calcular tempo de leitura estimado se não estiver definido
  const readingTime = post.readingTime || Math.ceil(post.content.split(' ').length / 200);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-4 hover:shadow-md transition-shadow">
      <div className="flex flex-wrap gap-2 mb-3">
        <Link to={`/blog/categoria/${post.category.toLowerCase()}`} className="text-xs font-medium bg-[#fce7fc] text-[#ea2be2] px-2.5 py-1 rounded-full hover:bg-[#f9d0f9]">
          {post.category}
        </Link>
        {post.tags && post.tags.map(tag => (
          <Link key={tag} to={`/blog/tag/${tag.toLowerCase()}`} className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200">
            #{tag}
          </Link>
        ))}
      </div>

      <Link to={`/blog/${post.slug}`}>
        <h2 className="text-2xl font-bold text-[#272f3c] hover:text-[#ea2be2] transition-colors">{post.title}</h2>
      </Link>
      <p className="text-[#67748a] my-3">{post.summary}</p>
      <div className="flex flex-wrap items-center justify-between mt-4 text-sm text-[#67748a]">
        <div className="flex items-center space-x-4 flex-wrap">
          <span className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1.5" />
            {post.commentCount} comentários
          </span>
          <span className="flex items-center">
            <Heart className="h-4 w-4 mr-1.5" />
            {post.likesCount} curtidas
          </span>
          <span className="flex items-center">
            <BookOpen className="h-4 w-4 mr-1.5" />
            {readingTime} min de leitura
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
