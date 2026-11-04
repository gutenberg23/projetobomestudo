import React, { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CursoResumo } from "@/services/editalAdminService";
import { chave } from "../questoes/utils";

interface SeletorCursoProps {
  id?: string;
  cursos: CursoResumo[];
  valor: string;
  onChange: (id: string) => void;
  /** Título do edital que já usa cada curso (para avisar antes de escolher). */
  ocupados: Record<string, string>;
  invalido?: boolean;
}

/** Escolha do curso pelo título, com busca. Mostra quais cursos já têm edital. */
export const SeletorCurso: React.FC<SeletorCursoProps> = ({ id, cursos, valor, onChange, ocupados, invalido }) => {
  const [aberto, setAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const atual = cursos.find((c) => c.id === valor);

  const lista = useMemo(() => {
    const termo = chave(busca);
    const filtrados = termo ? cursos.filter((c) => chave(c.titulo).includes(termo) || c.id === busca.trim()) : cursos;
    return filtrados.slice(0, 100);
  }, [cursos, busca]);

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
          aria-invalid={invalido || undefined}
          className={cn(
            "flex min-h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-sm hover:border-slate-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            invalido && "border-red-300 ring-1 ring-red-200"
          )}
        >
          <span className={cn("truncate", !atual && "text-slate-400")}>
            {atual ? atual.titulo || "(curso sem título)" : valor ? "Curso não encontrado" : "Escolha o curso"}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="pointer-events-auto w-[--radix-popover-trigger-width] min-w-[18rem] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput value={busca} onValueChange={setBusca} placeholder="Buscar curso..." />
          <CommandList className="max-h-80">
            <CommandEmpty>Nenhum curso encontrado.</CommandEmpty>
            <CommandGroup>
              {lista.map((c) => {
                const usado = ocupados[c.id];
                return (
                  <CommandItem
                    key={c.id}
                    value={c.id}
                    onSelect={() => {
                      onChange(c.id);
                      setAberto(false);
                      setBusca("");
                    }}
                    className="items-start"
                  >
                    <Check className={cn("mr-2 mt-0.5 h-4 w-4 shrink-0 text-[#5f2ebe]", c.id === valor ? "opacity-100" : "opacity-0")} />
                    <span className="min-w-0">
                      <span className="block truncate">{c.titulo || "(sem título)"}</span>
                      {usado && <span className="block truncate text-[11px] text-amber-600">Já tem o edital ativo “{usado}”</span>}
                    </span>
                  </CommandItem>
                );
              })}
              {cursos.length > lista.length && !busca && (
                <p className="px-2 py-1.5 text-xs text-slate-400">Digite para encontrar outros cursos</p>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
