import React from "react";
import { CursosPageProps } from "./CursosTypes";

export const AdicionarCurso: React.FC<CursosPageProps> = ({
  tituloNovoCurso,
  setTituloNovoCurso,
  descricaoNovoCurso,
  setDescricaoNovoCurso,
  handleAdicionarCurso,
  todasSelecionadas,
  cursos
}) => {
  // Verificar se alguma disciplina está selecionada
  const algumaSelecionada = cursos.some(curso => curso.selecionada);
  
  return (
    <div className="flex justify-end mt-4 items-center gap-3">
      {/* Os inputs de texto e o botão foram removidos */}
    </div>
  );
};
