
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
    <div className="space-y-4 mt-6 p-4 border rounded-md">
      <h2 className="text-lg font-medium text-[#272f3c]">Adicionar Curso</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="titulo-curso">Título do Curso</Label>
          <Input
            id="titulo-curso"
            value={tituloNovoCurso}
            onChange={(e) => setTituloNovoCurso(e.target.value)}
            placeholder="Digite o título do curso"
          />
        </div>
        <div>
          <Label htmlFor="descricao-curso">Descrição</Label>
          <Textarea
            id="descricao-curso"
            value={descricaoNovoCurso}
            onChange={(e) => setDescricaoNovoCurso(e.target.value)}
            placeholder="Digite a descrição do curso"
            rows={3}
          />
        </div>
        <div>
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
          disabled={!temDisciplinasSelecionadas || !tituloNovoCurso}
        >
          Adicionar Curso
        </Button>
      </div>
    </div>
  );
};
