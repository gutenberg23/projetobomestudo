import React from "react";
import { BlogPost } from "./types";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface FeaturedPostsProps {
  posts: BlogPost[];
}

export const FeaturedPosts: React.FC<FeaturedPostsProps> = ({
  posts
}) => {
  if (!posts.length) return null;
  
  const mainPost = posts[0];
  const secondaryPosts = posts.slice(1, 3);
  
  return (
    <div className="w-full mb-8">      
      {/* Grid de posts destacados */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Post principal com links abaixo - ocupa 2 colunas */}
        <div className="relative group md:col-span-2 bg-white p-6 rounded-lg shadow-sm">
          <div className="pb-4">
            <Link to={`/blog/${mainPost.slug}`}>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#272f3c] hover:text-[#5f2ebe] transition-colors mb-4">
                {mainPost.title}
              </h2>
            </Link>
            <p className="text-[#67748a] text-base mb-4">{mainPost.summary}</p>
          </div>
          
          {/* Lista de links relacionados abaixo */}
          <div className="mt-2 space-y-3">
            {posts.slice(3, 7).map(relatedPost => (
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

        {/* Posts secundários com imagem à esquerda do título - ocupa 1 coluna */}
        <div className="space-y-4">
          {secondaryPosts.map((post) => (
            <div key={post.id} className="flex gap-4 group bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-[#5f2ebe]">
              {/* Imagem à esquerda */}
              <Link to={`/blog/${post.slug}`} className="shrink-0">
                <div className="relative w-20 h-20 overflow-hidden rounded-lg">
                  <img 
                    src={post.featuredImage || "/placeholder.svg"} 
                    alt={post.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
              </Link>
              
              {/* Conteúdo à direita */}
              <div className="flex-1">
                <div className="mb-1 flex items-center">
                  {post.category && (
                    <span className="text-xs bg-[#ede7f9] text-[#5f2ebe] px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  )}
                  <span className="text-xs text-[#67748a] ml-2">
                    {format(new Date(post.createdAt), "dd MMM yyyy", { locale: ptBR })}
                  </span>
                </div>
                <Link to={`/blog/${post.slug}`}>
                  <h3 className="font-bold text-[#272f3c] line-clamp-2 group-hover:text-[#5f2ebe] transition-colors">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-xs text-[#67748a] mt-1 line-clamp-1">{post.summary}</p>
              </div>
            </div>
          ))}
          
          <Link to="/blog" className="flex items-center text-[#5f2ebe] hover:text-[#4f21a5] font-medium mt-4">
            Ver todos os posts <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};