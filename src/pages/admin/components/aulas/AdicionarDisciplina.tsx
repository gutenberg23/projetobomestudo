import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarraCriacao, ItemSelecionado } from "../shared/BarraCriacao";
import { CampoDisciplinaQuestoes } from "../shared/CampoDisciplinaQuestoes";

interface AdicionarDisciplinaProps {
  selecionadas: ItemSelecionado[];
  onRemover: (id: string) => void;
  onLimpar: () => void;
  /** Devolve true quando a disciplina foi criada */
  onCriar: (titulo: string, rating: string, banca: string, disciplinaQuestoes: string) => Promise<boolean>;
}

/** Barra para criar uma disciplina com as aulas selecionadas. */
export const AdicionarDisciplina: React.FC<AdicionarDisciplinaProps> = ({ selecionadas, onRemover, onLimpar, onCriar }) => {
  const [titulo, setTitulo] = useState("");
  const [rating, setRating] = useState("");
  const [banca, setBanca] = useState("");
  const [disciplinaQuestoes, setDisciplinaQuestoes] = useState("");
  const [criando, setCriando] = useState(false);

  const criar = async () => {
    setCriando(true);
    try {
      if (await onCriar(titulo, rating, banca, disciplinaQuestoes)) {
        setTitulo("");
        setRating("");
        setBanca("");
        setDisciplinaQuestoes("");
      }
    } finally {
      setCriando(false);
    }
  };

  return (
    <BarraCriacao
      titulo="Nova disciplina"
      itemSingular="aula"
      itemPlural="aulas"
      dica="marque as aulas na lista para montar uma disciplina com elas, na ordem em que forem marcadas."
      itens={selecionadas}
      onRemover={onRemover}
      onLimpar={onLimpar}
      textoBotao="Criar disciplina"
      onCriar={criar}
      podeCriar={!!titulo.trim()}
      criando={criando}
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1.5fr]">
        <div>
          <Label htmlFor="titulo-disciplina" className="mb-1 block text-xs text-slate-600">
            Título da disciplina *
          </Label>
          <Input
            id="titulo-disciplina"
            placeholder="Ex.: Direito Administrativo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && titulo.trim() && criar()}
          />
        </div>
        <div>
          <Label htmlFor="rating-disciplina" className="mb-1 block text-xs text-slate-600">
            Nota de rating (1 a 10)
          </Label>
          <Input
            id="rating-disciplina"
            type="number"
            min="1"
            max="10"
            placeholder="Ex.: 8"
            value={rating}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "" || (/^\d+$/.test(v) && +v >= 1 && +v <= 10)) setRating(v);
            }}
          />
        </div>
        <div>
          <Label htmlFor="banca-disciplina" className="mb-1 block text-xs text-slate-600">
            Banca
          </Label>
          <Input id="banca-disciplina" placeholder="Ex.: CEBRASPE" value={banca} onChange={(e) => setBanca(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="questoes-disciplina" className="mb-1 block text-xs text-slate-600">
            Disciplina das questões (estatísticas)
          </Label>
          <CampoDisciplinaQuestoes id="questoes-disciplina" valor={disciplinaQuestoes} onChange={setDisciplinaQuestoes} />
        </div>
      </div>
    </BarraCriacao>
  );
};
