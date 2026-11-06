import React, { useState } from "react";
import { ChevronDown, Star } from "lucide-react";
import { CaixaSelecao } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";

export interface TeoriaOpcao {
  id: string;
  titulo: string;
  /** Assunto, mostrado ao lado do título */
  assunto?: string;
  publicada?: boolean;
}

interface Props {
  titulo: string;
  /** Todas as teorias da disciplina, na ordem dela */
  teorias: TeoriaOpcao[];
  /** undefined = todas as teorias entram no curso */
  escolhidas: string[] | undefined;
  onChange: (escolhidas: string[] | undefined) => void;
  /** Relevância da disciplina neste curso (1 a 10); undefined = sem nota */
  relevancia?: number;
  onRelevancia: (nota: number | undefined) => void;
}

/**
 * Lista de caixinhas com as teorias de uma disciplina, para escolher quais
 * entram no curso. Sem popover/combobox (eles não recebem cliques dentro do Dialog).
 */
export const EscolherTeoriasDisciplina: React.FC<Props> = ({
  titulo,
  teorias: aulas,
  escolhidas,
  onChange,
  relevancia,
  onRelevancia,
}) => {
  const [aberta, setAberta] = useState(false);
  const marcadas = new Set(escolhidas ?? aulas.map((a) => a.id));
  const n = aulas.filter((a) => marcadas.has(a.id)).length;
  const todas = n === aulas.length;

  const alternar = (id: string) => {
    const novo = new Set(marcadas);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    const lista = aulas.filter((a) => novo.has(a.id)).map((a) => a.id);
    // Todas marcadas volta a ser "todas" (teorias novas da disciplina entram sozinhas)
    onChange(lista.length === aulas.length ? undefined : lista);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center gap-2 pr-2">
        <button
          type="button"
          onClick={() => setAberta((a) => !a)}
          aria-expanded={aberta}
          className="flex min-w-0 flex-1 items-center gap-2 py-2 pl-3 text-left"
        >
          <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">
            {titulo}
          </span>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
              aulas.length === 0
                ? "bg-slate-100 text-slate-500"
                : todas
                  ? "bg-emerald-50 text-emerald-700"
                  : n === 0
                    ? "bg-red-50 text-red-700"
                    : "bg-[#5f2ebe]/10 text-[#5f2ebe]",
            )}
          >
              <span className="sm:hidden">{aulas.length === 0 ? "0" : `${n}/${aulas.length}`}</span>
              <span className="hidden sm:inline">
                {aulas.length === 0
                  ? "sem teorias"
                  : todas
                    ? aulas.length === 1
                      ? "a única teoria"
                      : `todas as ${aulas.length} teorias`
                    : `${n} de ${aulas.length} teorias`}
              </span>
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-slate-400 transition-transform",
              aberta && "rotate-180",
            )}
          />
        </button>
        <label className="flex shrink-0 items-center gap-1 text-[11px] text-slate-500">
          <Star
            className={cn(
              "h-3.5 w-3.5",
              relevancia ? "fill-amber-400 text-amber-400" : "text-slate-300",
            )}
            aria-hidden
          />
          <span className="sr-only">Relevância de {titulo} neste curso</span>
          <select
            value={relevancia ?? ""}
            onChange={(e) =>
              onRelevancia(e.target.value ? Number(e.target.value) : undefined)
            }
            title="Relevância da disciplina neste concurso"
            className={cn(
              "h-7 rounded-md border bg-white px-1 text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30",
              relevancia
                ? "border-amber-300 font-semibold text-amber-700"
                : "border-slate-200 text-slate-400",
            )}
          >
            <option value="">sem nota</option>
            {Array.from({ length: 10 }, (_, i) => 10 - i).map((n) => (
              <option key={n} value={n}>
                {n}/10
              </option>
            ))}
          </select>
        </label>
      </div>

      {aberta && aulas.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-2">
          <div className="mb-1.5 flex gap-3 text-xs">
            <button
              type="button"
              className="font-medium text-[#5f2ebe] hover:underline"
              onClick={() => onChange(undefined)}
            >
              Marcar todas
            </button>
            <button
              type="button"
              className="font-medium text-slate-500 hover:underline"
              onClick={() => onChange([])}
            >
              Desmarcar todas
            </button>
          </div>
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {aulas.map((a, i) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50">
                  <CaixaSelecao
                    marcado={marcadas.has(a.id)}
                    onChange={() => alternar(a.id)}
                    rotulo={`Incluir ${a.titulo}`}
                  />
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {a.titulo}
                    {a.publicada === false && (
                      <span className="ml-1.5 text-[11px] text-amber-600">
                        (rascunho)
                      </span>
                    )}
                  </span>
                  {a.assunto && (
                    <span className="hidden max-w-[40%] shrink-0 truncate text-[11px] text-slate-400 sm:inline">
                      {a.assunto}
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
