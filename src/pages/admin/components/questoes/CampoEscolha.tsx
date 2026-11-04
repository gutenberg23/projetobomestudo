import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { chave } from "./utils";

const LIMITE = 80;

interface BaseProps {
  id?: string;
  opcoes: string[];
  placeholder?: string;
  /** Deixa usar um valor que ainda não existe no banco. */
  permitirNovo?: boolean;
  /** Lista de valores a mostrar primeiro (ex.: assuntos da disciplina). */
  sugeridas?: string[];
  rotuloSugeridas?: string;
  invalido?: boolean;
  desativado?: boolean;
  className?: string;
}

function useFiltro(opcoes: string[], busca: string, sugeridas?: string[]) {
  return useMemo(() => {
    const termo = chave(busca);
    const filtra = (lista: string[]) => (termo ? lista.filter((o) => chave(o).includes(termo)) : lista);
    const sug = sugeridas?.length ? filtra(sugeridas) : [];
    const setSug = new Set(sug);
    const resto = filtra(opcoes).filter((o) => !setSug.has(o));
    const exato = [...sug, ...resto].some((o) => chave(o) === termo);
    return { sug: sug.slice(0, LIMITE), resto: resto.slice(0, LIMITE), mais: Math.max(0, resto.length - LIMITE), exato };
  }, [opcoes, busca, sugeridas]);
}

const Lista: React.FC<{
  busca: string;
  onBusca: (v: string) => void;
  placeholder?: string;
  sug: string[];
  resto: string[];
  mais: number;
  exato: boolean;
  rotuloSugeridas?: string;
  permitirNovo?: boolean;
  marcado: (v: string) => boolean;
  onEscolher: (v: string) => void;
}> = ({ busca, onBusca, placeholder, sug, resto, mais, exato, rotuloSugeridas, permitirNovo, marcado, onEscolher }) => (
  <Command shouldFilter={false}>
    <CommandInput value={busca} onValueChange={onBusca} placeholder={placeholder || "Buscar..."} />
    <CommandList className="max-h-72">
      <CommandEmpty>{permitirNovo ? "Digite para criar um novo valor." : "Nada encontrado."}</CommandEmpty>
      {permitirNovo && busca.trim() && !exato && (
        <CommandGroup>
          <CommandItem value={`__novo__${busca}`} onSelect={() => onEscolher(busca.trim())} className="text-[#5f2ebe]">
            <Plus className="mr-2 h-4 w-4" />
            Usar “{busca.trim()}”
          </CommandItem>
        </CommandGroup>
      )}
      {sug.length > 0 && (
        <CommandGroup heading={rotuloSugeridas || "Sugestões"}>
          {sug.map((o) => (
            <Item key={`s-${o}`} valor={o} marcado={marcado(o)} onEscolher={onEscolher} />
          ))}
        </CommandGroup>
      )}
      {resto.length > 0 && (
        <CommandGroup heading={sug.length ? "Todos" : undefined}>
          {resto.map((o) => (
            <Item key={o} valor={o} marcado={marcado(o)} onEscolher={onEscolher} />
          ))}
          {mais > 0 && <p className="px-2 py-1.5 text-xs text-slate-400">+{mais} — continue digitando para filtrar</p>}
        </CommandGroup>
      )}
    </CommandList>
  </Command>
);

const Item: React.FC<{ valor: string; marcado: boolean; onEscolher: (v: string) => void }> = ({ valor, marcado, onEscolher }) => (
  <CommandItem value={valor} onSelect={() => onEscolher(valor)}>
    <Check className={cn("mr-2 h-4 w-4 shrink-0 text-[#5f2ebe]", marcado ? "opacity-100" : "opacity-0")} />
    <span className="truncate">{valor}</span>
  </CommandItem>
);

const gatilho =
  "flex min-h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-left text-sm shadow-sm transition-colors hover:border-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

/* ------------------------------------------------------------------ único */

interface CampoEscolhaProps extends BaseProps {
  valor: string;
  onChange: (v: string) => void;
}

/** Campo de escolha com busca; aceita criar um valor novo. */
export const CampoEscolha: React.FC<CampoEscolhaProps> = ({
  id,
  valor,
  onChange,
  opcoes,
  placeholder,
  permitirNovo = true,
  sugeridas,
  rotuloSugeridas,
  invalido,
  desativado,
  className,
}) => {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const f = useFiltro(opcoes, busca, sugeridas);
  return (
    <Popover
      open={aberto}
      onOpenChange={(v) => {
        setAberto(v);
        if (!v) setBusca("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          disabled={desativado}
          aria-invalid={invalido || undefined}
          className={cn(gatilho, invalido && "border-red-300 ring-1 ring-red-200", className)}
        >
          <span className={cn("truncate", !valor && "text-slate-400")}>{valor || placeholder || "Selecionar"}</span>
          <span className="flex shrink-0 items-center gap-1">
            {valor && (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Limpar"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronsUpDown className="h-4 w-4 text-slate-400" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto w-[--radix-popover-trigger-width] min-w-[16rem] p-0" align="start">
        <Lista
          {...f}
          busca={busca}
          onBusca={setBusca}
          placeholder={placeholder}
          rotuloSugeridas={rotuloSugeridas}
          permitirNovo={permitirNovo}
          marcado={(v) => v === valor}
          onEscolher={(v) => {
            onChange(v);
            setAberto(false);
            setBusca("");
          }}
        />
      </PopoverContent>
    </Popover>
  );
};

/* -------------------------------------------------------------- múltiplo */

interface CampoEscolhaMultiplaProps extends BaseProps {
  valores: string[];
  onChange: (v: string[]) => void;
  /** Mostra os valores escolhidos como etiquetas abaixo do campo. */
  etiquetas?: boolean;
}

/** Vários valores com busca. Os escolhidos aparecem como etiquetas. */
export const CampoEscolhaMultipla: React.FC<CampoEscolhaMultiplaProps> = ({
  id,
  valores,
  onChange,
  opcoes,
  placeholder,
  permitirNovo = true,
  sugeridas,
  rotuloSugeridas,
  invalido,
  desativado,
  className,
  etiquetas = true,
}) => {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const f = useFiltro(opcoes, busca, sugeridas);
  const alternar = (v: string) => onChange(valores.includes(v) ? valores.filter((x) => x !== v) : [...valores, v]);

  return (
    <div className={cn("space-y-1.5", className)}>
      <Popover
        open={aberto}
        onOpenChange={(v) => {
          setAberto(v);
          if (!v) setBusca("");
        }}
      >
        <PopoverTrigger asChild>
          <button id={id} type="button" disabled={desativado} className={cn(gatilho, invalido && "border-red-300")}>
            <span className={cn("truncate", !valores.length && "text-slate-400")}>
              {valores.length === 0
                ? placeholder || "Selecionar"
                : etiquetas
                  ? `${valores.length} ${valores.length === 1 ? "selecionado" : "selecionados"}`
                  : valores.join(", ")}
            </span>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="pointer-events-auto w-[--radix-popover-trigger-width] min-w-[16rem] p-0" align="start">
          <Lista
            {...f}
            busca={busca}
            onBusca={setBusca}
            placeholder={placeholder}
            rotuloSugeridas={rotuloSugeridas}
            permitirNovo={permitirNovo}
            marcado={(v) => valores.includes(v)}
            onEscolher={(v) => {
              alternar(v);
              setBusca("");
            }}
          />
          {valores.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
              <span>{valores.length} {valores.length === 1 ? "selecionado" : "selecionados"}</span>
              <button type="button" className="font-medium text-[#5f2ebe] hover:underline" onClick={() => onChange([])}>
                Limpar
              </button>
            </div>
          )}
        </PopoverContent>
      </Popover>
      {etiquetas && valores.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {valores.map((v) => (
            <span
              key={v}
              className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#5f2ebe]/[0.07] py-0.5 pl-2 pr-1 text-xs text-[#4a2396]"
            >
              <span className="truncate">{v}</span>
              <button
                type="button"
                onClick={() => alternar(v)}
                className="rounded p-0.5 hover:bg-[#5f2ebe]/15"
                aria-label={`Remover ${v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------------- botões em pílula */

interface PilulasProps {
  opcoes: string[];
  valor: string;
  onChange: (v: string) => void;
  invalido?: boolean;
  /** Permite desmarcar clicando de novo. */
  desmarcavel?: boolean;
  rotulo: string;
}

/** Escolha única em botões, para listas curtas (dificuldade, nível). */
export const Pilulas: React.FC<PilulasProps> = ({ opcoes, valor, onChange, invalido, desmarcavel = true, rotulo }) => (
  <div role="radiogroup" aria-label={rotulo} className={cn("flex flex-wrap gap-1.5", invalido && "rounded-md ring-1 ring-red-200 ring-offset-2")}>
    {opcoes.map((o) => {
      const ativo = o === valor;
      return (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={ativo}
          onClick={() => onChange(ativo && desmarcavel ? "" : o)}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
            ativo
              ? "border-[#5f2ebe] bg-[#5f2ebe] text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
          )}
        >
          {o}
        </button>
      );
    })}
  </div>
);
