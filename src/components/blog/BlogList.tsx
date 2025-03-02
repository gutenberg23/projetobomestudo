
import React, { useState } from "react";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogPagination } from "@/components/blog/BlogPagination";
import { BlogPost } from "@/components/blog/types";

interface BlogListProps {
  posts: BlogPost[];
  postsPerPage?: number;
}

export const BlogList: React.FC<BlogListProps> = ({ posts, postsPerPage = 10 }) => {
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

  return (
    <>
      <div className="space-y-6">
        {getCurrentPagePosts().map(post => (
          <BlogPostCard key={post.id} post={post} />
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
