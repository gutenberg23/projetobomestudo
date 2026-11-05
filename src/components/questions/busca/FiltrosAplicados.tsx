import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAVES, ROTULOS, type ChaveFiltro, type Filtros } from "./filtros";

interface Props {
  q: string;
  filtros: Filtros;
  onRemover: (chave: ChaveFiltro, valor: string) => void;
  onLimparBusca: () => void;
  onLimparTudo: () => void;
  extra?: React.ReactNode;
  className?: string;
}

const chip =
  "inline-flex max-w-full items-center gap-1.5 rounded-full border border-[#5f2ebe]/20 bg-[#5f2ebe]/[0.06] py-1 pl-3 pr-1 text-xs font-medium text-[#4b23a0]";

export const FiltrosAplicados: React.FC<Props> = ({ q, filtros, onRemover, onLimparBusca, onLimparTudo, extra, className }) => {
  const itens = CHAVES.flatMap((c) => filtros[c].map((v) => ({ chave: c, valor: v })));
  if (!q && itens.length === 0 && !extra) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {q && (
        <span className={chip}>
          <Search className="h-3 w-3 shrink-0" />
          <span className="truncate">"{q}"</span>
          <button type="button" onClick={onLimparBusca} aria-label="Remover busca" className="rounded-full p-0.5 hover:bg-[#5f2ebe]/15">
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      )}
      {extra}
      {itens.map(({ chave, valor }) => (
        <span key={`${chave}:${valor}`} className={chip} title={`${ROTULOS[chave]}: ${valor}`}>
          <span className="shrink-0 text-[#5f2ebe]/70">{ROTULOS[chave]}:</span>
          <span className="truncate">{valor}</span>
          <button
            type="button"
            onClick={() => onRemover(chave, valor)}
            aria-label={`Remover ${valor}`}
            className="shrink-0 rounded-full p-0.5 hover:bg-[#5f2ebe]/15"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <button type="button" onClick={onLimparTudo} className="px-1 text-xs font-semibold text-slate-500 hover:text-[#5f2ebe] hover:underline">
        Limpar tudo
      </button>
    </div>
  );
};
