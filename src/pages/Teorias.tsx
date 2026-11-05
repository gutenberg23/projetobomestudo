import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileQuestion,
  Highlighter,
  Layers,
  Library,
  Map as MapIcon,
  RotateCcw,
  Search,
  SearchX,
  Users,
  Video,
  X,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { EstadoVazio, Painel, Segmentos, normalizar } from "@/components/course/ui";
import { contarGrifos, lerRecentes } from "@/components/teorias/recentes";
import { supabase } from "@/integrations/supabase/client";
import { teoriaPath } from "@/utils/teoriaUrl";
import { cn } from "@/lib/utils";

interface TeoriaLista {
  id: string;
  slug?: string | null;
  titulo: string;
  disciplina_id: string;
  assunto_id: string;
  topicos_ids: string[] | null;
  professor_id?: string | null;
  created_at: string;
  updated_at: string;
  questoes_filtros?: Record<string, unknown> | null;
  questoes_link?: string | null;
  videoaulas?: string[] | null;
  mapas_mentais?: string[] | null;
}

interface ItemTeoria extends TeoriaLista {
  professor: string;
  temVideo: boolean;
  temMapa: boolean;
  temQuestoes: boolean;
  busca: string;
}

type Ordem = "az" | "recentes";
type Recurso = "video" | "mapa" | "questoes";

const POR_PAGINA = 24;
const COLUNAS =
  "id, slug, titulo, disciplina_id, assunto_id, topicos_ids, professor_id, created_at, updated_at, questoes_filtros, questoes_link, videoaulas, mapas_mentais";
const LARGURA = "mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px]";

const RECURSOS: Array<{ valor: Recurso; rotulo: string; icone: React.ElementType }> = [
  { valor: "video", rotulo: "Videoaula", icone: Video },
  { valor: "mapa", rotulo: "Mapa mental", icone: MapIcon },
  { valor: "questoes", rotulo: "Questões", icone: FileQuestion },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

const temFiltrosQuestoes = (f?: Record<string, unknown> | null) =>
  !!f && Object.values(f).some((v) => Array.isArray(v) && v.length > 0);

const haQuanto = (data: string) => {
  try {
    return formatDistanceToNow(new Date(data), { locale: ptBR, addSuffix: true });
  } catch {
    return "";
  }
};

/** Busca as teorias publicadas sem o texto da aula (mais leve). */
const carregarTeorias = async (): Promise<TeoriaLista[]> => {
  const consulta = (colunas: string) =>
    db.from("teorias").select(colunas).eq("status", "published").order("titulo", { ascending: true });
  let { data, error } = await consulta(COLUNAS);
  // Banco sem alguma coluna nova (ex.: slug): cai para todas as colunas
  if (error) ({ data, error } = await consulta("*"));
  if (error) throw error;
  return (data || []) as TeoriaLista[];
};

const Teorias = () => {
  const [params, setParams] = useSearchParams();
  const disciplina = params.get("disciplina") || "";
  const termoUrl = params.get("q") || "";
  const ordem: Ordem = params.get("ordem") === "recentes" ? "recentes" : "az";

  const [busca, setBusca] = useState(termoUrl);
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [limite, setLimite] = useState(POR_PAGINA);
  const [itens, setItens] = useState<ItemTeoria[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);
  const [grifos, setGrifos] = useState<Record<string, number>>({});

  const mudarParam = useCallback(
    (chave: string, valor: string) => {
      const p = new URLSearchParams(params);
      if (valor) p.set(chave, valor);
      else p.delete(chave);
      setParams(p, { replace: true });
    },
    [params, setParams]
  );

  // Mantém o campo em dia se a URL mudar por fora
  useEffect(() => setBusca((atual) => (atual.trim() === termoUrl.trim() ? atual : termoUrl)), [termoUrl]);

  // Busca enquanto digita, guardando o termo na URL
  useEffect(() => {
    const t = setTimeout(() => {
      if (busca.trim() !== termoUrl.trim()) mudarParam("q", busca.trim());
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca]);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      setErro(false);
      try {
        const [teorias, profRes] = await Promise.all([carregarTeorias(), supabase.from("professores").select("id, nome_completo")]);
        const nomes = new Map<string, string>((profRes.data || []).map((p: { id: string; nome_completo: string }) => [p.id, p.nome_completo]));
        const lista: ItemTeoria[] = teorias.map((t) => {
          const professor = (t.professor_id && nomes.get(t.professor_id)) || "";
          return {
            ...t,
            professor,
            temVideo: (t.videoaulas?.length || 0) > 0,
            temMapa: (t.mapas_mentais?.length || 0) > 0,
            temQuestoes: temFiltrosQuestoes(t.questoes_filtros) || !!t.questoes_link,
            busca: normalizar([t.titulo, t.assunto_id, t.disciplina_id, professor, ...(t.topicos_ids || [])].join(" ")),
          };
        });
        if (!ativo) return;
        setItens(lista);
        setGrifos(contarGrifos(lista.map((i) => i.id)));
      } catch (e) {
        console.error("Erro ao carregar teorias:", e);
        if (ativo) setErro(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  // Disciplinas com a quantidade de teorias
  const disciplinas = useMemo(() => {
    const mapa = new Map<string, number>();
    itens.forEach((i) => {
      const nome = i.disciplina_id || "Sem disciplina";
      mapa.set(nome, (mapa.get(nome) || 0) + 1);
    });
    return Array.from(mapa, ([nome, total]) => ({ nome, total })).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
  }, [itens]);

  const totalProfessores = useMemo(() => new Set(itens.map((i) => i.professor).filter(Boolean)).size, [itens]);

  const termo = normalizar(termoUrl);
  const visiveis = useMemo(() => {
    const palavras = termo.split(/\s+/).filter(Boolean);
    const lista = itens.filter(
      (i) =>
        (!disciplina || (i.disciplina_id || "Sem disciplina") === disciplina) &&
        palavras.every((p) => i.busca.includes(p)) &&
        recursos.every((r) => (r === "video" ? i.temVideo : r === "mapa" ? i.temMapa : i.temQuestoes))
    );
    return lista.sort((a, b) =>
      ordem === "recentes"
        ? new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime()
        : (a.assunto_id || "").localeCompare(b.assunto_id || "", "pt-BR") || a.titulo.localeCompare(b.titulo, "pt-BR")
    );
  }, [itens, disciplina, termo, recursos, ordem]);

  useEffect(() => setLimite(POR_PAGINA), [disciplina, termo, recursos, ordem]);

  // Agrupa por assunto quando uma disciplina está escolhida e a ordem é A–Z
  const agrupar = !!disciplina && ordem === "az";
  const grupos = useMemo(() => {
    if (!agrupar) return [];
    const mapa = new Map<string, ItemTeoria[]>();
    visiveis.slice(0, limite).forEach((i) => {
      const chave = i.assunto_id || "Outros assuntos";
      mapa.set(chave, [...(mapa.get(chave) || []), i]);
    });
    return Array.from(mapa);
  }, [agrupar, visiveis, limite]);

  const recentes = useMemo(() => {
    if (!itens.length) return [];
    const porId = new Map(itens.map((i) => [i.id, i]));
    return lerRecentes()
      .map((r) => ({ item: porId.get(r.id), em: r.em }))
      .filter((r): r is { item: ItemTeoria; em: number } => !!r.item)
      .slice(0, 3);
  }, [itens]);

  const alternarRecurso = (r: Recurso) => setRecursos((atual) => (atual.includes(r) ? atual.filter((x) => x !== r) : [...atual, r]));
  const temFiltro = !!termo || !!disciplina || recursos.length > 0;
  const limparFiltros = () => {
    setBusca("");
    setRecursos([]);
    const p = new URLSearchParams(params);
    p.delete("q");
    p.delete("disciplina");
    setParams(p, { replace: true });
  };
  const escolherDisciplina = (nome: string) => {
    mudarParam("disciplina", nome);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mostrarRecentes = !carregando && !erro && !temFiltro && recentes.length > 0;

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo com a busca */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className={cn(LARGURA, "relative grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_340px] lg:items-end")}>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Teorias</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Aulas em texto, direto ao ponto</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-500">
                  Leia a teoria de cada assunto do edital, grife o que importa e treine com questões e videoaulas no mesmo lugar.
                </p>

                <div className="relative mt-5 max-w-2xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Busque por assunto, tópico, disciplina ou professor"
                    aria-label="Buscar teorias"
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
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur lg:p-4">
                {[
                  { rotulo: "teorias", valor: itens.length, icone: BookOpen },
                  { rotulo: "disciplinas", valor: disciplinas.length, icone: Library },
                  { rotulo: "professores", valor: totalProfessores, icone: Users },
                ].map((m) => (
                  <div key={m.rotulo} className="min-w-0">
                    <m.icone className="h-4 w-4 text-[#5f2ebe]" />
                    <div className="mt-1.5 text-xl font-bold tabular-nums text-slate-900 lg:text-2xl">
                      {carregando ? <Skeleton className="h-7 w-10" /> : m.valor}
                    </div>
                    <div className="text-xs text-slate-500">{m.rotulo}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className={cn(LARGURA, "grid gap-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)]")}>
            {/* Disciplinas: lateral no computador, faixa rolável no celular */}
            <aside className="min-w-0">
              <div className="-mx-[10px] flex gap-2 overflow-x-auto px-[10px] pb-1 scrollbar-none md:-mx-[32px] md:px-[32px] lg:hidden">
                {[{ nome: "", total: itens.length }, ...disciplinas].map((d) => {
                  const ativa = disciplina === d.nome;
                  return (
                    <button
                      key={d.nome || "todas"}
                      type="button"
                      onClick={() => escolherDisciplina(d.nome)}
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                        ativa ? "bg-[#5f2ebe] text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200"
                      )}
                    >
                      {d.nome || "Todas"}
                      <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", ativa ? "bg-white/20" : "bg-slate-100 text-slate-500")}>
                        {d.total}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Painel className="sticky top-4 hidden p-3 lg:block">
                <p className="mb-2 flex items-center gap-2 px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <Layers className="h-3.5 w-3.5" />
                  Disciplinas
                </p>
                {carregando ? (
                  <div className="space-y-2 px-2 py-1">
                    {[70, 55, 80, 60, 45].map((w, i) => (
                      <Skeleton key={i} className="h-7" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : (
                  <nav aria-label="Filtrar por disciplina" className="max-h-[calc(100vh-8rem)] space-y-0.5 overflow-y-auto pr-1">
                    {[{ nome: "", total: itens.length }, ...disciplinas].map((d) => {
                      const ativa = disciplina === d.nome;
                      return (
                        <button
                          key={d.nome || "todas"}
                          type="button"
                          onClick={() => escolherDisciplina(d.nome)}
                          aria-current={ativa ? "true" : undefined}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                            ativa ? "bg-[#5f2ebe]/10 font-semibold text-[#5f2ebe]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate">{d.nome || "Todas as disciplinas"}</span>
                          <span className={cn("shrink-0 text-xs tabular-nums", ativa ? "text-[#5f2ebe]" : "text-slate-400")}>{d.total}</span>
                        </button>
                      );
                    })}
                  </nav>
                )}
              </Painel>
            </aside>

            <div className="min-w-0 space-y-5">
              {/* Continue de onde parou */}
              {mostrarRecentes && (
                <section aria-labelledby="teorias-recentes">
                  <h2 id="teorias-recentes" className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <RotateCcw className="h-4 w-4 text-[#5f2ebe]" />
                    Continue de onde parou
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {recentes.map(({ item, em }) => (
                      <Link
                        key={item.id}
                        to={teoriaPath(item)}
                        className="group flex items-center gap-3 rounded-2xl border border-[#5f2ebe]/15 bg-gradient-to-br from-white to-[#5f2ebe]/[0.04] p-3 shadow-[0_1px_3px_rgba(16,24,40,0.05)] transition hover:border-[#5f2ebe]/35"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe] text-white">
                          <BookOpen className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-[#5f2ebe]">{item.titulo}</span>
                          <span className="block truncate text-xs text-slate-500">
                            Lida {haQuanto(new Date(em).toISOString())}
                            {grifos[item.id] ? ` · ${plural(grifos[item.id], "grifo", "grifos")}` : ""}
                          </span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-[#5f2ebe] transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Barra de resultados */}
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">{disciplina || "Todas as teorias"}</h2>
                  <p className="text-sm text-slate-500">
                    {carregando ? "Carregando..." : plural(visiveis.length, "teoria encontrada", "teorias encontradas")}
                    {temFiltro && !carregando && (
                      <>
                        {" · "}
                        <button type="button" onClick={limparFiltros} className="font-medium text-[#5f2ebe] hover:underline">
                          Limpar filtros
                        </button>
                      </>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {RECURSOS.map((r) => {
                    const ativo = recursos.includes(r.valor);
                    return (
                      <button
                        key={r.valor}
                        type="button"
                        aria-pressed={ativo}
                        onClick={() => alternarRecurso(r.valor)}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                          ativo
                            ? "bg-[#5f2ebe] text-white shadow-sm"
                            : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#5f2ebe] hover:ring-[#5f2ebe]/30"
                        )}
                        title={`Só teorias com ${r.rotulo.toLowerCase()}`}
                      >
                        <r.icone className="h-3.5 w-3.5" />
                        {r.rotulo}
                      </button>
                    );
                  })}
                  <Segmentos<Ordem>
                    valor={ordem}
                    onChange={(v) => mudarParam("ordem", v === "az" ? "" : v)}
                    opcoes={[
                      { valor: "az", rotulo: "A–Z" },
                      { valor: "recentes", rotulo: "Recentes" },
                    ]}
                    className="bg-slate-200/60"
                  />
                </div>
              </div>

              {/* Resultados */}
              {carregando ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Painel key={i} className="space-y-3 p-4">
                      <Skeleton className="h-5 w-24 rounded-full" />
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                      <Skeleton className="mt-4 h-8 w-full" />
                    </Painel>
                  ))}
                </div>
              ) : erro ? (
                <EstadoVazio
                  icone={BookOpen}
                  titulo="Não foi possível carregar as teorias"
                  texto="Verifique sua conexão e tente de novo."
                  acao={
                    <button
                      type="button"
                      onClick={() => setTentativa((t) => t + 1)}
                      className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                    >
                      Tentar de novo
                    </button>
                  }
                />
              ) : visiveis.length === 0 ? (
                <EstadoVazio
                  icone={temFiltro ? SearchX : BookOpen}
                  titulo={temFiltro ? "Nenhuma teoria com esses filtros" : "Ainda não há teorias publicadas"}
                  texto={temFiltro ? "Tente outra palavra ou tire algum filtro." : "Assim que a equipe publicar as primeiras teorias, elas aparecem aqui."}
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
                  {agrupar ? (
                    <div className="space-y-6">
                      {grupos.map(([assunto, lista]) => (
                        <section key={assunto}>
                          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#5f2ebe] to-[#ea2be2]" aria-hidden />
                            {assunto}
                            <span className="text-xs font-normal text-slate-400">{lista.length}</span>
                          </h3>
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {lista.map((item) => (
                              <CartaoTeoria key={item.id} item={item} grifos={grifos[item.id]} mostrarDisciplina={false} mostrarAssunto={false} />
                            ))}
                          </div>
                        </section>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {visiveis.slice(0, limite).map((item) => (
                        <CartaoTeoria key={item.id} item={item} grifos={grifos[item.id]} mostrarDisciplina={!disciplina} />
                      ))}
                    </div>
                  )}
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
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

const CartaoTeoria: React.FC<{ item: ItemTeoria; grifos?: number; mostrarDisciplina: boolean; mostrarAssunto?: boolean }> = ({
  item,
  grifos,
  mostrarDisciplina,
  mostrarAssunto = true,
}) => {
  const topicos = item.topicos_ids || [];
  const recursos = [
    item.temVideo && { icone: Video, rotulo: "Tem videoaula", cor: "text-red-500" },
    item.temMapa && { icone: MapIcon, rotulo: "Tem mapa mental", cor: "text-amber-500" },
    item.temQuestoes && { icone: FileQuestion, rotulo: "Tem questões", cor: "text-emerald-600" },
  ].filter(Boolean) as Array<{ icone: React.ElementType; rotulo: string; cor: string }>;

  return (
    <Painel className="group relative flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-[#5f2ebe]/30 hover:shadow-md">
      {mostrarDisciplina && item.disciplina_id && (
        <span className="truncate pr-14 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{item.disciplina_id}</span>
      )}
      {mostrarAssunto && item.assunto_id && (
        <span className="mt-1 inline-flex max-w-full self-start truncate rounded-full bg-[#5f2ebe]/10 px-2.5 py-0.5 text-xs font-semibold text-[#5f2ebe]">
          {item.assunto_id}
        </span>
      )}

      {grifos ? (
        <span
          className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700"
          title="Trechos que você grifou nesta teoria"
        >
          <Highlighter className="h-3 w-3" />
          {grifos}
        </span>
      ) : null}

      <Link to={teoriaPath(item)} className="mt-2 after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
        <h3 className="line-clamp-2 font-semibold leading-snug text-slate-900 group-hover:text-[#5f2ebe]">{item.titulo}</h3>
      </Link>

      {topicos.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1" aria-label="Tópicos do edital">
          {topicos.slice(0, 2).map((t) => (
            <li key={t} className="max-w-full truncate rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200/80">
              {t}
            </li>
          ))}
          {topicos.length > 2 && <li className="px-1 py-0.5 text-[11px] text-slate-400">+{topicos.length - 2}</li>}
        </ul>
      )}

      <div className="min-h-4 flex-1" aria-hidden />
      <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 items-center gap-2 text-xs text-slate-500">
          {item.professor ? (
            <>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5f2ebe] to-[#ea2be2] text-[10px] font-bold text-white">
                {iniciais(item.professor)}
              </span>
              <span className="truncate">{item.professor}</span>
            </>
          ) : (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {haQuanto(item.updated_at || item.created_at)}
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {recursos.map((r) => (
            <span key={r.rotulo} title={r.rotulo} aria-label={r.rotulo} className={r.cor}>
              <r.icone className="h-4 w-4" />
            </span>
          ))}
          <ArrowRight className="h-4 w-4 text-[#5f2ebe] transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Painel>
  );
};

export default Teorias;
