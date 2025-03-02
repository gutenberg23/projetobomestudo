
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DisciplinasPageProps } from "./DisciplinasTypes";

export const AdicionarDisciplina: React.FC<DisciplinasPageProps> = ({
  tituloNovaDisciplina,
  setTituloNovaDisciplina,
  descricaoNovaDisciplina,
  setDescricaoNovaDisciplina,
  handleAdicionarDisciplina,
  todasSelecionadas,
  disciplinas
}) => {
  // Verificar se alguma disciplina está selecionada
  const algumaSelecionada = disciplinas.some(disciplina => disciplina.selecionada);
  
  return (
    <div className="flex justify-end mt-4 items-center gap-3">
      {algumaSelecionada && (
        <div className="flex-1 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="titulo-disciplina" className="mb-1 block">Título</Label>
              <Input
                id="titulo-disciplina"
                placeholder="Digite o título da disciplina"
                value={tituloNovaDisciplina}
                onChange={(e) => setTituloNovaDisciplina(e.target.value)}
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
            </div>
            <div>
              <Label htmlFor="descricao-disciplina" className="mb-1 block">Descrição</Label>
              <Input
                id="descricao-disciplina"
                placeholder="Digite a descrição"
                value={descricaoNovaDisciplina}
                onChange={(e) => setDescricaoNovaDisciplina(e.target.value)}
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
            </div>
          </div>
        </div>
      )}
      {algumaSelecionada && (
        <Button 
          onClick={handleAdicionarDisciplina}
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
          disabled={!tituloNovaDisciplina.trim()}
        >
          Adicionar Curso
        </Button>
      )}
    </div>
  );
};
