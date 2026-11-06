import React, { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, GraduationCap, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { generateFriendlyUrl } from "@/utils/slug-utils";
import { CardLateral } from "./CardLateral";

interface CursoOpcao {
  id: string;
  titulo: string;
  cargo: string;
}

interface FormularioCursosProps {
  selecionados: string[];
  onChange: (ids: string[]) => void;
  /** Título do post, usado para sugerir cursos */
  titulo: string;
}

const normalizar = (t: string) =>
  t
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();

// Palavras que não ajudam a achar o curso certo pelo título do post
const IGNORAR = new Set([
  "concurso", "concursos", "edital", "publico", "publica", "para", "com", "das", "dos", "de", "do", "da",
  "vagas", "vaga", "inscricoes", "inscricao", "salario", "salarios", "ate", "nivel", "medio", "superior",
  "abre", "abertas", "sai", "saiu", "novo", "nova", "oferta", "ofertas", "cargo", "cargos", "prova", "provas",
  "2024", "2025", "2026", "2027", "mil", "reais", "the", "and", "por", "sem", "seu", "sua", "mais",
]);

const palavras = (t: string) => normalizar(t).split(/[^a-z0-9]+/).filter((p) => p.length >= 3 && !IGNORAR.has(p));

/**
 * Cursos divulgados no fim do post: um botão por cargo.
 * Lista com busca embutida (sem popover: dentro do admin ele perde os cliques).
 */
export const FormularioCursos: React.FC<FormularioCursosProps> = ({ selecionados, onChange, titulo }) => {
  const [cursos, setCursos] = useState<CursoOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [semColuna, setSemColuna] = useState(false);

  useEffect(() => {
    let vivo = true;
    Promise.all([
      supabase.from("cursos").select("id, titulo, descricao").order("titulo"),
      supabase.from("blog_posts").select("cursos_ids").limit(1),
    ]).then(([{ data }, { error: erroColuna }]) => {
      if (!vivo) return;
      setCursos((data || []).map((c) => ({ id: c.id, titulo: c.titulo || "Curso sem título", cargo: (c.descricao || "").trim() })));
      setSemColuna(!!erroColuna);
      setCarregando(false);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const porId = useMemo(() => new Map(cursos.map((c) => [c.id, c])), [cursos]);
  const escolhidos = selecionados.map((id) => porId.get(id) || { id, titulo: "Curso removido", cargo: "" });

  const resultados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const livres = cursos.filter((c) => !selecionados.includes(c.id));
    if (termo) return livres.filter((c) => normalizar(`${c.titulo} ${c.cargo}`).includes(termo)).slice(0, 8);
    // Sem busca: sugere pelo título do post
    const chaves = palavras(titulo);
    if (!chaves.length) return [];
    return livres
      .map((c) => {
        const doCurso = new Set(palavras(`${c.titulo} ${c.cargo}`));
        return { c, pontos: chaves.filter((p) => doCurso.has(p)).length };
      })
      .filter((x) => x.pontos > 0)
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 5)
      .map((x) => x.c);
  }, [busca, cursos, selecionados, titulo]);

  const mover = (i: number, d: -1 | 1) => {
    const lista = [...selecionados];
    [lista[i], lista[i + d]] = [lista[i + d], lista[i]];
    onChange(lista);
  };

  return (
    <CardLateral
      titulo="Cursos do concurso"
      descricao="No fim do post aparece um convite para estudar grátis, com um botão por cargo."
      icone={<GraduationCap className="h-4 w-4 text-slate-400" />}
    >
      {semColuna && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Falta rodar a migration <code className="font-mono">20251117000000_blog_posts_cursos.sql</code> no SQL Editor. Até lá, os
          cursos escolhidos não são salvos.
        </p>
      )}

      {escolhidos.length > 0 && (
        <ol className="space-y-1.5">
          {escolhidos.map((c, i) => (
            <li key={c.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#5f2ebe] text-[11px] font-semibold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800" title={c.cargo || c.titulo}>
                  {c.cargo || c.titulo}
                </p>
                <p className="truncate text-[11px] text-slate-500" title={c.titulo}>
                  {c.cargo ? c.titulo : <span className="text-amber-600">Sem cargo: o botão mostra o título do curso</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center">
                <a
                  href={`/course/${generateFriendlyUrl(c.titulo, c.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700"
                  title="Abrir curso"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {escolhidos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => mover(i, -1)}
                      disabled={i === 0}
                      className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30"
                      title="Subir"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => mover(i, 1)}
                      disabled={i === escolhidos.length - 1}
                      className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-30"
                      title="Descer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => onChange(selecionados.filter((id) => id !== c.id))}
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  title="Remover"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => {
            // Enter adiciona o primeiro resultado em vez de enviar o formulário
            if (e.key === "Enter") {
              e.preventDefault();
              if (resultados[0]) {
                onChange([...selecionados, resultados[0].id]);
                setBusca("");
              }
            }
          }}
          placeholder={carregando ? "Carregando cursos..." : "Buscar curso ou cargo"}
          disabled={carregando}
          className="h-9 pl-8"
          aria-label="Buscar curso para vincular"
        />
      </div>

      {!carregando && (busca.trim() || resultados.length > 0) && (
        <div className="space-y-1">
          {!busca.trim() && <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">Sugestões pelo título</p>}
          {resultados.length === 0 ? (
            <p className="px-1 text-xs text-slate-500">Nenhum curso encontrado.</p>
          ) : (
            <ul className="max-h-56 space-y-0.5 overflow-y-auto">
              {resultados.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange([...selecionados, c.id]);
                      setBusca("");
                    }}
                    className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-[#f4effd]"
                  >
                    <Plus className="h-3.5 w-3.5 shrink-0 text-slate-400 group-hover:text-[#5f2ebe]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-slate-700">{c.titulo}</span>
                      {c.cargo && <span className="block truncate text-[11px] text-slate-500">Cargo: {c.cargo}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!carregando && escolhidos.length === 0 && !busca.trim() && resultados.length === 0 && (
        <p className="text-xs text-slate-500">Nenhum curso vinculado. Busque acima para adicionar.</p>
      )}
    </CardLateral>
  );
};
