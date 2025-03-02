
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      {algumaSelecionada && (
        <div className="flex-1 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="titulo-curso" className="mb-1 block">Título</Label>
              <Input
                id="titulo-curso"
                placeholder="Digite o título do curso"
                value={tituloNovoCurso}
                onChange={(e) => setTituloNovoCurso(e.target.value)}
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
            </div>
            <div>
              <Label htmlFor="descricao-curso" className="mb-1 block">Descrição</Label>
              <Input
                id="descricao-curso"
                placeholder="Digite a descrição"
                value={descricaoNovoCurso}
                onChange={(e) => setDescricaoNovoCurso(e.target.value)}
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
            </div>
          </div>
        </div>
      )}
      {algumaSelecionada && (
        <Button 
          onClick={handleAdicionarCurso}
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          disabled={!tituloNovoCurso.trim()}
        >
          Adicionar Curso
        </Button>
      )}
    </div>
  );
};
