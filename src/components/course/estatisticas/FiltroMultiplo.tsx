import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { normalizar } from "../ui";
import type { Opcao } from "./dadosEstatisticas";

interface Props {
  rotulo: string;
  /** Plural para "3 bancas", "2 instituições" */
  plural: string;
  /** Texto do botão quando nada está marcado (ex.: "Todas as bancas") */
  todos: string;
  opcoes: Opcao[];
  selecionados: string[];
  onChange: (valores: string[]) => void;
}

/** Botão com lista de caixas de seleção e busca, para filtrar por banca, instituição ou ano. */
export const FiltroMultiplo: React.FC<Props> = ({ rotulo, plural, todos, opcoes, selecionados, onChange }) => {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");

  const visiveis = useMemo(() => {
    const termo = normalizar(busca);
    return termo ? opcoes.filter((o) => normalizar(o.valor).includes(termo)) : opcoes;
  }, [opcoes, busca]);

  const marcados = new Set(selecionados);
  const alternar = (valor: string) =>
    onChange(marcados.has(valor) ? selecionados.filter((v) => v !== valor) : [...selecionados, valor]);

  const texto =
    selecionados.length === 0 ? todos : selecionados.length === 1 ? selecionados[0] : `${selecionados.length} ${plural}`;

  return (
    <Popover open={aberto} onOpenChange={(v) => { setAberto(v); if (!v) setBusca(""); }}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={opcoes.length === 0}
          className={cn(
            "flex h-10 min-w-0 items-center justify-between gap-2 rounded-xl border bg-white px-3 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            selecionados.length > 0
              ? "border-[#5f2ebe]/40 bg-[#5f2ebe]/5 text-[#5f2ebe]"
              : "border-slate-200 text-slate-700 hover:border-slate-300"
          )}
        >
          <span className="min-w-0 truncate">
            <span className="mr-1 text-xs font-medium uppercase tracking-wide text-slate-400">{rotulo}</span>
            {texto}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(320px,calc(100vw-20px))] p-0">
        <div className="flex items-center gap-2 border-b border-slate-100 px-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar ${rotulo.toLowerCase()}`}
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            autoFocus
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1">
          {visiveis.length === 0 && <p className="px-3 py-6 text-center text-sm text-slate-400">Nada encontrado</p>}
          {visiveis.map((o) => {
            const marcado = marcados.has(o.valor);
            return (
              <button
                key={o.valor}
                type="button"
                onClick={() => alternar(o.valor)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    marcado ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-300"
                  )}
                >
                  {marcado && <Check className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1 truncate">{o.valor}</span>
                <span className="shrink-0 text-xs tabular-nums text-slate-400">{o.total.toLocaleString("pt-BR")}</span>
              </button>
            );
          })}
        </div>
        {selecionados.length > 0 && (
          <div className="border-t border-slate-100 p-1">
            <button
              type="button"
              onClick={() => onChange([])}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" /> Limpar {rotulo.toLowerCase()}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
