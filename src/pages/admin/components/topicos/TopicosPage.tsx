
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TopicosPageProps } from "./TopicosTypes";

export const AddAulaButton: React.FC<TopicosPageProps> = ({
  tituloAula,
  setTituloAula,
  descricaoAula,
  setDescricaoAula,
  temTopicosSelecionados,
  handleCriarAula
}) => {
  return (
    <div className="flex justify-end mt-4 items-center gap-3">
      {temTopicosSelecionados && (
        <div className="flex-1 max-w-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="titulo-aula" className="mb-1 block">Título</Label>
              <Input
                id="titulo-aula"
                placeholder="Digite o título da aula"
                value={tituloAula}
                onChange={(e) => setTituloAula(e.target.value)}
                className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
              />
            </div>
            <div>
              <Label htmlFor="descricao-aula" className="mb-1 block">Descrição</Label>
              <Input
                id="descricao-aula"
                placeholder="Digite a descrição"
                value={descricaoAula}
                onChange={(e) => setDescricaoAula(e.target.value)}
                className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
              />
            </div>
          </div>
        </div>
      )}
      <Button 
        onClick={handleCriarAula}
        className="bg-[#ea2be2] hover:bg-[#ea2be2]/90"
        disabled={!temTopicosSelecionados}
      >
        Adicionar Aula
      </Button>
    </div>
  );
};
