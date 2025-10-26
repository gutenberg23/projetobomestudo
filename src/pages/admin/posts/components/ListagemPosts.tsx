import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Search, Trash2, Rss, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { BlogPost } from "@/components/blog/types";
import RSSManager from "@/components/admin/RSSManager";

interface ListagemPostsProps {
  postsFiltrados: BlogPost[];
  busca: string;
  onChangeBusca: (value: string) => void;
  onIniciarCriacaoPost: () => void;
  onIniciarEdicaoPost: (post: BlogPost) => void;
  onExcluirPost: (id: string) => void;
  onToggleStatus: (id: string, isDraft: boolean) => void;
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  onPageChange: (page: number) => void;
}

export const ListagemPosts: React.FC<ListagemPostsProps> = ({
  postsFiltrados,
  busca,
  onChangeBusca,
  onIniciarCriacaoPost,
  onIniciarEdicaoPost,
  onExcluirPost,
  onToggleStatus,
  currentPage,
  totalPages,
  totalPosts,
  onPageChange
}) => {
  const [showRSSManager, setShowRSSManager] = React.useState(false);
  
  // Função para gerar os números das páginas a serem exibidos
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Se tiver 5 ou menos páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Se tiver mais de 5 páginas, mostrar uma navegação mais inteligente
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      // Ajustar se estiver perto do início ou do fim
      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#272f3c]">Posts</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setShowRSSManager(!showRSSManager)}
            variant="outline"
            className={showRSSManager ? "bg-[#ea2be2] text-white hover:bg-[#d029d5]" : ""}
          >
            <Rss className="h-4 w-4 mr-2" />
            RSS Manager
          </Button>
          <Button onClick={onIniciarCriacaoPost} className="bg-[#ea2be2] hover:bg-[#d029d5]">
            <Plus className="h-4 w-4 mr-2" />
            Novo Post
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[#67748a]" />
          <Input 
            className="pl-10" 
            placeholder="Buscar posts por título, autor ou categoria..." 
            value={busca}
            onChange={(e) => onChangeBusca(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[#67748a] bg-gray-50 uppercase">
              <tr>
                <th className="px-4 py-3">Título</th>
                <th className="px-4 py-3">Autor</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Curtidas</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Destaque</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {postsFiltrados.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3">{post.author}</td>
                  <td className="px-4 py-3">{format(new Date(post.createdAt), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-3">{post.likesCount}</td>
                  <td className="px-4 py-3">
                    {post.isDraft ? (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        Rascunho
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Publicado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {post.featured ? (
                      <span className="bg-[#fce7fc] text-[#ea2be2] text-xs px-2 py-1 rounded-full">
                        Destaque
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onToggleStatus(post.id, !post.isDraft)}
                        className="h-8 w-8 p-0"
                        title={post.isDraft ? "Publicar post" : "Marcar como rascunho"}
                      >
                        {post.isDraft ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onIniciarEdicaoPost(post)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onExcluirPost(post.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {postsFiltrados.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-[#67748a]">
                    Nenhum post encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{Math.min(postsFiltrados.length, (currentPage - 1) * 20 + 1)}</span> a{' '}
                  <span className="font-medium">{Math.min(currentPage * 20, totalPosts)}</span> de{' '}
                  <span className="font-medium">{totalPosts}</span> resultados
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <span className="sr-only">Página anterior</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {getPageNumbers().map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNumber
                          ? 'z-10 bg-[#ea2be2] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ea2be2]'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                  >
                    <span className="sr-only">Próxima página</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {showRSSManager && (
        <div className="mt-8">
          <RSSManager />
        </div>
      )}
    </div>
  );
};