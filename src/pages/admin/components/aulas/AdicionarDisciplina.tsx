import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AulasPageProps } from "./AulasTypes";
import { BarraCriacao } from "../shared/BarraCriacao";

export const AdicionarDisciplina: React.FC<AulasPageProps> = ({
  tituloNovaDisciplina,
  setTituloNovaDisciplina,
  descricaoNovaDisciplina,
  setDescricaoNovaDisciplina,
  bancaNovaDisciplina,
  setBancaNovaDisciplina,
  handleAdicionarDisciplina,
  aulasSelecionadas = [],
  onRemoverSelecionada = () => undefined,
  onLimparSelecao = () => undefined,
}) => {
  const [criando, setCriando] = useState(false);

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
      titulo="Nova disciplina"
      itemSingular="aula"
      itemPlural="aulas"
      dica="marque as aulas na tabela para montar uma disciplina com elas."
      itens={aulasSelecionadas}
      onRemover={onRemoverSelecionada}
      onLimpar={onLimparSelecao}
      textoBotao="Criar disciplina"
      onCriar={criar}
      podeCriar={!!tituloNovaDisciplina.trim()}
      criando={criando}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="titulo-disciplina" className="mb-1 block">Título *</Label>
          <Input
            id="titulo-disciplina"
            placeholder="Ex.: Direito Administrativo"
            value={tituloNovaDisciplina}
            onChange={e => setTituloNovaDisciplina(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="descricao-disciplina" className="mb-1 block">Nota de rating (1 a 10)</Label>
          <Input
            id="descricao-disciplina"
            type="number"
            min="1"
            max="10"
            placeholder="Ex.: 8"
            value={descricaoNovaDisciplina}
            onChange={e => {
              const value = e.target.value;
              if (value === "" || (/^\d+$/.test(value) && parseInt(value) >= 1 && parseInt(value) <= 10)) {
                setDescricaoNovaDisciplina(value);
              }
            }}
          />
        </div>
        <div>
          <Label htmlFor="banca-disciplina" className="mb-1 block">Banca</Label>
          <Input
            id="banca-disciplina"
            placeholder="Ex.: CEBRASPE"
            value={bancaNovaDisciplina}
            onChange={e => setBancaNovaDisciplina(e.target.value)}
          />
        </div>
      </div>
    </BarraCriacao>
  );
};
