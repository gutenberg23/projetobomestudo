import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Info, Plus, Search, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { BlogPost } from "@/components/blog/types";
import { diagnoseBlogPostsTable } from "@/services/blogService";
import { useToast } from "@/hooks/use-toast";

interface ListagemPostsProps {
  postsFiltrados: BlogPost[];
  busca: string;
  onChangeBusca: (value: string) => void;
  onIniciarCriacaoPost: () => void;
  onIniciarEdicaoPost: (post: BlogPost) => void;
  onExcluirPost: (id: string) => void;
  setTitulo: (value: string) => void;
  setResumo: (value: string) => void;
  setConteudo: (value: string) => void;
  setAutor: (value: string) => void;
  setCategoria: (value: string) => void;
  setTags: (value: string) => void;
  setMetaDescricao: (value: string) => void;
  setMetaKeywords: (value: string) => void;
  setTempoLeitura: (value: string) => void;
  setRegiao: (value: any) => void;
  setEstado: (value: string) => void;
}

export const ListagemPosts: React.FC<ListagemPostsProps> = ({
  postsFiltrados,
  busca,
  onChangeBusca,
  onIniciarCriacaoPost,
  onIniciarEdicaoPost,
  onExcluirPost,
  setTitulo,
  setResumo,
  setConteudo,
  setAutor,
  setCategoria,
  setTags,
  setMetaDescricao,
  setMetaKeywords,
  setTempoLeitura,
  setRegiao,
  setEstado
}) => {
  const { toast } = useToast();
  const [isRunningDiagnostic, setIsRunningDiagnostic] = React.useState(false);
  
  const runDiagnostic = async () => {
    setIsRunningDiagnostic(true);
    try {
      toast({
        title: "Diagnóstico em andamento",
        description: "Verificando permissões para posts...",
      });
      
      const result = await diagnoseBlogPostsTable();
      console.log("Resultado do diagnóstico:", result);
      
      if (result.success) {
        const canDelete = result.permissions?.delete?.success;
        toast({
          title: canDelete ? "Diagnóstico concluído com sucesso" : "Problema de permissão detectado",
          description: canDelete 
            ? "As permissões de exclusão estão corretas. Verifique o console para mais detalhes."
            : "Você não tem permissão para excluir posts. Verifique o console para mais detalhes.",
          variant: canDelete ? "default" : "destructive",
        });
      } else {
        toast({
          title: "Falha no diagnóstico",
          description: result.message || "Ocorreu um erro durante o diagnóstico. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao executar diagnóstico:", error);
      toast({
        title: "Erro",
        description: "Não foi possível executar o diagnóstico. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsRunningDiagnostic(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#272f3c]">Posts</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={runDiagnostic} 
            variant="outline"
            disabled={isRunningDiagnostic}
          >
            <Info className="h-4 w-4 mr-2" />
            Diagnóstico
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
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Região</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Comentários</th>
                <th className="px-4 py-3">Curtidas</th>
                <th className="px-4 py-3">Destaque</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {postsFiltrados.map(post => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3">{post.author}</td>
                  <td className="px-4 py-3">{post.category}</td>
                  <td className="px-4 py-3">{post.region || '—'}</td>
                  <td className="px-4 py-3">{format(new Date(post.createdAt), "dd/MM/yyyy")}</td>
                  <td className="px-4 py-3">{post.commentCount}</td>
                  <td className="px-4 py-3">{post.likesCount}</td>
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
                  <td colSpan={9} className="px-4 py-8 text-center text-[#67748a]">
                    Nenhum post encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
