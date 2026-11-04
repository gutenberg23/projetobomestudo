import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarraCriacao, ItemSelecionado } from "../shared/BarraCriacao";

interface AdicionarAulaProps {
  tituloNovaAula: string;
  setTituloNovaAula: (titulo: string) => void;
  descricaoNovaAula: string;
  setDescricaoNovaAula: (descricao: string) => void;
  handleAdicionarAula: () => void | Promise<void>;
  temTopicosSelecionados: boolean;
  selecionados?: ItemSelecionado[];
  onRemoverSelecionado?: (id: string) => void;
  onLimparSelecao?: () => void;
}

export const AdicionarAula: React.FC<AdicionarAulaProps> = ({
  tituloNovaAula,
  setTituloNovaAula,
  descricaoNovaAula,
  setDescricaoNovaAula,
  handleAdicionarAula,
  selecionados = [],
  onRemoverSelecionado = () => undefined,
  onLimparSelecao = () => undefined,
}) => {
  const [criando, setCriando] = useState(false);

  const criar = async () => {
    setCriando(true);
    try {
      await handleAdicionarAula();
    } finally {
      setCriando(false);
    }
  };

  return (
    <BarraCriacao
      titulo="Nova aula"
      itemSingular="tópico"
      itemPlural="tópicos"
      dica="marque os tópicos na tabela para montar uma aula com eles."
      itens={selecionados}
      onRemover={onRemoverSelecionado}
      onLimpar={onLimparSelecao}
      textoBotao="Criar aula"
      onCriar={criar}
      podeCriar={!!tituloNovaAula.trim()}
      criando={criando}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor="titulo-aula" className="mb-1 block">Título da aula *</Label>
          <Input
            id="titulo-aula"
            placeholder="Ex.: Aula 01 - Princípios"
            value={tituloNovaAula}
            onChange={(e) => setTituloNovaAula(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && tituloNovaAula.trim() && criar()}
          />
        </div>
        <div>
          <Label htmlFor="descricao-aula" className="mb-1 block">No edital</Label>
          <Input
            id="descricao-aula"
            placeholder="Tópicos do edital cobertos pela aula"
            value={descricaoNovaAula}
            onChange={(e) => setDescricaoNovaAula(e.target.value)}
          />
        </div>
      </div>
    </BarraCriacao>
  );
};
