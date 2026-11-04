import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const normalizar = (s: string) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

/**
 * Lista suspensa simples (sem Popover do Radix, que falha dentro de modais
 * neste projeto). Mostra as opções filtradas e, se o texto digitado não
 * existir, a opção de usar o novo nome.
 */
const ListaOpcoes: React.FC<{
  id: string;
  opcoes: string[];
  ativo: number;
  novo?: string;
  selecionadas?: string[];
  onEscolher: (valor: string) => void;
  onAtivo: (i: number) => void;
  vazio: string;
}> = ({ id, opcoes, ativo, novo, selecionadas = [], onEscolher, onAtivo, vazio }) => {
  const itens = novo ? [...opcoes, novo] : opcoes;
  const listaRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listaRef.current?.querySelector<HTMLElement>(`[data-i="${ativo}"]`)?.scrollIntoView({ block: "nearest" });
  }, [ativo]);

  return (
    <ul
      ref={listaRef}
      id={id}
      role="listbox"
      className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-auto rounded-lg border border-slate-200 bg-white py-1 text-sm shadow-lg"
    >
      {itens.length === 0 && <li className="px-3 py-2 text-slate-400">{vazio}</li>}
      {itens.map((op, i) => {
        const criar = novo !== undefined && i === itens.length - 1;
        return (
          <li
            key={`${op}-${i}`}
            data-i={i}
            role="option"
            aria-selected={i === ativo}
            // mousedown para escolher antes de o campo perder o foco
            onMouseDown={(e) => {
              e.preventDefault();
              onEscolher(op);
            }}
            onMouseEnter={() => onAtivo(i)}
            className={cn(
              "flex cursor-pointer items-center gap-2 px-3 py-1.5",
              i === ativo ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "text-slate-700",
              criar && "border-t border-slate-100"
            )}
          >
            {criar ? (
              <>
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">
                  Usar “<strong className="font-semibold">{op}</strong>”
                </span>
              </>
            ) : (
              <>
                <Check className={cn("h-3.5 w-3.5 shrink-0", selecionadas.includes(op) ? "opacity-100" : "opacity-0")} />
                <span className="truncate">{op}</span>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};

interface CampoComboProps {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  opcoes: string[];
  obrigatorio?: boolean;
  desabilitado?: boolean;
  placeholder?: string;
  dica?: string;
}

/** Campo de escolha única com busca; aceita um nome novo. */
export const CampoCombo: React.FC<CampoComboProps> = ({
  rotulo,
  valor,
  onChange,
  opcoes,
  obrigatorio,
  desabilitado,
  placeholder,
  dica,
}) => {
  const id = useId();
  const [texto, setTexto] = useState(valor);
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);

  useEffect(() => setTexto(valor), [valor]);

  const termo = normalizar(texto);
  const digitando = texto !== valor;
  const filtradas = useMemo(() => {
    const ordenadas = [...opcoes].sort((a, b) => a.localeCompare(b, "pt-BR"));
    return digitando && termo ? ordenadas.filter((o) => normalizar(o).includes(termo)) : ordenadas;
  }, [opcoes, termo, digitando]);
  const novo = texto.trim() && !opcoes.some((o) => normalizar(o) === termo) ? texto.trim() : undefined;
  const total = filtradas.length + (novo ? 1 : 0);

  const escolher = (v: string) => {
    onChange(v);
    setTexto(v);
    setAberto(false);
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        {rotulo}
        {obrigatorio && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          value={texto}
          disabled={desabilitado}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={aberto}
          aria-controls={`${id}-lista`}
          onChange={(e) => {
            setTexto(e.target.value);
            setAberto(true);
            setAtivo(0);
          }}
          onFocus={() => setAberto(true)}
          onBlur={() => {
            setAberto(false);
            // Sem escolher nada, volta ao valor salvo (apagar tudo limpa o campo)
            if (!texto.trim()) onChange("");
            else setTexto(valor);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setAberto(true);
              setAtivo((a) => Math.min(a + 1, total - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setAtivo((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              if (!aberto) return;
              e.preventDefault();
              const itens = novo ? [...filtradas, novo] : filtradas;
              if (itens[ativo]) escolher(itens[ativo]);
            } else if (e.key === "Escape") {
              setAberto(false);
              setTexto(valor);
            }
          }}
          className={cn(
            "h-9 w-full rounded-md border border-input bg-white pl-3 pr-8 text-sm text-slate-800 placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
          )}
        />
        {valor && !desabilitado ? (
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => {
              e.preventDefault();
              escolher("");
            }}
            className="absolute right-2 top-2 rounded p-0.5 text-slate-400 hover:text-slate-700"
            aria-label={`Limpar ${rotulo.toLowerCase()}`}
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronsUpDown className="pointer-events-none absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
        )}
        {aberto && !desabilitado && (
          <ListaOpcoes
            id={`${id}-lista`}
            opcoes={filtradas}
            ativo={ativo}
            novo={novo}
            selecionadas={valor ? [valor] : []}
            onEscolher={escolher}
            onAtivo={setAtivo}
            vazio="Digite para criar"
          />
        )}
      </div>
      {dica && <p className="text-[11px] text-slate-400">{dica}</p>}
    </div>
  );
};

interface CampoTopicosProps {
  valores: string[];
  onChange: (valores: string[]) => void;
  sugestoes: string[];
  outras: string[];
}

/** Tópicos da teoria: etiquetas com busca nas existentes e criação de novas. */
export const CampoTopicos: React.FC<CampoTopicosProps> = ({ valores, onChange, sugestoes, outras }) => {
  const id = useId();
  const [texto, setTexto] = useState("");
  const [aberto, setAberto] = useState(false);
  const [ativo, setAtivo] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const termo = normalizar(texto);
  const opcoes = useMemo(() => {
    // Primeiro os tópicos do mesmo assunto; ao buscar, todos os conhecidos
    const base = termo ? Array.from(new Set([...sugestoes, ...outras])) : sugestoes;
    return base
      .filter((o) => !valores.includes(o) && (!termo || normalizar(o).includes(termo)))
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .slice(0, 80);
  }, [sugestoes, outras, valores, termo]);
  const novo =
    texto.trim() && ![...sugestoes, ...outras, ...valores].some((o) => normalizar(o) === termo) ? texto.trim() : undefined;
  const total = opcoes.length + (novo ? 1 : 0);

  const adicionar = (v: string) => {
    const limpo = v.trim();
    if (limpo && !valores.includes(limpo)) onChange([...valores, limpo]);
    setTexto("");
    setAtivo(0);
    inputRef.current?.focus();
  };

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-slate-600">
        Tópicos
      </label>
      <div
        className="relative rounded-md border border-input bg-white px-1.5 py-1 focus-within:ring-2 focus-within:ring-[#5f2ebe]/30"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex flex-wrap items-center gap-1">
          {valores.map((v) => (
            <span
              key={v}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#5f2ebe]/10 py-0.5 pl-2 pr-1 text-xs text-[#4a2394]"
            >
              <span className="truncate">{v}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(valores.filter((x) => x !== v));
                }}
                className="rounded p-0.5 hover:bg-[#5f2ebe]/15"
                aria-label={`Remover ${v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            id={id}
            ref={inputRef}
            value={texto}
            autoComplete="off"
            role="combobox"
            aria-expanded={aberto}
            aria-controls={`${id}-lista`}
            placeholder={valores.length ? "" : "Buscar ou criar tópico"}
            onChange={(e) => {
              setTexto(e.target.value);
              setAberto(true);
              setAtivo(0);
            }}
            onFocus={() => setAberto(true)}
            onBlur={() => setAberto(false)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setAtivo((a) => Math.min(a + 1, total - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setAtivo((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const itens = novo ? [...opcoes, novo] : opcoes;
                if (aberto && itens[ativo]) adicionar(itens[ativo]);
                else if (texto.trim()) adicionar(texto);
              } else if (e.key === "Backspace" && !texto && valores.length) {
                onChange(valores.slice(0, -1));
              } else if (e.key === "Escape") {
                setAberto(false);
              }
            }}
            className="h-7 min-w-[8rem] flex-1 border-0 bg-transparent px-1 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />
        </div>
        {aberto && (opcoes.length > 0 || novo) && (
          <ListaOpcoes
            id={`${id}-lista`}
            opcoes={opcoes}
            ativo={ativo}
            novo={novo}
            onEscolher={adicionar}
            onAtivo={setAtivo}
            vazio=""
          />
        )}
      </div>
      <p className="text-[11px] text-slate-400">Enter adiciona. Os do mesmo assunto aparecem primeiro.</p>
    </div>
  );
};
