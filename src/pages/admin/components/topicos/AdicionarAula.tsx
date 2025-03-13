
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdicionarAulaProps {
  tituloNovaAula: string;
  setTituloNovaAula: (titulo: string) => void;
  descricaoNovaAula: string;
  setDescricaoNovaAula: (descricao: string) => void;
  handleAdicionarAula: () => void;
  temTopicosSelecionados: boolean;
}

export const AdicionarAula: React.FC<AdicionarAulaProps> = ({
  tituloNovaAula,
  setTituloNovaAula,
  descricaoNovaAula,
  setDescricaoNovaAula,
  handleAdicionarAula,
  temTopicosSelecionados
}) => {
  return (
    <div className="flex justify-end mt-4 items-center gap-3">
      {temTopicosSelecionados && (
        <div className="flex-1 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="titulo-aula" className="mb-1 block">Título da aula</Label>
              <Input
                id="titulo-aula"
                placeholder="Digite o título da aula"
                value={tituloNovaAula}
                onChange={(e) => setTituloNovaAula(e.target.value)}
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
            </div>
            <div>
              <Label htmlFor="descricao-aula" className="mb-1 block">No edital</Label>
              <Input
                id="descricao-aula"
                placeholder="Tópicos do edital"
                value={descricaoNovaAula}
                onChange={(e) => setDescricaoNovaAula(e.target.value)}
                className="border-[#ea2be2] focus-visible:ring-[#ea2be2]"
              />
            </div>
          </div>
        </div>
      )}
      <Button 
        onClick={handleAdicionarAula}
        className="bg-[#ea2be2] hover:bg-[#ea2be2]/90 w-auto"
        disabled={!temTopicosSelecionados || !tituloNovaAula.trim()}
      >
        Adicionar Aula
      </Button>
    </div>
  );
};
