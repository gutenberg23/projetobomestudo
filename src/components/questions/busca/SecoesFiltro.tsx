import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListaOpcoes } from "./ListaOpcoes";
import { FILTROS_VISIVEIS, ROTULOS, type ChaveFiltro, type Filtros } from "./filtros";
import type { GrupoOpcoes } from "./useOpcoesFiltro";

/** Campo de busca por palavra-chave que só grava na URL depois de uma pausa na digitação. */
export const CampoBusca: React.FC<{
  valor: string;
  onBuscar: (q: string) => void;
  placeholder?: string;
  className?: string;
  grande?: boolean;
}> = ({ valor, onBuscar, placeholder = "Busque por palavra-chave no enunciado", className, grande }) => {
  const [texto, setTexto] = useState(valor);
  const ultimo = useRef(valor);

  useEffect(() => {
    if (valor !== ultimo.current) {
      ultimo.current = valor;
      setTexto(valor);
    }
  }, [valor]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (texto.trim() === ultimo.current) return;
      ultimo.current = texto.trim();
      onBuscar(texto);
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto]);

  return (
    <div className={cn("relative", className)}>
      <Search className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400", grande ? "left-4 h-5 w-5" : "left-3 h-4 w-4")} />
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            ultimo.current = texto.trim();
            onBuscar(texto);
          }
        }}
        placeholder={placeholder}
        aria-label="Buscar questões"
        className={cn(
          "w-full border border-slate-200 bg-white text-slate-800 outline-none transition focus:border-[#5f2ebe] focus:ring-4 focus:ring-[#5f2ebe]/10",
          grande ? "h-12 rounded-2xl pl-12 pr-11 text-base shadow-sm" : "h-10 rounded-xl pl-9 pr-9 text-sm"
        )}
      />
      {texto && (
        <button
          type="button"
          aria-label="Limpar busca"
          onClick={() => {
            setTexto("");
            ultimo.current = "";
            onBuscar("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

interface SecoesProps {
  filtros: Filtros;
  opcoesDe: (chave: ChaveFiltro, filtros: Filtros) => GrupoOpcoes[];
  dicaVazio: (chave: ChaveFiltro, filtros: Filtros) => string;
  onAlternar: (chave: ChaveFiltro, valor: string) => void;
  onLimparChave: (chave: ChaveFiltro) => void;
  carregando?: boolean;
  /** Seções abertas de início. */
  abertas?: ChaveFiltro[];
  className?: string;
}

/** Filtros empilhados em seções que abrem e fecham. Usado na barra lateral e na gaveta do celular. */
export const SecoesFiltro: React.FC<SecoesProps> = ({
  filtros,
  opcoesDe,
  dicaVazio,
  onAlternar,
  onLimparChave,
  carregando,
  abertas = ["disciplines"],
  className,
}) => {
  const [abertasAgora, setAbertasAgora] = useState<ChaveFiltro[]>(() =>
    Array.from(new Set([...abertas, ...FILTROS_VISIVEIS.filter((c) => filtros[c].length > 0)]))
  );
  const alternarSecao = (c: ChaveFiltro) => setAbertasAgora((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));

  return (
    <div className={cn("divide-y divide-slate-100", className)}>
      {FILTROS_VISIVEIS.map((chave) => {
        const aberta = abertasAgora.includes(chave);
        const qtd = filtros[chave].length;
        const travada = (chave === "topics" || chave === "subtopics") && filtros.disciplines.length === 0;
        return (
          <section key={chave} className="py-1">
            <button
              type="button"
              onClick={() => alternarSecao(chave)}
              aria-expanded={aberta}
              className="flex w-full items-center gap-2 py-2.5 text-left"
            >
              <span className={cn("flex-1 text-sm font-semibold", travada ? "text-slate-400" : "text-slate-800")}>{ROTULOS[chave]}</span>
              {qtd > 0 && (
                <span className="rounded-full bg-[#5f2ebe] px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums text-white">{qtd}</span>
              )}
              <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", aberta && "rotate-180")} />
            </button>
            {aberta && (
              <div className="pb-3">
                {carregando ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Carregando opções...
                  </div>
                ) : (
                  <ListaOpcoes
                    grupos={opcoesDe(chave, filtros)}
                    selecionados={filtros[chave]}
                    onAlternar={(v) => onAlternar(chave, v)}
                    onLimpar={() => onLimparChave(chave)}
                    vazio={dicaVazio(chave, filtros)}
                    alturaMax="max-h-64"
                  />
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
