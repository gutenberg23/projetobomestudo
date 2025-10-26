import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormularioMetadadosProps {
  tags: string;
  onChangeTags: (value: string) => void;
  metaDescricao: string;
  onChangeMetaDescricao: (value: string) => void;
  metaKeywords: string;
  onChangeMetaKeywords: (value: string) => void;
  postsRelacionados: string;
  onChangePostsRelacionados: (value: string) => void;
}

export const FormularioMetadados: React.FC<FormularioMetadadosProps> = ({
  tags,
  onChangeTags,
  metaDescricao,
  onChangeMetaDescricao,
  metaKeywords,
  onChangeMetaKeywords,
  postsRelacionados,
  onChangePostsRelacionados
}) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Metadados e SEO</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
          <Input 
            id="tags" 
            value={tags} 
            onChange={(e) => onChangeTags(e.target.value)} 
            placeholder="Ex: gramática, redação, concursos"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="metaDescricao">Meta Descrição (para SEO)</Label>
          <Input 
            id="metaDescricao" 
            value={metaDescricao} 
            onChange={(e) => onChangeMetaDescricao(e.target.value)} 
            placeholder="Descrição para motores de busca (se vazio, será usado o resumo)"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="metaKeywords">Palavras-chave (separadas por vírgula)</Label>
          <Input 
            id="metaKeywords" 
            value={metaKeywords} 
            onChange={(e) => onChangeMetaKeywords(e.target.value)} 
            placeholder="Ex: concursos, português, estudos"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="postsRelacionados">IDs de Posts Relacionados (separados por vírgula)</Label>
          <Input 
            id="postsRelacionados" 
            value={postsRelacionados} 
            onChange={(e) => onChangePostsRelacionados(e.target.value)} 
            placeholder="Ex: id1, id2, id3"
          />
        </div>
      </div>
    </div>
  );
};
