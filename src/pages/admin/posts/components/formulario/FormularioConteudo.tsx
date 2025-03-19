
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormularioConteudoProps {
  conteudo: string;
  onChangeConteudo: (value: string) => void;
}

export const FormularioConteudo: React.FC<FormularioConteudoProps> = ({
  conteudo,
  onChangeConteudo
}) => {
  return (
    <div className="p-4 border rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold text-[#272f3c] mb-4">Conteúdo</h3>
      <div className="space-y-2">
        <Label htmlFor="conteudo">Conteúdo Completo</Label>
        <Textarea 
          id="conteudo" 
          value={conteudo} 
          onChange={(e) => onChangeConteudo(e.target.value)} 
          placeholder="Conteúdo completo do post"
          required
          className="h-60"
          richText={true}
        />
        <p className="text-xs text-gray-500 mt-1">
          Use os controles acima para formatar o texto, adicionar links, imagens e tabelas.
        </p>
      </div>
    </div>
  );
};
