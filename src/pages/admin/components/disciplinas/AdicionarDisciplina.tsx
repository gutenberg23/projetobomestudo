import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarraCriacao, ItemSelecionado } from "../shared/BarraCriacao";

interface NovoCursoBarraProps {
  selecionadas: ItemSelecionado[];
  onRemover: (id: string) => void;
  onLimpar: () => void;
  onCriar: (titulo: string, cargo: string, informacoes: string) => Promise<boolean>;
}

/** Barra para criar um curso a partir das disciplinas selecionadas. */
export const AdicionarDisciplina: React.FC<NovoCursoBarraProps> = ({ selecionadas, onRemover, onLimpar, onCriar }) => {
  const [titulo, setTitulo] = useState("");
  const [cargo, setCargo] = useState("");
  const [informacoes, setInformacoes] = useState("");
  const [criando, setCriando] = useState(false);

  const criar = async () => {
    setCriando(true);
    try {
      if (await onCriar(titulo, cargo, informacoes)) {
        setTitulo("");
        setCargo("");
        setInformacoes("");
      }
    } finally {
      setCriando(false);
    }
  };

  return (
    <BarraCriacao
      titulo="Novo curso"
      itemSingular="disciplina"
      itemPlural="disciplinas"
      dica="marque as disciplinas na lista para montar um curso com elas. As teorias de cada disciplina entram automaticamente, na ordem em que forem marcadas."
      itens={selecionadas}
      onRemover={onRemover}
      onLimpar={onLimpar}
      textoBotao="Criar curso"
      onCriar={criar}
      podeCriar={!!titulo.trim()}
      criando={criando}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="titulo-curso" className="mb-1 block text-xs text-slate-600">
            Título do curso *
          </Label>
          <Input id="titulo-curso" placeholder="Ex.: Analista Judiciário - TRF" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="cargo-curso" className="mb-1 block text-xs text-slate-600">
            Cargo
          </Label>
          <Input id="cargo-curso" placeholder="Ex.: Analista - Área Administrativa" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="informacoes-curso" className="mb-1 block text-xs text-slate-600">
            Informações do curso
          </Label>
          <Textarea
            id="informacoes-curso"
            placeholder="Texto exibido na página do curso"
            value={informacoes}
            onChange={(e) => setInformacoes(e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </BarraCriacao>
  );
};
