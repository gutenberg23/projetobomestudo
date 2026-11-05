import React, { useEffect, useMemo, useState } from "react";
import { Check, FolderTree } from "lucide-react";
import { CampoBusca, CaixaSelecao, Etiqueta, normalizar } from "@/components/admin/ui/listagem";
import { cn } from "@/lib/utils";
import type { CursoOpcao, TopicoOpcao } from "./useFlashcardsAdmin";

/*
 * Seletores usados dentro de diálogos. São listas nativas (sem Popover/Command),
 * porque Popover dentro de Dialog não recebe cliques neste projeto.
 */

export const EscolherTopico: React.FC<{
  topicos: TopicoOpcao[];
  valor: string | null;
  onChange: (id: string | null) => void;
  cursosDoTopico: Record<string, string[]>;
  /** Texto do item "nenhum" (quando o tópico é opcional) */
  rotuloNenhum?: string;
}> = ({ topicos, valor, onChange, cursosDoTopico, rotuloNenhum }) => {
  const [busca, setBusca] = useState("");
  const [trocando, setTrocando] = useState(!valor);
  const escolhido = topicos.find((t) => t.id === valor) || null;

  // Valor definido de fora (ao abrir o diálogo): mostra o tópico escolhido
  useEffect(() => {
    if (valor) setTrocando(false);
  }, [valor]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const lista = termo ? topicos.filter((t) => normalizar(`${t.nome} ${t.disciplina} ${t.id}`).includes(termo)) : topicos;
    return lista.slice(0, 80);
  }, [topicos, busca]);

  if (escolhido && !trocando)
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[#5f2ebe]/30 bg-[#f8f5ff] px-3 py-2">
        <FolderTree className="h-4 w-4 shrink-0 text-[#5f2ebe]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800">{escolhido.nome}</p>
          <p className="truncate text-xs text-slate-500">
            {escolhido.disciplina || "Sem disciplina"} · usado em {(cursosDoTopico[escolhido.id] || []).length} curso(s)
          </p>
        </div>
        <button type="button" onClick={() => setTrocando(true)} className="shrink-0 text-xs font-semibold text-[#5f2ebe] hover:underline">
          Trocar
        </button>
      </div>
    );

  return (
    <div className="space-y-2">
      <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar tópico por nome, disciplina ou ID" className="sm:w-full" autoFocus={!!escolhido} />
      <ul className="max-h-56 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200" role="listbox" aria-label="Tópicos">
        {rotuloNenhum && !busca && (
          <li>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setTrocando(true);
              }}
              className={cn("flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50", !valor && "bg-[#f8f5ff] font-medium text-[#5f2ebe]")}
            >
              {!valor ? <Check className="h-4 w-4" /> : <span className="w-4" />}
              {rotuloNenhum}
            </button>
          </li>
        )}
        {filtrados.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              role="option"
              aria-selected={t.id === valor}
              onClick={() => {
                onChange(t.id);
                setTrocando(false);
                setBusca("");
              }}
              className={cn("flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-slate-50", t.id === valor && "bg-[#f8f5ff]")}
            >
              {t.id === valor ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#5f2ebe]" /> : <span className="w-4 shrink-0" />}
              <span className="min-w-0">
                <span className="block truncate text-sm text-slate-800">{t.nome}</span>
                <span className="block truncate text-xs text-slate-500">
                  {t.disciplina || "Sem disciplina"} · {(cursosDoTopico[t.id] || []).length} curso(s)
                </span>
              </span>
            </button>
          </li>
        ))}
        {filtrados.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">Nenhum tópico encontrado.</li>}
      </ul>
      {topicos.length > 80 && filtrados.length === 80 && <p className="text-xs text-slate-500">Mostrando 80 tópicos. Digite para encontrar outros.</p>}
    </div>
  );
};

export interface EscolhaCursos {
  /** true = todos os cursos que usam o tópico (cursos_ids vazio) */
  todos: boolean;
  ids: string[];
}

export const paraEscolha = (cursosIds: string[]): EscolhaCursos => ({ todos: cursosIds.length === 0, ids: cursosIds });
export const deEscolha = (e: EscolhaCursos) => (e.todos ? [] : e.ids);

export const EscolherCursos: React.FC<{
  cursos: CursoOpcao[];
  valor: EscolhaCursos;
  onChange: (v: EscolhaCursos) => void;
  /** Cursos que usam o(s) tópico(s) escolhido(s): aparecem primeiro */
  destaque?: string[];
  nome: string;
}> = ({ cursos, valor, onChange, destaque = [], nome }) => {
  const [busca, setBusca] = useState("");
  const usam = useMemo(() => new Set(destaque), [destaque]);

  const ordenados = useMemo(() => {
    const termo = normalizar(busca.trim());
    return cursos
      .filter((c) => !termo || normalizar(c.titulo).includes(termo))
      .sort((a, b) => Number(usam.has(b.id)) - Number(usam.has(a.id)) || a.titulo.localeCompare(b.titulo, "pt-BR"));
  }, [cursos, busca, usam]);

  const alternar = (id: string) =>
    onChange({ todos: false, ids: valor.ids.includes(id) ? valor.ids.filter((x) => x !== id) : [...valor.ids, id] });

  return (
    <div className="space-y-2">
      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 has-[:checked]:border-[#5f2ebe]/40 has-[:checked]:bg-[#f8f5ff]">
        <input type="radio" name={nome} checked={valor.todos} onChange={() => onChange({ ...valor, todos: true })} className="mt-1 accent-[#5f2ebe]" />
        <span>
          <span className="block text-sm font-medium text-slate-800">Todos os cursos que usam o tópico</span>
          <span className="block text-xs text-slate-500">
            {destaque.length ? `Hoje: ${destaque.length} curso(s). Cursos novos com o tópico também recebem.` : "O tópico ainda não está em nenhum curso."}
          </span>
        </span>
      </label>
      <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 px-3 py-2 has-[:checked]:border-[#5f2ebe]/40 has-[:checked]:bg-[#f8f5ff]">
        <input type="radio" name={nome} checked={!valor.todos} onChange={() => onChange({ ...valor, todos: false })} className="mt-1 accent-[#5f2ebe]" />
        <span>
          <span className="block text-sm font-medium text-slate-800">Só nos cursos escolhidos</span>
          <span className="block text-xs text-slate-500">O cartão só aparece se o curso também tiver o tópico.</span>
        </span>
      </label>

      {!valor.todos && (
        <div className="space-y-2 pl-1">
          <div className="flex items-center gap-2">
            <CampoBusca valor={busca} onChange={setBusca} placeholder="Buscar curso" className="flex-1 sm:w-auto" />
            <span className="shrink-0 text-xs tabular-nums text-slate-500">{valor.ids.length} escolhido(s)</span>
          </div>
          <ul className="max-h-52 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
            {ordenados.map((c) => (
              <li key={c.id}>
                <label className="flex cursor-pointer items-center gap-2.5 px-3 py-2 hover:bg-slate-50">
                  <CaixaSelecao marcado={valor.ids.includes(c.id)} onChange={() => alternar(c.id)} rotulo={c.titulo} />
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{c.titulo}</span>
                  {usam.has(c.id) ? <Etiqueta tom="verde">usa o tópico</Etiqueta> : <Etiqueta tom="cinza">sem o tópico</Etiqueta>}
                </label>
              </li>
            ))}
            {ordenados.length === 0 && <li className="px-3 py-6 text-center text-sm text-slate-500">Nenhum curso encontrado.</li>}
          </ul>
        </div>
      )}
    </div>
  );
};
