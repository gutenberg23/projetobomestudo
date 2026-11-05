import React, { useMemo, useState } from "react";
import { Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { normalizar } from "@/components/course/ui";
import { formatarNumero } from "./filtros";
import type { GrupoOpcoes } from "./useOpcoesFiltro";

const LIMITE = 150;

interface Props {
  grupos: GrupoOpcoes[];
  selecionados: string[];
  onAlternar: (valor: string) => void;
  onLimpar?: () => void;
  vazio?: string;
  /** Altura máxima da lista rolável. */
  alturaMax?: string;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Lista de opções com busca e caixas de marcar. Não usa Popover nem Command,
 * então funciona dentro de Sheet/Dialog (há duas cópias do dismissable-layer
 * no projeto e combobox dentro de modal não recebe cliques).
 */
export const ListaOpcoes: React.FC<Props> = ({
  grupos,
  selecionados,
  onAlternar,
  onLimpar,
  vazio = "Nenhuma opção disponível",
  alturaMax = "max-h-72",
  autoFocus,
  className,
}) => {
  const [busca, setBusca] = useState("");
  const total = grupos.reduce((s, g) => s + g.opcoes.length, 0);
  const termo = normalizar(busca);

  const filtrados = useMemo(() => {
    let restante = LIMITE;
    return grupos
      .map((g) => {
        const opcoes = g.opcoes.filter((o) => !termo || normalizar(o.valor).includes(termo)).slice(0, Math.max(0, restante));
        restante -= opcoes.length;
        return { ...g, opcoes };
      })
      .filter((g) => g.opcoes.length);
  }, [grupos, termo]);
  const exibidos = filtrados.reduce((s, g) => s + g.opcoes.length, 0);

  if (total === 0) {
    return <p className={cn("px-1 py-3 text-sm text-slate-400", className)}>{vazio}</p>;
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {total > 8 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Procurar..."
            aria-label="Procurar opção"
            autoFocus={autoFocus}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-800 outline-none transition focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/10"
          />
          {busca && (
            <button
              type="button"
              onClick={() => setBusca("")}
              aria-label="Limpar"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      <div className={cn("-mx-1 overflow-y-auto overscroll-contain px-1", alturaMax)}>
        {filtrados.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-400">Nada encontrado para "{busca}"</p>
        ) : (
          filtrados.map((g) => (
            <div key={g.grupo || "_"} className="mb-1 last:mb-0">
              {g.grupo && (
                <div className="sticky top-0 z-[1] truncate bg-white/95 px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 backdrop-blur">
                  {g.grupo}
                </div>
              )}
              {g.opcoes.map((o) => {
                const marcado = selecionados.includes(o.valor);
                return (
                  <button
                    key={o.valor}
                    type="button"
                    role="checkbox"
                    aria-checked={marcado}
                    onClick={() => onAlternar(o.valor)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                      marcado ? "bg-[#5f2ebe]/[0.07] text-slate-900" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                        marcado ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-300 bg-white"
                      )}
                    >
                      {marcado && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0 flex-1 break-words leading-snug">{o.valor}</span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400">{formatarNumero(o.total)}</span>
                  </button>
                );
              })}
            </div>
          ))
        )}
        {exibidos >= LIMITE && <p className="px-2 py-2 text-xs text-slate-400">Mostrando as primeiras {LIMITE}. Procure para achar outras.</p>}
      </div>

      {onLimpar && selecionados.length > 0 && (
        <button type="button" onClick={onLimpar} className="self-start px-1 text-xs font-semibold text-[#5f2ebe] hover:underline">
          Limpar {selecionados.length === 1 ? "seleção" : `${selecionados.length} selecionados`}
        </button>
      )}
    </div>
  );
};
