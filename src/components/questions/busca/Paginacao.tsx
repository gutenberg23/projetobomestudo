import React, { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { POR_PAGINA, formatarNumero } from "./filtros";

/** Números visíveis: 1 … 4 5 [6] 7 8 … 120 */
export function paginasVisiveis(atual: number, total: number, vizinhos = 1): Array<number | "…"> {
  if (total <= 5 + vizinhos * 2) return Array.from({ length: total }, (_, i) => i + 1);
  const inicio = Math.max(2, atual - vizinhos);
  const fim = Math.min(total - 1, atual + vizinhos);
  const lista: Array<number | "…"> = [1];
  if (inicio > 2) lista.push("…");
  for (let p = inicio; p <= fim; p++) lista.push(p);
  if (fim < total - 1) lista.push("…");
  lista.push(total);
  return lista;
}

interface Props {
  pagina: number;
  totalPaginas: number;
  total: number;
  porPagina: number;
  onPagina: (p: number) => void;
  onPorPagina?: (n: number) => void;
  className?: string;
}

const botao =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium tabular-nums transition-colors disabled:pointer-events-none disabled:opacity-40";

export const Paginacao: React.FC<Props> = ({ pagina, totalPaginas, total, porPagina, onPagina, onPorPagina, className }) => {
  const [ir, setIr] = useState("");
  const de = total === 0 ? 0 : (pagina - 1) * porPagina + 1;
  const ate = Math.min(total, pagina * porPagina);

  const irPara = (e: React.FormEvent) => {
    e.preventDefault();
    const n = parseInt(ir, 10);
    if (n >= 1 && n <= totalPaginas) onPagina(n);
    setIr("");
  };

  return (
    <nav aria-label="Paginação" className={cn("flex flex-col items-center gap-3 md:flex-row md:justify-between", className)}>
      <p className="order-2 text-sm text-slate-500 md:order-1">
        Mostrando <strong className="font-semibold text-slate-800 tabular-nums">{formatarNumero(de)}–{formatarNumero(ate)}</strong> de{" "}
        <strong className="font-semibold text-slate-800 tabular-nums">{formatarNumero(total)}</strong>
      </p>

      {totalPaginas > 1 && (
        <div className="order-1 flex items-center gap-1 md:order-2">
          <button type="button" className={cn(botao, "hidden text-slate-500 hover:bg-white sm:inline-flex")} onClick={() => onPagina(1)} disabled={pagina === 1} aria-label="Primeira página">
            <ChevronsLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(botao, "gap-1 border border-slate-200 bg-white text-slate-700 hover:border-slate-300")}
            onClick={() => onPagina(pagina - 1)}
            disabled={pagina === 1}
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden pr-1 lg:inline">Anterior</span>
          </button>

          {/* No celular, só "3 de 120" */}
          <span className="px-3 text-sm tabular-nums text-slate-600 sm:hidden">
            {pagina} de {formatarNumero(totalPaginas)}
          </span>
          <div className="hidden items-center gap-1 sm:flex">
            {paginasVisiveis(pagina, totalPaginas).map((p, i) =>
              p === "…" ? (
                <span key={`r${i}`} className="w-6 text-center text-slate-400">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPagina(p)}
                  aria-current={p === pagina ? "page" : undefined}
                  className={cn(botao, p === pagina ? "bg-[#5f2ebe] text-white shadow-sm" : "text-slate-600 hover:bg-white")}
                >
                  {formatarNumero(p)}
                </button>
              )
            )}
          </div>

          <button
            type="button"
            className={cn(botao, "gap-1 border border-slate-200 bg-white text-slate-700 hover:border-slate-300")}
            onClick={() => onPagina(pagina + 1)}
            disabled={pagina === totalPaginas}
            aria-label="Próxima página"
          >
            <span className="hidden pl-1 lg:inline">Próxima</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            className={cn(botao, "hidden text-slate-500 hover:bg-white sm:inline-flex")}
            onClick={() => onPagina(totalPaginas)}
            disabled={pagina === totalPaginas}
            aria-label="Última página"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="order-3 flex items-center gap-3 text-sm text-slate-500">
        {totalPaginas > 7 && (
          <form onSubmit={irPara} className="hidden items-center gap-1.5 md:flex">
            <label htmlFor="ir-pagina">Ir para</label>
            <input
              id="ir-pagina"
              inputMode="numeric"
              value={ir}
              onChange={(e) => setIr(e.target.value.replace(/\D/g, ""))}
              placeholder={String(pagina)}
              className="h-9 w-14 rounded-lg border border-slate-200 bg-white px-2 text-center tabular-nums text-slate-800 outline-none focus:border-[#5f2ebe]"
            />
          </form>
        )}
        {onPorPagina && (
          <label className="flex items-center gap-1.5">
            <span>Por página</span>
            <select
              value={porPagina}
              onChange={(e) => onPorPagina(Number(e.target.value))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-slate-800 outline-none focus:border-[#5f2ebe]"
            >
              {POR_PAGINA.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </nav>
  );
};
