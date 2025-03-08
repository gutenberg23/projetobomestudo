
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
    <div className="bg-white p-4 rounded-md shadow space-y-4">
      <h3 className="text-lg font-medium text-[#272f3c]">Adicionar Novo Curso</h3>
      
      <div className="space-y-2">
        <Label htmlFor="titulo-curso">Título</Label>
        <Input
          id="titulo-curso"
          value={tituloNovoCurso}
          onChange={(e) => setTituloNovoCurso(e.target.value)}
          placeholder="Digite o título do curso"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="descricao-curso">Descrição</Label>
        <Textarea
          id="descricao-curso"
          value={descricaoNovoCurso}
          onChange={(e) => setDescricaoNovoCurso(e.target.value)}
          placeholder="Digite a descrição do curso"
          rows={3}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="informacoes-curso">Informações Adicionais</Label>
        <Textarea
          id="informacoes-curso"
          value={informacoesCurso}
          onChange={(e) => setInformacoesCurso(e.target.value)}
          placeholder="Digite informações adicionais sobre o curso"
          rows={3}
        />
      </div>
      
      <Button 
        onClick={handleAdicionarCurso}
        disabled={!temDisciplinasSelecionadas}
        className="w-full"
      >
        Adicionar Curso
      </Button>
      
      {!temDisciplinasSelecionadas && (
        <p className="text-sm text-red-500">
          Selecione pelo menos uma disciplina para adicionar um curso.
        </p>
      )}
    </div>
  );
};
