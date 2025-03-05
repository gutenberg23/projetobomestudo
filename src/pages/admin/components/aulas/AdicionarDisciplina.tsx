
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AulasPageProps } from "./AulasTypes";

export const AdicionarDisciplina: React.FC<AulasPageProps> = ({
  tituloNovaDisciplina,
  setTituloNovaDisciplina,
  descricaoNovaDisciplina,
  setDescricaoNovaDisciplina,
  handleAdicionarDisciplina,
  todasSelecionadas,
  aulas
}) => {
  // Verificar se alguma aula está selecionada
  const algumaSelecionada = aulas.some(aula => aula.selecionada);
  
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
              <Label htmlFor="descricao-disciplina" className="mb-1 block">Descrição</Label>
              <Input
                id="descricao-disciplina"
                placeholder="Digite a descrição"
                value={descricaoNovaDisciplina}
                onChange={(e) => setDescricaoNovaDisciplina(e.target.value)}
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
          Adicionar Disciplina
        </Button>
      )}
    </div>
  );
};
