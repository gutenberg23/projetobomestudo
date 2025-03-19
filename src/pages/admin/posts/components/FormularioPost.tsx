
import React from "react";
import { Button } from "@/components/ui/button";
import { ModoInterface } from "../types";
import { FormularioBasico } from "./formulario/FormularioBasico";
import { FormularioConteudo } from "./formulario/FormularioConteudo";
import { FormularioRegiao } from "./formulario/FormularioRegiao";
import { FormularioMetadados } from "./formulario/FormularioMetadados";
import { FormularioMidia } from "./formulario/FormularioMidia";
import { FormularioDestaque } from "./formulario/FormularioDestaque";
import { RegionOrEmpty } from "@/components/blog/types";

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
  autor: string;
  onChangeAutor: (value: string) => void;
  autorAvatar: string;
  onChangeAutorAvatar: (value: string) => void;
  categoria: string;
  onChangeCategoria: (value: string) => void;
  destacado: boolean;
  onChangeDestacado: (value: boolean) => void;
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
  regiao: RegionOrEmpty;
  onChangeRegiao: (value: RegionOrEmpty) => void;
  estado: string;
  onChangeEstado: (value: string) => void;
  postsRelacionados: string;
  onChangePostsRelacionados: (value: string) => void;
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
  autor,
  onChangeAutor,
  autorAvatar,
  onChangeAutorAvatar,
  categoria,
  onChangeCategoria,
  destacado,
  onChangeDestacado,
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
  onChangePostsRelacionados
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#272f3c]">
          {modo === ModoInterface.CRIAR ? "Novo Post" : "Editar Post"}
        </h1>
        <Button 
          variant="outline" 
          onClick={onVoltar}
        >
          Voltar
        </Button>
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
            autor={autor}
            onChangeAutor={onChangeAutor}
            autorAvatar={autorAvatar}
            onChangeAutorAvatar={onChangeAutorAvatar}
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
