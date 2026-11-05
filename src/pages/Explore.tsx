import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, BookOpen, GraduationCap, Layers, PlayCircle, Search, SearchX, Star, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import AdBanner from "@/components/ads/AdBanner";
import { Carregando, EstadoVazio, Painel, Segmentos, normalizar } from "@/components/course/ui";
import { supabase } from "@/integrations/supabase/client";
import { aulasDaDisciplinaNoCurso, lerAulasPorDisciplina } from "@/utils/aulasDoCurso";
import { useAuth } from "@/hooks/useAuth";
import { generateFriendlyUrl } from "@/utils/slug-utils";
import { ActivityLogger } from "@/services/activity-logger";
import { cn } from "@/lib/utils";
import { useExigirLogin } from "@/components/auth/LoginObrigatorio";

type Tipo = "cursos" | "disciplinas";
type Ordem = "az" | "recentes" | "aulas";

interface ItemExplorar {
  id: string;
  tipo: Tipo;
  titulo: string;
  /** Cargo (curso) ou descrição (disciplina) */
  subtitulo: string;
  banca: string;
  disciplinas: number;
  aulas: number;
  topicos: number;
  criadoEm: string;
  url: string;
  favorito: boolean;
}

const POR_PAGINA = 24;
const LOTE = 150;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Linha = Record<string, any>;

/** Busca as aulas em lotes (uma consulta por lote, e não uma por disciplina). */
async function topicosPorAula(ids: string[]) {
  const mapa = new Map<string, number>();
  const unicos = Array.from(new Set(ids.filter(Boolean)));
  for (let i = 0; i < unicos.length; i += LOTE) {
    const { data, error } = await supabase.from("aulas").select("id, topicos_ids").in("id", unicos.slice(i, i + LOTE));
    if (error) throw error;
    (data || []).forEach((a: Linha) => mapa.set(a.id, a.topicos_ids?.length || 0));
  }
  return mapa;
}

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const Explore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const exigirLogin = useExigirLogin();
  const [params, setParams] = useSearchParams();
  const tipo: Tipo = params.get("tipo") === "disciplinas" ? "disciplinas" : "cursos";
  const termoUrl = params.get("q") || params.get("s") || "";

  const [busca, setBusca] = useState(termoUrl);
  const [ordem, setOrdem] = useState<Ordem>("az");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [banca, setBanca] = useState("");
  const [limite, setLimite] = useState(POR_PAGINA);
  const [itens, setItens] = useState<ItemExplorar[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  // Mantém o campo em dia quando a URL muda (ex.: busca feita no cabeçalho)
  useEffect(() => setBusca((atual) => (atual.trim() === termoUrl.trim() ? atual : termoUrl)), [termoUrl]);

  // Busca enquanto digita, guardando o termo na URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (busca.trim() === termoUrl.trim()) return;
      const p = new URLSearchParams(params);
      p.delete("s");
      if (busca.trim()) p.set("q", busca.trim());
      else p.delete("q");
      setParams(p, { replace: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro(false);
      try {
        const [cursosRes, disciplinasRes] = await Promise.all([
          supabase.from("cursos").select("*"),
          supabase.from("disciplinas").select("*"),
        ]);
        if (cursosRes.error) throw cursosRes.error;
        if (disciplinasRes.error) throw disciplinasRes.error;
        const cursos = (cursosRes.data || []) as Linha[];
        const todasDisciplinas = (disciplinasRes.data || []) as Linha[];
        const aulasDe = new Map(todasDisciplinas.map((d) => [d.id, (d.aulas_ids || []) as string[]]));
        // Disciplinas unificadas em outra não aparecem na lista
        const disciplinas = todasDisciplinas.filter((d) => !d.unificada_em);

        let favCursos: string[] = [];
        let favDisciplinas: string[] = [];
        if (user) {
          const { data } = await supabase.from("profiles").select("cursos_favoritos, disciplinas_favoritos").eq("id", user.id).single();
          favCursos = data?.cursos_favoritos || [];
          favDisciplinas = data?.disciplinas_favoritos || [];
        }

        const topicos = await topicosPorAula(todasDisciplinas.flatMap((d) => d.aulas_ids || []));
        const porDisciplina = new Map<string, { aulas: number; topicos: number }>();
        disciplinas.forEach((d) => {
          const aulas: string[] = d.aulas_ids || [];
          porDisciplina.set(d.id, { aulas: aulas.length, topicos: aulas.reduce((s, a) => s + (topicos.get(a) || 0), 0) });
        });

        const listaCursos: ItemExplorar[] = cursos.map((c) => {
          const ids: string[] = c.disciplinas_ids || [];
          // Só as aulas escolhidas para o curso em cada disciplina
          const selecao = lerAulasPorDisciplina(c.aulas_por_disciplina);
          const aulasCurso = ids.map((id) => aulasDaDisciplinaNoCurso(aulasDe.get(id), selecao, id));
          const somaAulas = aulasCurso.reduce((s, l) => s + l.length, 0);
          const somaTopicos = aulasCurso.reduce((s, l) => s + l.reduce((t, a) => t + (topicos.get(a) || 0), 0), 0);
          return {
            id: c.id,
            tipo: "cursos",
            titulo: c.titulo,
            subtitulo: c.descricao || "",
            banca: "",
            disciplinas: ids.length,
            aulas: somaAulas || c.aulas_ids?.length || 0,
            topicos: somaTopicos || c.topicos_ids?.length || 0,
            criadoEm: c.created_at || "",
            url: `/course/${generateFriendlyUrl(c.titulo, c.id)}`,
            favorito: favCursos.includes(c.id),
          };
        });

        const listaDisciplinas: ItemExplorar[] = disciplinas.map((d) => ({
          id: d.id,
          tipo: "disciplinas",
          titulo: d.titulo,
          subtitulo: d.descricao || "",
          banca: (d.banca || "").trim(),
          disciplinas: 0,
          aulas: porDisciplina.get(d.id)?.aulas || 0,
          topicos: porDisciplina.get(d.id)?.topicos || 0,
          criadoEm: d.created_at || "",
          url: `/course/${generateFriendlyUrl(d.titulo, d.id)}`,
          favorito: favDisciplinas.includes(d.id),
        }));

        if (ativo) setItens([...listaCursos, ...listaDisciplinas]);
      } catch (e) {
        console.error("Erro ao carregar o explorar:", e);
        if (ativo) setErro(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [user]);

  const trocarTipo = (t: Tipo) => {
    const p = new URLSearchParams(params);
    if (t === "disciplinas") p.set("tipo", t);
    else p.delete("tipo");
    setParams(p, { replace: true });
    setBanca("");
    setLimite(POR_PAGINA);
  };

  const doTipo = useMemo(() => itens.filter((i) => i.tipo === tipo), [itens, tipo]);
  const contagem = useMemo(
    () => ({
      cursos: itens.filter((i) => i.tipo === "cursos").length,
      disciplinas: itens.filter((i) => i.tipo === "disciplinas").length,
      favoritos: doTipo.filter((i) => i.favorito).length,
    }),
    [itens, doTipo]
  );

  const bancas = useMemo(() => {
    const c = new Map<string, number>();
    itens.filter((i) => i.tipo === "disciplinas" && i.banca).forEach((i) => c.set(i.banca, (c.get(i.banca) || 0) + 1));
    return Array.from(c.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [itens]);

  const termo = normalizar(termoUrl);
  const visiveis = useMemo(() => {
    const lista = doTipo.filter(
      (i) =>
        (!soFavoritos || i.favorito) &&
        (!banca || i.banca === banca) &&
        (!termo || normalizar(`${i.titulo} ${i.subtitulo} ${i.banca}`).includes(termo))
    );
    const ordenada = [...lista];
    if (ordem === "az") ordenada.sort((a, b) => a.titulo.localeCompare(b.titulo, "pt-BR"));
    if (ordem === "recentes") ordenada.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
    if (ordem === "aulas") ordenada.sort((a, b) => b.aulas - a.aulas || a.titulo.localeCompare(b.titulo, "pt-BR"));
    return ordenada;
  }, [doTipo, soFavoritos, banca, termo, ordem]);

  useEffect(() => setLimite(POR_PAGINA), [termo, soFavoritos, banca, ordem]);

  const alternarFavorito = async (item: ItemExplorar) => {
    if (!user) {
      exigirLogin({ motivo: "salvar seus favoritos" });
      return;
    }
    const coluna = item.tipo === "cursos" ? "cursos_favoritos" : "disciplinas_favoritos";
    const novo = !item.favorito;
    setItens((p) => p.map((i) => (i.id === item.id && i.tipo === item.tipo ? { ...i, favorito: novo } : i)));
    try {
      const { data: perfil, error: erroPerfil } = await supabase.from("profiles").select(coluna).eq("id", user.id).single();
      if (erroPerfil) throw erroPerfil;
      const atuais: string[] = (perfil as Linha)?.[coluna] || [];
      const lista = novo ? Array.from(new Set([...atuais, item.id])) : atuais.filter((id) => id !== item.id);
      const { error } = await supabase.from("profiles").update({ [coluna]: lista }).eq("id", user.id);
      if (error) throw error;
      if (novo) {
        if (item.tipo === "cursos") await ActivityLogger.logCourseFavorite(item.id, item.titulo);
        else await ActivityLogger.logSubjectFavorite(item.id, item.titulo);
      }
      toast.success(novo ? "Adicionado aos favoritos" : "Removido dos favoritos");
    } catch (e) {
      console.error("Erro ao atualizar favoritos:", e);
      setItens((p) => p.map((i) => (i.id === item.id && i.tipo === item.tipo ? { ...i, favorito: !novo } : i)));
      toast.error("Não foi possível atualizar os favoritos.");
    }
  };

  const limparFiltros = () => {
    setBusca("");
    setSoFavoritos(false);
    setBanca("");
  };
  const temFiltro = !!termo || soFavoritos || !!banca;

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo com a busca */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className="container relative mx-auto px-4 py-8 md:py-10">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Explorar</p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Encontre o que estudar</h1>
              <p className="mt-1 max-w-xl text-sm text-slate-500">
                Cursos completos para o seu concurso ou disciplinas avulsas para reforçar uma matéria.
              </p>

              <div className="relative mt-5 max-w-2xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder={tipo === "cursos" ? "Busque por concurso, órgão ou cargo" : "Busque por disciplina ou banca"}
                  aria-label="Buscar"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-11 text-base text-slate-800 shadow-sm outline-none transition focus:border-[#5f2ebe] focus:ring-4 focus:ring-[#5f2ebe]/10"
                />
                {busca && (
                  <button
                    type="button"
                    aria-label="Limpar busca"
                    onClick={() => setBusca("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="mt-4">
                <Segmentos<Tipo>
                  valor={tipo}
                  onChange={trocarTipo}
                  opcoes={[
                    {
                      valor: "cursos",
                      rotulo: (
                        <>
                          <GraduationCap className="h-4 w-4" /> Cursos
                        </>
                      ),
                      contagem: carregando ? undefined : contagem.cursos,
                    },
                    {
                      valor: "disciplinas",
                      rotulo: (
                        <>
                          <BookOpen className="h-4 w-4" /> Disciplinas
                        </>
                      ),
                      contagem: carregando ? undefined : contagem.disciplinas,
                    },
                  ]}
                />
              </div>
            </div>
          </section>

          <div className="container mx-auto space-y-5 px-4 py-6">
            <AdBanner position="explore_top" className="rounded-lg" />

            {/* Filtros */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSoFavoritos((v) => !v)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    soFavoritos ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  )}
                >
                  <Star className={cn("h-3.5 w-3.5", soFavoritos && "fill-current")} />
                  Favoritos
                  {user && !carregando && <span className="tabular-nums opacity-80">{contagem.favoritos}</span>}
                </button>
                {tipo === "disciplinas" && bancas.length > 0 && (
                  <select
                    value={banca}
                    onChange={(e) => setBanca(e.target.value)}
                    aria-label="Filtrar por banca"
                    className="h-9 max-w-[220px] rounded-full border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]"
                  >
                    <option value="">Todas as bancas</option>
                    {bancas.map(([b, n]) => (
                      <option key={b} value={b}>
                        {b} ({n})
                      </option>
                    ))}
                  </select>
                )}
                {temFiltro && (
                  <button type="button" onClick={limparFiltros} className="px-1 text-sm font-medium text-[#5f2ebe] hover:underline">
                    Limpar filtros
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {!carregando && <span className="tabular-nums">{plural(visiveis.length, "resultado", "resultados")}</span>}
                <span className="text-slate-300">·</span>
                <label htmlFor="explore-ordem" className="sr-only">
                  Ordenar
                </label>
                <select
                  id="explore-ordem"
                  value={ordem}
                  onChange={(e) => setOrdem(e.target.value as Ordem)}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]"
                >
                  <option value="az">Nome (A–Z)</option>
                  <option value="recentes">Mais recentes</option>
                  <option value="aulas">Mais aulas</option>
                </select>
              </div>
            </div>

            {carregando ? (
              <Carregando texto="Carregando cursos e disciplinas..." />
            ) : erro ? (
              <EstadoVazio icone={SearchX} titulo="Não foi possível carregar" texto="Verifique sua conexão e recarregue a página." />
            ) : visiveis.length === 0 ? (
              <EstadoVazio
                icone={soFavoritos && !termo ? Star : SearchX}
                titulo={
                  termo
                    ? `Nada encontrado para "${termoUrl}"`
                    : soFavoritos
                      ? "Você ainda não tem favoritos aqui"
                      : tipo === "cursos"
                        ? "Nenhum curso disponível"
                        : "Nenhuma disciplina disponível"
                }
                texto={
                  termo
                    ? "Tente um termo mais curto, sem siglas, ou procure na outra aba."
                    : soFavoritos
                      ? "Toque na estrela de um curso ou disciplina para guardá-lo aqui e em Meus cursos."
                      : undefined
                }
                acao={
                  temFiltro ? (
                    <button
                      type="button"
                      onClick={limparFiltros}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Limpar filtros
                    </button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {visiveis.slice(0, limite).map((item) => (
                    <CartaoItem
                      key={`${item.tipo}-${item.id}`}
                      item={item}
                      onFavoritar={() => alternarFavorito(item)}
                      onAbrir={(e) => {
                        // Visitante: mostra o popup e, depois de entrar, abre o curso/disciplina
                        if (user) return;
                        e.preventDefault();
                        exigirLogin({
                          motivo: item.tipo === "cursos" ? "acessar este curso" : "acessar esta disciplina",
                          aoEntrar: () => navigate(item.url),
                        });
                      }}
                    />
                  ))}
                </div>
                {visiveis.length > limite && (
                  <div className="flex justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setLimite((l) => l + POR_PAGINA)}
                      className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                    >
                      Mostrar mais ({visiveis.length - limite} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

const CartaoItem: React.FC<{ item: ItemExplorar; onFavoritar: () => void; onAbrir: (e: React.MouseEvent) => void }> = ({ item, onFavoritar, onAbrir }) => {
  const Icone = item.tipo === "cursos" ? GraduationCap : BookOpen;
  const detalhes =
    item.tipo === "cursos"
      ? [plural(item.disciplinas, "disciplina", "disciplinas"), plural(item.aulas, "aula", "aulas")]
      : [plural(item.aulas, "aula", "aulas"), plural(item.topicos, "tópico", "tópicos")];
  return (
    <Painel className="group relative flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-[#5f2ebe]/30 hover:shadow-md">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            item.tipo === "cursos" ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-[#ea2be2]/10 text-[#c41fbd]"
          )}
        >
          <Icone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 pr-8">
          <Link to={item.url} onClick={onAbrir} className="after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
            <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-[#5f2ebe]">{item.titulo}</h3>
          </Link>
          {(item.subtitulo || item.banca) && (
            <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
              {item.tipo === "disciplinas" && item.banca ? item.banca : item.subtitulo}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onFavoritar}
        aria-pressed={item.favorito}
        aria-label={item.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        title={item.favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        className={cn(
          "absolute right-3 top-3 z-10 rounded-lg p-1.5 transition-colors",
          item.favorito ? "text-amber-500 hover:bg-amber-50" : "text-slate-300 hover:bg-slate-100 hover:text-slate-500"
        )}
      >
        <Star className={cn("h-5 w-5", item.favorito && "fill-current")} />
      </button>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Layers className="h-3.5 w-3.5 text-slate-400" />
            {detalhes[0]}
          </span>
          <span className="inline-flex items-center gap-1">
            <PlayCircle className="h-3.5 w-3.5 text-slate-400" />
            {detalhes[1]}
          </span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#5f2ebe]">
          {item.tipo === "cursos" ? "Ver curso" : "Estudar"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Painel>
  );
};

export default Explore;
