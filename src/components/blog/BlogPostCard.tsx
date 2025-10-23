import React from "react";
import { BlogPost } from "./types";
import { Heart, Clock, BookOpen, User, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/hooks/usePermissions";

interface BlogPostCardProps {
  post: BlogPost;
  variant?: "default" | "compact" | "featured";
}

export const BlogPostCard: React.FC<BlogPostCardProps> = ({
  post,
  variant = "default"
}) => {
  const formattedDate = format(new Date(post.createdAt), "dd/MM/yyyy 'às' HH:mm");
  const { isAdmin } = usePermissions();

  // Calcular tempo de leitura estimado se não estiver definido
  const readingTime = post.readingTime || Math.ceil(post.content.split(' ').length / 200);

  if (variant === "compact") {
    return (
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
        <Link to={`/blog/${post.slug}`} className="block">
          {post.featuredImage && (
            <div className="relative aspect-video overflow-hidden rounded-t-lg">
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              {post.region && (
                <div className="absolute top-2 right-2 bg-white/80 text-xs font-medium px-2 py-1 rounded">
                  {post.region}
                </div>
              )}
              {/* Botão de edição para administradores - compact variant */}
              {isAdmin() && (
                <Link 
                  to={`/admin/posts?edit=${post.id}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute top-2 left-2 bg-[#ea2be2] text-white p-1.5 rounded-full hover:bg-[#d029d5] transition-colors z-10"
                  title="Editar post"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="text-xs font-medium bg-[#ede7f9] text-[#5f2ebe] px-2 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <h3 className="font-bold text-[#272f3c] mb-2 line-clamp-2 group-hover:text-[#5f2ebe] transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center text-xs text-[#67748a]">
              <Clock className="h-3 w-3 mr-1" />
              <span>{format(new Date(post.createdAt), "dd/MM/yyyy")}</span>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden group">
        <Link to={`/blog/${post.slug}`} className="block relative">
          {post.featuredImage ? (
            <div className="relative aspect-[16/9] overflow-hidden">
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
              <div className="absolute bottom-0 left-0 p-4 text-white">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs font-medium bg-[#5f2ebe] px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  {post.region && (
                    <span className="text-xs font-medium bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                      {post.region}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xl mb-2">{post.title}</h3>
                <p className="text-sm text-white/80 line-clamp-2 mb-2">{post.summary}</p>
                <div className="flex items-center text-sm text-white/70">
                  {post.authorAvatar ? (
                    <img 
                      src={post.authorAvatar} 
                      alt={post.author} 
                      className="h-6 w-6 rounded-full mr-2 object-cover border border-white/30" 
                    />
                  ) : (
                    <User className="h-4 w-4 mr-1.5" />
                  )}
                  <span className="mr-3">{post.author}</span>
                  <Clock className="h-4 w-4 mr-1.5" />
                  <span>{format(new Date(post.createdAt), "dd/MM/yyyy")}</span>
                </div>
              </div>
              {/* Botão de edição para administradores - featured variant */}
              {isAdmin() && (
                <Link 
                  to={`/admin/posts?edit=${post.id}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute top-2 right-2 bg-[#ea2be2] text-white p-2 rounded-full hover:bg-[#d029d5] transition-colors z-10"
                  title="Editar post"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              )}
            </div>
          ) : (
            // Versão sem imagem
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs font-medium bg-[#5f2ebe] text-white px-2 py-1 rounded-full">
                  {post.category}
                </span>
                {post.region && (
                  <span className="text-xs font-medium bg-gray-100 text-[#67748a] px-2 py-1 rounded-full">
                    {post.region}
                  </span>
                )}
              </div>
              <h3 className="font-bold text-xl text-[#272f3c] mb-2">{post.title}</h3>
              <p className="text-sm text-[#67748a] line-clamp-2 mb-2">{post.summary}</p>
              <div className="flex items-center text-sm text-[#67748a]">
                {post.authorAvatar ? (
                  <img 
                    src={post.authorAvatar} 
                    alt={post.author} 
                    className="h-6 w-6 rounded-full mr-2 object-cover" 
                  />
                ) : (
                  <User className="h-4 w-4 mr-1.5" />
                )}
                <span className="mr-3">{post.author}</span>
                <Clock className="h-4 w-4 mr-1.5" />
                <span>{format(new Date(post.createdAt), "dd/MM/yyyy")}</span>
              </div>
              {/* Botão de edição para administradores - featured sem imagem */}
              {isAdmin() && (
                <Link 
                  to={`/admin/posts?edit=${post.id}`} 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="absolute top-2 right-2 bg-[#ea2be2] text-white p-2 rounded-full hover:bg-[#d029d5] transition-colors z-10"
                  title="Editar post"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              )}
            </div>
          )}
        </Link>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        "bg-white p-6 rounded-lg shadow-sm mb-4 hover:shadow-md transition-shadow", 
        post.featured ? "border-t-0" : ""
      )}
    >
      <div className="flex flex-wrap gap-2 mb-3">
        <Link 
          to={`/blog/categoria/${post.category.toLowerCase()}`} 
          className="text-xs font-medium bg-[#ede7f9] text-[#5f2ebe] px-2.5 py-1 rounded-full hover:bg-[#ede7f9]"
        >
          {post.category}
        </Link>
        {post.region && (
          <Link 
            to={`/blog/regiao/${post.region.toLowerCase()}`} 
            className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200"
          >
            {post.region}
          </Link>
        )}
        {post.state && (
          <Link 
            to={`/blog/estado/${post.state.toLowerCase()}`} 
            className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200"
          >
            {post.state}
          </Link>
        )}
        {post.tags && post.tags.slice(0, 2).map(tag => (
          <Link 
            key={tag} 
            to={`/blog/tag/${tag.toLowerCase()}`} 
            className="text-xs font-medium bg-gray-100 text-[#67748a] px-2.5 py-1 rounded-full hover:bg-gray-200"
          >
            #{tag}
          </Link>
        ))}
      </div>

      <div className="md:flex md:gap-6">
        {post.featuredImage && (
          <Link to={`/blog/${post.slug}`} className="block mb-4 md:mb-0 md:w-1/3 shrink-0">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={post.featuredImage} 
                alt={post.title} 
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
          </Link>
        )}
        <div className={post.featuredImage ? "md:w-2/3" : "w-full"}>
          <div className="relative">
            <Link to={`/blog/${post.slug}`}>
              <h2 className="text-2xl font-bold text-[#272f3c] hover:text-[#5f2ebe] transition-colors">
                {post.title}
                {post.featured && (
                  <span className="ml-2 inline-block bg-[#5f2ebe] text-white text-xs px-2 py-0.5 rounded">
                    Destaque
                  </span>
                )}
              </h2>
            </Link>
            {/* Botão de edição para administradores - default variant */}
            {isAdmin() && (
              <Link 
                to={`/admin/posts?edit=${post.id}`} 
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="absolute top-0 right-0 bg-[#ea2be2] text-white p-2 rounded-full hover:bg-[#d029d5] transition-colors"
                title="Editar post"
              >
                <Edit className="h-4 w-4" />
              </Link>
            )}
          </div>
          <p className="text-[#67748a] my-3">{post.summary}</p>
          
          <div className="flex flex-wrap items-center justify-between mt-2 text-sm text-[#67748a]">
            <div className="flex items-center space-x-4 flex-wrap">
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1.5" />
                {post.author}
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
      </div>
    </div>
  );
};