import React from "react";
import { X } from "lucide-react";
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
  cor = "#ea2be2",
  dica,
  children,
}) => {
  if (itens.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-[#67748a]">
        <strong className="text-[#272f3c]">{titulo}:</strong> {dica} A seleção é mantida ao trocar de página ou de
        filtro.
      </div>
    );
  }

  return (
    <div
      className="sticky bottom-0 z-20 mt-4 rounded-lg border bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      style={{ borderColor: cor }}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 className="text-base font-semibold text-[#272f3c]">
          {titulo} com {itens.length} {itens.length === 1 ? itemSingular : itemPlural}
        </h2>
        <Button type="button" variant="ghost" size="sm" onClick={onLimpar}>
          Limpar seleção
        </Button>
      </div>

      <ol className="flex flex-wrap gap-2 mb-3 max-h-28 overflow-y-auto">
        {itens.map((item, i) => (
          <li
            key={item.id}
            className="flex items-center gap-1 rounded-full bg-gray-100 pl-3 pr-1 py-1 text-xs text-[#272f3c] max-w-full"
          >
            <span className="text-[#67748a]">{i + 1}.</span>
            <span className="truncate max-w-[240px]" title={item.titulo}>
              {item.titulo}
            </span>
            <button
              type="button"
              onClick={() => onRemover(item.id)}
              className="rounded-full p-0.5 text-gray-500 hover:text-red-500"
              aria-label={`Remover ${item.titulo}`}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ol>

      <div className="flex flex-col md:flex-row md:items-end gap-3">
        <div className="flex-1">{children}</div>
        <Button
          type="button"
          onClick={onCriar}
          disabled={!podeCriar || criando}
          className="text-white shrink-0"
          style={{ backgroundColor: cor }}
        >
          {criando ? "Criando..." : textoBotao}
        </Button>
      </div>
    </div>
  );
};
