import React from "react";
import { TiptapEditor } from "../editor/TiptapEditor";

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
      <div className="bg-white rounded-lg">
        <TiptapEditor 
          content={conteudo}
          onChange={onChangeConteudo}
        />
      </div>
    </div>
  );
};
