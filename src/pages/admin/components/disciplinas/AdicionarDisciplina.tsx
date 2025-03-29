import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DisciplinasPageProps } from "./DisciplinasTypes";

export const AdicionarDisciplina: React.FC<DisciplinasPageProps> = ({
  tituloNovaDisciplina,
  setTituloNovaDisciplina,
  descricaoNovaDisciplina,
  setDescricaoNovaDisciplina,
  informacoesCurso,
  setInformacoesCurso,
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
                className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
              />
            </div>
            <div>
              <Label htmlFor="descricao-disciplina" className="mb-1 block">Cargo</Label>
              <Input
                id="descricao-disciplina"
                placeholder="Digite o cargo"
                value={descricaoNovaDisciplina}
                onChange={(e) => setDescricaoNovaDisciplina(e.target.value)}
                className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
              />
            </div>
            <div className="col-span-2 mt-2">
              <Label htmlFor="informacoes-curso" className="mb-1 block">Informações do curso</Label>
              <Textarea
                id="informacoes-curso"
                placeholder="Digite as informações do curso"
                value={informacoesCurso}
                onChange={(e) => setInformacoesCurso(e.target.value)}
                className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
              />
            </div>
          </div>
        </div>
      )}
      {algumaSelecionada && (
        <Button 
          onClick={handleAdicionarDisciplina}
          className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90 w-auto"
          disabled={!tituloNovaDisciplina.trim()}
        >
          Adicionar Curso
        </Button>
      )}
    </div>
  );
};
