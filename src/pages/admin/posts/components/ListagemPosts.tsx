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
}

export const ListagemPosts: React.FC<ListagemPostsProps> = ({
  postsFiltrados,
  busca,
  onChangeBusca,
  onIniciarCriacaoPost,
  onIniciarEdicaoPost,
  onExcluirPost,
  onToggleStatus
}) => {
  const [showRSSManager, setShowRSSManager] = React.useState(false);
  
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
      </div>
      
      {showRSSManager && (
        <div className="mt-8">
          <RSSManager />
        </div>
      )}
    </div>
  );
};