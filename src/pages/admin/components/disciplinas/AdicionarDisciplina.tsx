import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DisciplinasPageProps } from "./DisciplinasTypes";
import { BarraCriacao } from "../shared/BarraCriacao";

/** Barra para criar um curso a partir das disciplinas selecionadas. */
export const AdicionarDisciplina: React.FC<DisciplinasPageProps> = ({
  tituloNovaDisciplina,
  setTituloNovaDisciplina,
  descricaoNovaDisciplina,
  setDescricaoNovaDisciplina,
  informacoesCurso,
  setInformacoesCurso,
  handleAdicionarDisciplina,
  disciplinas,
  onRemoverSelecionada = () => undefined,
  onLimparSelecao = () => undefined,
}) => {
  const [criando, setCriando] = useState(false);
  const selecionadas = disciplinas
    .filter((d) => d.selecionada)
    .map((d) => ({ id: d.id, titulo: d.titulo }));

  const criar = async () => {
    setCriando(true);
    try {
      await handleAdicionarDisciplina();
    } finally {
      setCriando(false);
    }
  };

  return (
    <BarraCriacao
      titulo="Novo curso"
      itemSingular="disciplina"
      itemPlural="disciplinas"
      dica="marque as disciplinas na tabela para montar um curso com elas. Aulas, tópicos e questões são incluídos automaticamente."
      itens={selecionadas}
      onRemover={onRemoverSelecionada}
      onLimpar={onLimparSelecao}
      textoBotao="Criar curso"
      onCriar={criar}
      podeCriar={!!tituloNovaDisciplina.trim()}
      criando={criando}
      cor="#5f2ebe"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="titulo-curso" className="mb-1 block">Título do curso *</Label>
          <Input
            id="titulo-curso"
            placeholder="Ex.: Analista Judiciário - TRF"
            value={tituloNovaDisciplina}
            onChange={(e) => setTituloNovaDisciplina(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cargo-curso" className="mb-1 block">Cargo</Label>
          <Input
            id="cargo-curso"
            placeholder="Digite o cargo"
            value={descricaoNovaDisciplina}
            onChange={(e) => setDescricaoNovaDisciplina(e.target.value)}
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="informacoes-curso" className="mb-1 block">Informações do curso</Label>
          <Textarea
            id="informacoes-curso"
            placeholder="Digite as informações do curso"
            value={informacoesCurso}
            onChange={(e) => setInformacoesCurso(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </BarraCriacao>
  );
};
