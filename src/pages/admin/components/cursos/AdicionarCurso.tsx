import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CursosPageProps } from "./CursosTypes";

export const AdicionarCurso: React.FC<CursosPageProps> = ({
  tituloNovoCurso,
  setTituloNovoCurso,
  descricaoNovoCurso,
  setDescricaoNovoCurso,
  informacoesCurso,
  setInformacoesCurso,
  handleAdicionarCurso,
  temDisciplinasSelecionadas
}) => {
  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-4 bg-white">
      <h2 className="text-xl font-semibold mb-4 text-[#272f3c]">Adicionar Novo Curso</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="titulo-curso" className="mb-1 block text-[#67748a]">Título</Label>
          <Input
            id="titulo-curso"
            placeholder="Digite o título do curso"
            value={tituloNovoCurso}
            onChange={(e) => setTituloNovoCurso(e.target.value)}
            className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
          />
        </div>
        
        <div>
          <Label htmlFor="descricao-curso" className="mb-1 block text-[#67748a]">Cargo</Label>
          <Input
            id="descricao-curso"
            placeholder="Digite o cargo"
            value={descricaoNovoCurso}
            onChange={(e) => setDescricaoNovoCurso(e.target.value)}
            className="border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="informacoes-curso" className="mb-1 block text-[#67748a]">Informações do Curso</Label>
        <Textarea
          id="informacoes-curso"
          placeholder="Digite informações detalhadas sobre o curso"
          value={informacoesCurso}
          onChange={(e) => setInformacoesCurso(e.target.value)}
          className="resize-y min-h-[100px] border-[#5f2ebe] focus-visible:ring-[#5f2ebe]"
        />
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleAdicionarCurso}
          className="bg-[#5f2ebe] hover:bg-[#5f2ebe]/90"
          disabled={!tituloNovoCurso.trim()}
        >
          Adicionar Curso
        </Button>
      </div>
    </div>
  );
};
