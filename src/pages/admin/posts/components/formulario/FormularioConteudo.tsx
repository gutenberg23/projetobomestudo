import React from "react";
import { TiptapEditor } from "../editor/TiptapEditor";

interface FormularioConteudoProps {
  conteudo: string;
  onChangeConteudo: (value: string) => void;
}

export const FormularioConteudo: React.FC<FormularioConteudoProps> = ({ conteudo, onChangeConteudo }) => (
  <TiptapEditor content={conteudo} onChange={onChangeConteudo} />
);
