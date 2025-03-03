
import React from "react";
import { BlogPost } from "./types";
import { Link } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";

interface FeaturedPostsProps {
  posts: BlogPost[];
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({ posts }) => {
  if (!posts.length) return null;

  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-10">
      {/* Post principal */}
      <div className="relative group">
        <Link to={`/blog/${mainPost.slug}`}>
          <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-4">
            <img 
              src={mainPost.featuredImage || "/placeholder.svg"} 
              alt={mainPost.title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <div className="inline-block bg-[#ea2be2] text-xs font-medium px-2 py-1 rounded-md mb-2">
                {mainPost.category}
              </div>
              <h2 className="text-xl font-bold line-clamp-2">{mainPost.title}</h2>
            </div>
          </div>
        </Link>
        <div className="flex items-center text-sm text-[#67748a] mb-1">
          <Clock className="h-4 w-4 mr-1.5" />
          <span>{format(new Date(mainPost.createdAt), "dd/MM/yyyy")}</span>
        </div>
        <p className="text-[#67748a] line-clamp-2">{mainPost.summary}</p>
      </div>

      {/* Posts secundários */}
      <div className="space-y-6">
        {secondaryPosts.map(post => (
          <div key={post.id} className="flex gap-4 group">
            <Link to={`/blog/${post.slug}`} className="shrink-0">
              <div className="relative w-32 h-24 overflow-hidden rounded-lg">
                <img 
                  src={post.featuredImage || "/placeholder.svg"} 
                  alt={post.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <div className="flex-1">
              <div className="inline-block bg-[#fce7fc] text-[#ea2be2] text-xs font-medium px-2 py-1 rounded-md mb-1">
                {post.category}
              </div>
              <Link to={`/blog/${post.slug}`}>
                <h3 className="font-bold text-[#272f3c] line-clamp-2 group-hover:text-[#ea2be2] transition-colors">
                  {post.title}
                </h3>
              </Link>
              <div className="flex items-center text-xs text-[#67748a] mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{format(new Date(post.createdAt), "dd/MM/yyyy")}</span>
              </div>
            </div>
          </div>
        ))}

        <Link 
          to="/blog" 
          className="flex items-center text-[#ea2be2] hover:text-[#d029d5] font-medium"
        >
          Ver todos os posts <ArrowRight className="h-4 w-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};
