import React from "react";
import { Layers, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ItemSelecionado {
  id: string;
  titulo: string;
}

interface BarraCriacaoProps {
  /** Ex.: "Nova aula" */
  titulo: string;
  /** Ex.: "tópico" / "tópicos" */
  itemSingular: string;
  itemPlural: string;
  itens: ItemSelecionado[];
  onRemover: (id: string) => void;
  onLimpar: () => void;
  textoBotao: string;
  onCriar: () => void;
  podeCriar: boolean;
  criando?: boolean;
  cor?: string;
  /** Texto mostrado quando nada está selecionado */
  dica: string;
  children: React.ReactNode;
}

/**
 * Barra fixa no rodapé da listagem para montar um item a partir dos
 * selecionados (tópicos → aula, aulas → disciplina, disciplinas → curso).
 * Mostra exatamente o que foi selecionado, inclusive itens de outras páginas
 * ou escondidos pelo filtro.
 */
export const BarraCriacao: React.FC<BarraCriacaoProps> = ({
  titulo,
  itemSingular,
  itemPlural,
  itens,
  onRemover,
  onLimpar,
  textoBotao,
  onCriar,
  podeCriar,
  criando = false,
  dica,
  children,
}) => {
  if (itens.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm text-slate-500">
        <Layers className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          <strong className="font-medium text-slate-700">{titulo}:</strong> {dica} A seleção continua valendo ao trocar
          de página ou de filtro.
        </p>
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 z-20 -mx-1 rounded-xl border border-[#5f2ebe]/30 bg-white p-4 shadow-[0_-8px_24px_rgba(16,24,40,0.08)] sm:mx-0">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#5f2ebe] px-1.5 text-xs font-bold tabular-nums text-white">
            {itens.length}
          </span>
          {titulo} com {itens.length} {itens.length === 1 ? itemSingular : itemPlural}
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onLimpar} className="h-8 text-slate-500">
          Limpar seleção
        </Button>
      </div>

      <ol className="mb-3 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto" aria-label="Itens selecionados, na ordem">
        {itens.map((item, i) => (
          <li
            key={item.id}
            className="flex max-w-full items-center gap-1 rounded-full bg-[#5f2ebe]/[0.07] py-0.5 pl-2.5 pr-1 text-xs text-slate-700 ring-1 ring-[#5f2ebe]/15"
          >
            <span className="tabular-nums text-[#5f2ebe]">{i + 1}.</span>
            <span className="max-w-[240px] truncate" title={item.titulo}>
              {item.titulo}
            </span>
            <button
              type="button"
              onClick={() => onRemover(item.id)}
              className="rounded-full p-0.5 text-slate-400 hover:bg-white hover:text-red-500"
              aria-label={`Remover ${item.titulo}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ol>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">{children}</div>
        <Button
          type="button"
          onClick={onCriar}
          disabled={!podeCriar || criando}
          className="shrink-0 bg-[#ea2be2] text-white hover:bg-[#d029d5]"
        >
          {criando ? "Criando..." : textoBotao}
        </Button>
      </div>
    </div>
  );
};
