import React from "react";
import { BlogPost } from "./types";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface FeaturedPostsProps {
  posts: BlogPost[];
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({
  posts
}) => {
  if (!posts.length) return null;
  
  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 4);
  
  return (
    <div className="w-full mb-8">      
      {/* Grid de posts destacados */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Post principal com links abaixo - ocupa 2 colunas */}
        <div className="relative group md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div>
            <Link to={`/blog/${mainPost.slug}`}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#272f3c] hover:text-[#5f2ebe] transition-colors mb-4">
                {mainPost.title}
              </h2>
            </Link>
            <p className="text-[#67748a] text-base mb-4">{mainPost.summary}</p>
          </div>
          
          {/* Lista de links relacionados abaixo */}
          <div className="mt-2 space-y-3">
            {posts.slice(4, 8).map(relatedPost => (
              <div key={relatedPost.id} className="flex items-center">
                <ChevronRight className="h-5 w-5 text-[#5f2ebe] flex-shrink-0" />
                <Link 
                  to={`/blog/${relatedPost.slug}`}
                  className="text-[#272f3c] hover:text-[#5f2ebe] font-medium ml-1"
                >
                  {relatedPost.title}
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Posts secundários simplificados - apenas títulos com seta */}
        <div className="space-y-4 flex flex-col justify-start">
          {secondaryPosts.map((post) => (
            <div key={post.id} className="flex items-center">
              <ChevronRight className="h-5 w-5 text-[#5f2ebe] flex-shrink-0" />
              <Link 
                to={`/blog/${post.slug}`}
                className="text-[#272f3c] hover:text-[#5f2ebe] font-medium ml-2"
              >
                {post.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};