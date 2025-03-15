
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
  temAulasSelecionadas
}) => {
  // Função para validar e limitar o valor do rating entre 1 e 10
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Se o valor estiver vazio, permitimos para que o usuário possa digitar
    if (value === '') {
      setDescricaoNovaDisciplina('');
      return;
    }
    
    // Verificar se é um número
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    // Limitar o valor entre 1 e 10
    if (numValue >= 1 && numValue <= 10) {
      setDescricaoNovaDisciplina(String(numValue));
    }
  };

  return <div className="flex justify-end mt-4 items-center gap-3">
      {temAulasSelecionadas && <div className="flex-1 max-w-md">
          <div className="grid grid-cols-2 gap-3">
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
              <Label htmlFor="descricao-disciplina" className="mb-1 block">Importância "rating"</Label>
              <Input 
                id="descricao-disciplina" 
                placeholder="Digite um valor de 1 a 10" 
                value={descricaoNovaDisciplina} 
                onChange={handleRatingChange} 
                type="number"
                min="1"
                max="10"
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
            </div>
          </div>
        </div>}
      {temAulasSelecionadas && <Button 
        onClick={handleAdicionarDisciplina} 
        className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 w-auto" 
        disabled={!tituloNovaDisciplina.trim() || !descricaoNovaDisciplina.trim()}
      >
          Adicionar Disciplina
        </Button>}
    </div>;
};
