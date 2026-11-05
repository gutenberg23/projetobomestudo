import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CaixaSelecao } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";

export interface AulaOpcao {
  id: string;
  titulo: string;
}

interface Props {
  titulo: string;
  /** Todas as aulas da disciplina, na ordem dela */
  aulas: AulaOpcao[];
  /** undefined = todas as aulas entram no curso */
  escolhidas: string[] | undefined;
  onChange: (escolhidas: string[] | undefined) => void;
}

/**
 * Lista de caixinhas com as aulas de uma disciplina, para escolher quais
 * entram no curso. Sem popover/combobox (eles não recebem cliques dentro do Dialog).
 */
export const EscolherAulasDisciplina: React.FC<Props> = ({ titulo, aulas, escolhidas, onChange }) => {
  const [aberta, setAberta] = useState(false);
  const marcadas = new Set(escolhidas ?? aulas.map((a) => a.id));
  const n = aulas.filter((a) => marcadas.has(a.id)).length;
  const todas = n === aulas.length;

  const alternar = (id: string) => {
    const novo = new Set(marcadas);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    const lista = aulas.filter((a) => novo.has(a.id)).map((a) => a.id);
    // Todas marcadas volta a ser "todas" (aulas novas da disciplina entram sozinhas)
    onChange(lista.length === aulas.length ? undefined : lista);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setAberta((a) => !a)}
        aria-expanded={aberta}
        className="flex w-full items-center gap-2 px-3 py-2 text-left"
      >
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{titulo}</span>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums",
            aulas.length === 0
              ? "bg-slate-100 text-slate-500"
              : todas
                ? "bg-emerald-50 text-emerald-700"
                : n === 0
                  ? "bg-red-50 text-red-700"
                  : "bg-[#5f2ebe]/10 text-[#5f2ebe]"
          )}
        >
          {aulas.length === 0 ? "sem aulas" : todas ? `todas as ${aulas.length} aulas` : `${n} de ${aulas.length} aulas`}
        </span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", aberta && "rotate-180")} />
      </button>

      {aberta && aulas.length > 0 && (
        <div className="border-t border-slate-100 px-3 py-2">
          <div className="mb-1.5 flex gap-3 text-xs">
            <button type="button" className="font-medium text-[#5f2ebe] hover:underline" onClick={() => onChange(undefined)}>
              Marcar todas
            </button>
            <button type="button" className="font-medium text-slate-500 hover:underline" onClick={() => onChange([])}>
              Desmarcar todas
            </button>
          </div>
          <ul className="max-h-56 space-y-0.5 overflow-y-auto">
            {aulas.map((a, i) => (
              <li key={a.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-slate-700 hover:bg-slate-50">
                  <CaixaSelecao marcado={marcadas.has(a.id)} onChange={() => alternar(a.id)} rotulo={`Incluir ${a.titulo}`} />
                  <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{a.titulo}</span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
