
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
  bancaNovaDisciplina,
  setBancaNovaDisciplina,
  handleAdicionarDisciplina,
  temAulasSelecionadas
}) => {
  return (
    <div className="flex justify-end mt-4 items-center gap-3">
      {temAulasSelecionadas && (
        <div className="flex-1 max-w-md">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="titulo-disciplina" className="mb-1 block">Título</Label>
              <Input 
                id="titulo-disciplina" 
                placeholder="Digite o título da disciplina" 
                value={tituloNovaDisciplina} 
                onChange={e => setTituloNovaDisciplina(e.target.value)} 
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]" 
              />
            </div>
            <div>
              <Label htmlFor="descricao-disciplina" className="mb-1 block">Nota de rating</Label>
              <Input 
                id="descricao-disciplina" 
                type="number" 
                min="1" 
                max="10"
                placeholder="Digite a nota" 
                value={descricaoNovaDisciplina} 
                onChange={e => {
                  const value = e.target.value;
                  // Only allow numbers between 1 and 10
                  if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 10)) {
                    setDescricaoNovaDisciplina(value);
                  }
                }} 
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]" 
              />
            </div>
            <div>
              <Label htmlFor="banca-disciplina" className="mb-1 block">Banca</Label>
              <Input 
                id="banca-disciplina" 
                placeholder="Digite a banca" 
                value={bancaNovaDisciplina} 
                onChange={e => setBancaNovaDisciplina(e.target.value)} 
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]" 
              />
            </div>
          </div>
        </div>
      )}
      {temAulasSelecionadas && (
        <Button 
          onClick={handleAdicionarDisciplina} 
          className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 w-auto" 
          disabled={!tituloNovaDisciplina.trim()}
        >
          Adicionar Disciplina
        </Button>
      )}
    </div>
  );
};
