import React from "react";
import { Button } from "@/components/ui/button";
import { ModoInterface } from "../types";
import { FormularioBasico } from "./formulario/FormularioBasico";
import { FormularioConteudo } from "./formulario/FormularioConteudo";
import { FormularioRegiao } from "./formulario/FormularioRegiao";
import { FormularioMetadados } from "./formulario/FormularioMetadados";
import { FormularioMidia } from "./formulario/FormularioMidia";
import { FormularioDestaque } from "./formulario/FormularioDestaque";
import { FormularioStatus } from "./formulario/FormularioStatus";
import { Region } from "@/components/blog/types";
import { resetBlogPostLikes } from "@/services/blogService";
import { toast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";

interface FormularioPostProps {
  modo: ModoInterface;
  onVoltar: () => void;
  onSalvar: () => void;
  titulo: string;
  onChangeTitulo: (value: string) => void;
  resumo: string;
  onChangeResumo: (value: string) => void;
  conteudo: string;
  onChangeConteudo: (value: string) => void;
  autorAvatar: string;
  onChangeAutorAvatar: (value: string) => void;
  categoria: string;
  onChangeCategoria: (value: string) => void;
  destacado: boolean;
  onChangeDestacado: (value: boolean) => void;
  isDraft: boolean;
  onChangeIsDraft: (value: boolean) => void;
  tags: string;
  onChangeTags: (value: string) => void;
  metaDescricao: string;
  onChangeMetaDescricao: (value: string) => void;
  metaKeywords: string;
  onChangeMetaKeywords: (value: string) => void;
  tempoLeitura: string;
  onChangeTempoLeitura: (value: string) => void;
  imagemDestaque: string;
  onChangeImagemDestaque: (value: string) => void;
  regiao: Region | "none";
  onChangeRegiao: (value: Region | "none") => void;
  estado: string;
  onChangeEstado: (value: string) => void;
  postsRelacionados: string;
  onChangePostsRelacionados: (value: string) => void;
  postId?: string;
  postSlug?: string;
}

export const FormularioPost: React.FC<FormularioPostProps> = ({
  modo,
  onVoltar,
  onSalvar,
  titulo,
  onChangeTitulo,
  resumo,
  onChangeResumo,
  conteudo,
  onChangeConteudo,
  autorAvatar,
  onChangeAutorAvatar,
  categoria,
  onChangeCategoria,
  destacado,
  onChangeDestacado,
  isDraft,
  onChangeIsDraft,
  tags,
  onChangeTags,
  metaDescricao,
  onChangeMetaDescricao,
  metaKeywords,
  onChangeMetaKeywords,
  tempoLeitura,
  onChangeTempoLeitura,
  imagemDestaque,
  onChangeImagemDestaque,
  regiao,
  onChangeRegiao,
  estado,
  onChangeEstado,
  postsRelacionados,
  onChangePostsRelacionados,
  postId,
  postSlug
}) => {
  const handleResetLikes = async () => {
    if (!postId) return;
    
    if (window.confirm("Tem certeza que deseja resetar as curtidas deste post?")) {
      try {
        const success = await resetBlogPostLikes(postId);
        if (success) {
          toast({
            title: "Curtidas resetadas",
            description: "As curtidas do post foram resetadas com sucesso.",
            variant: "default"
          });
        } else {
          toast({
            title: "Erro",
            description: "Ocorreu um erro ao resetar as curtidas. Tente novamente.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Erro ao resetar curtidas:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao resetar as curtidas. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#272f3c]">
            {modo === ModoInterface.CRIAR ? "Novo Post" : "Editar Post"}
          </h1>
          {modo === ModoInterface.EDITAR && postSlug && (
            <p className="text-sm text-gray-600 mt-1">
              URL: <a href={`/blog/${postSlug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/blog/{postSlug}</a>
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {modo === ModoInterface.EDITAR && (
            <Button
              type="button"
              variant="outline"
              onClick={handleResetLikes}
              className="text-red-500 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Resetar Curtidas
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={onVoltar}
          >
            Voltar
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <form className="space-y-6" onSubmit={(e) => {
          e.preventDefault();
          onSalvar();
        }}>
          {/* Informações Básicas */}
          <FormularioBasico 
            titulo={titulo}
            onChangeTitulo={onChangeTitulo}
            resumo={resumo}
            onChangeResumo={onChangeResumo}
            categoria={categoria}
            onChangeCategoria={onChangeCategoria}
            tempoLeitura={tempoLeitura}
            onChangeTempoLeitura={onChangeTempoLeitura}
          />

          {/* Conteúdo */}
          <FormularioConteudo 
            conteudo={conteudo}
            onChangeConteudo={onChangeConteudo}
          />
          
          {/* Regionalização */}
          <FormularioRegiao 
            regiao={regiao}
            onChangeRegiao={onChangeRegiao}
            estado={estado}
            onChangeEstado={onChangeEstado}
          />
          
          {/* Metadados e SEO */}
          <FormularioMetadados 
            tags={tags}
            onChangeTags={onChangeTags}
            metaDescricao={metaDescricao}
            onChangeMetaDescricao={onChangeMetaDescricao}
            metaKeywords={metaKeywords}
            onChangeMetaKeywords={onChangeMetaKeywords}
            postsRelacionados={postsRelacionados}
            onChangePostsRelacionados={onChangePostsRelacionados}
          />
          
          {/* Mídia */}
          <FormularioMidia 
            imagemDestaque={imagemDestaque}
            onChangeImagemDestaque={onChangeImagemDestaque}
          />
          
          {/* Opções de Destaque */}
          <FormularioDestaque 
            destacado={destacado}
            onChangeDestacado={onChangeDestacado}
          />
          
          {/* Status de Publicação */}
          <FormularioStatus 
            isDraft={isDraft}
            onChangeIsDraft={onChangeIsDraft}
          />
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onVoltar}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="bg-[#ea2be2] hover:bg-[#d029d5]"
            >
              {modo === ModoInterface.CRIAR ? "Criar Post" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};