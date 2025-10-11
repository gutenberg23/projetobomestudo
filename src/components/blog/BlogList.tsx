import React, { useState } from "react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogPost } from "@/components/blog/types";
import AdBanner from '@/components/ads/AdBanner';

interface BlogListProps {
  posts: BlogPost[];
  postsPerPage?: number;
  title?: string;
  showEmpty?: boolean;
}

export const BlogList: React.FC<BlogListProps> = ({ 
  posts, 
  postsPerPage = 10,
  title,
  showEmpty = true
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calcular o número total de páginas
  const totalPages = Math.ceil(posts.length / postsPerPage);
  
  // Obter os posts da página atual
  const getCurrentPagePosts = () => {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return posts.slice(startIndex, endIndex);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Rolar para o topo da página ao mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (posts.length === 0 && showEmpty) {
    return (
      <div className="bg-white p-10 rounded-lg shadow-sm text-center">
        <h3 className="text-xl font-bold text-[#272f3c] mb-2">Nenhum post encontrado</h3>
        <p className="text-[#67748a]">
          Não encontramos posts com os critérios selecionados. Tente remover alguns filtros.
        </p>
      </div>
    );
  }

  const currentPagePosts = getCurrentPagePosts();
  
  console.log(`BlogList - Rendering ${currentPagePosts.length} posts on page ${currentPage} for position blog_posts_list`);

  return (
    <>
      {title && <h2 className="text-2xl font-bold text-[#272f3c] mb-4">{title}</h2>}
      
      <div className="space-y-6">
        {currentPagePosts.map((post, index) => (
          <React.Fragment key={post.id}>
            <BlogPostCard post={post} />
            {/* Mostrar anúncio após cada 3 posts */}
            {((index + 1) % 3 === 0) && index < currentPagePosts.length - 1 && (
              <div className="my-6">
                <AdBanner 
                  position="blog_posts_list" 
                  className="rounded-lg" 
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {totalPages > 1 && (
        <BlogPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={handlePageChange} 
        />
      )}
    </>
  );
};