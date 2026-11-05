import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  CalendarDays,
  Flame,
  GraduationCap,
  Hourglass,
  MapPin,
  Search,
  SearchX,
  Trophy,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import AdBanner from "@/components/ads/AdBanner";
import { EstadoVazio, Painel, Segmentos, normalizar } from "@/components/course/ui";
import { concursosService } from "@/services/concursosService";
import { supabase } from "@/integrations/supabase/client";
import { Cargo, Concurso } from "@/types/concurso";
import { cn } from "@/lib/utils";

const LARGURA = "mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px]";
const POR_PAGINA = 20;
/** Um anúncio no meio da lista a cada tantos concursos */
const ANUNCIO_A_CADA = 8;
const LOTE_IDS = 150;

type Situacao = "todos" | "abertos" | "ultimos" | "breve";
type Ordem = "encerram" | "recentes" | "vagas" | "salario";
type Nivel = "Ensino Fundamental" | "Ensino Médio" | "Ensino Superior";

const NIVEIS: Array<{ valor: Nivel; rotulo: string }> = [
  { valor: "Ensino Fundamental", rotulo: "Fundamental" },
  { valor: "Ensino Médio", rotulo: "Médio" },
  { valor: "Ensino Superior", rotulo: "Superior" },
];

const NOMES_UF: Record<string, string> = {
  Nacional: "Nacional",
  Federal: "Federal",
  AC: "Acre",
  AL: "Alagoas",
  AP: "Amapá",
  AM: "Amazonas",
  BA: "Bahia",
  CE: "Ceará",
  DF: "Distrito Federal",
  ES: "Espírito Santo",
  GO: "Goiás",
  MA: "Maranhão",
  MT: "Mato Grosso",
  MS: "Mato Grosso do Sul",
  MG: "Minas Gerais",
  PA: "Pará",
  PB: "Paraíba",
  PR: "Paraná",
  PE: "Pernambuco",
  PI: "Piauí",
  RJ: "Rio de Janeiro",
  RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul",
  RO: "Rondônia",
  RR: "Roraima",
  SC: "Santa Catarina",
  SP: "São Paulo",
  SE: "Sergipe",
  TO: "Tocantins",
};

const REGIOES: Array<{ nome: string; ufs: string[] }> = [
  { nome: "Abrangência nacional", ufs: ["Nacional", "Federal"] },
  { nome: "Norte", ufs: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"] },
  { nome: "Nordeste", ufs: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"] },
  { nome: "Centro-Oeste", ufs: ["DF", "GO", "MT", "MS"] },
  { nome: "Sudeste", ufs: ["ES", "MG", "RJ", "SP"] },
  { nome: "Sul", ufs: ["PR", "RS", "SC"] },
];

const ORDENS: Array<{ valor: Ordem; rotulo: string }> = [
  { valor: "encerram", rotulo: "Encerram primeiro" },
  { valor: "recentes", rotulo: "Abertos há pouco" },
  { valor: "vagas", rotulo: "Mais vagas" },
  { valor: "salario", rotulo: "Maior salário" },
];

interface ItemConcurso extends Concurso {
  inicio: Date | null;
  fim: Date | null;
  prova: Date | null;
  /** Dias até o fim das inscrições (0 = hoje) */
  diasParaFim: number;
  /** Dias até abrir (só para "em breve") */
  diasParaInicio: number;
  situacao: Exclude<Situacao, "todos">;
  salarioMax: number;
  nomesCargos: string[];
  url: string;
  busca: string;
}

const plural = (n: number, um: string, varios: string) => `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;

/** "2026-11-05" ou timestamp → data local (new Date("2026-11-05") seria UTC e mostraria o dia anterior) */
const lerData = (valor?: string | null): Date | null => {
  if (!valor) return null;
  try {
    const d = parseISO(String(valor).slice(0, 10));
    return Number.isNaN(d.getTime()) ? null : startOfDay(d);
  } catch {
    return null;
  }
};

const nomeCargo = (c: Cargo) => (typeof c === "string" ? c : c?.nome || "").trim();

/** Maior valor em reais escrito no texto do salário ("R$ 3.000,00 a R$ 10.450,00" → 10450) */
const maiorValor = (texto: string) => {
  const numeros = (texto || "").match(/\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?|\d+(?:,\d{1,2})?/g) || [];
  return numeros.reduce((max, n) => Math.max(max, Number(n.replace(/\./g, "").replace(",", ".")) || 0), 0);
};

const reais = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: v % 1 ? 2 : 0 });

const dataCurta = (d: Date | null) => (d ? format(d, "dd/MM", { locale: ptBR }) : "");
const dataLonga = (d: Date | null) => (d ? format(d, "dd 'de' MMM yyyy", { locale: ptBR }) : "");

const prazoFim = (dias: number) => (dias <= 0 ? "Encerra hoje" : dias === 1 ? "Encerra amanhã" : `Encerra em ${dias} dias`);
const prazoInicio = (dias: number) => (dias <= 1 ? "Abre amanhã" : `Abre em ${dias} dias`);

/** Slug dos posts ligados aos concursos, em lotes (evita URL longa demais) */
const carregarSlugs = async (ids: string[]) => {
  const mapa = new Map<string, string>();
  const unicos = Array.from(new Set(ids.filter(Boolean)));
  for (let i = 0; i < unicos.length; i += LOTE_IDS) {
    const { data } = await supabase.from("blog_posts").select("id, slug").in("id", unicos.slice(i, i + LOTE_IDS));
    (data || []).forEach((p: { id: string; slug: string | null }) => p.slug && mapa.set(p.id, p.slug));
  }
  return mapa;
};

const montarItem = (c: Concurso, slugs: Map<string, string>, hoje: Date): ItemConcurso => {
  const inicio = lerData(c.dataInicioInscricao);
  const fim = lerData(c.dataFimInscricao);
  const diasParaFim = fim ? differenceInCalendarDays(fim, hoje) : 999;
  const diasParaInicio = inicio ? differenceInCalendarDays(inicio, hoje) : 0;
  const situacao = diasParaInicio > 0 ? "breve" : diasParaFim <= 7 ? "ultimos" : "abertos";
  const nomesCargos = (c.cargos || []).map(nomeCargo).filter(Boolean);
  const url = c.postId ? `/blog/${slugs.get(c.postId) || c.postId}` : `/concursos/${c.id}`;
  return {
    ...c,
    inicio,
    fim,
    prova: lerData(c.dataProva),
    diasParaFim,
    diasParaInicio,
    situacao,
    salarioMax: maiorValor(c.salario),
    nomesCargos,
    url,
    busca: normalizar(
      [c.titulo, c.salario, ...nomesCargos, ...(c.estados || []).map((uf) => `${uf} ${NOMES_UF[uf] || ""}`), ...(c.niveis || [])].join(" ")
    ),
  };
};

const Concursos = () => {
  const [params, setParams] = useSearchParams();
  const termoUrl = params.get("q") || "";
  const uf = params.get("uf") || "";
  const situacao = (["abertos", "ultimos", "breve"].includes(params.get("situacao") || "") ? params.get("situacao") : "todos") as Situacao;
  const ordem = (ORDENS.some((o) => o.valor === params.get("ordem")) ? params.get("ordem") : "encerram") as Ordem;

  const [busca, setBusca] = useState(termoUrl);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [limite, setLimite] = useState(POR_PAGINA);
  const [itens, setItens] = useState<ItemConcurso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [tentativa, setTentativa] = useState(0);

  const mudarParam = useCallback(
    (chave: string, valor: string) => {
      const p = new URLSearchParams(params);
      if (valor) p.set(chave, valor);
      else p.delete(chave);
      setParams(p, { replace: true });
    },
    [params, setParams]
  );

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
        const concursos = await concursosService.listarConcursos(true);
        let slugs = new Map<string, string>();
        try {
          slugs = await carregarSlugs(concursos.map((c) => c.postId || ""));
        } catch (e) {
          console.error("Erro ao buscar os posts dos concursos:", e);
        }
        const hoje = startOfDay(new Date());
        if (ativo) setItens(concursos.map((c) => montarItem(c, slugs, hoje)));
      } catch (e) {
        console.error("Erro ao carregar concursos:", e);
        if (ativo) setErro(true);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [tentativa]);

  // Contagem por UF (um concurso pode valer para vários estados)
  const porUf = useMemo(() => {
    const mapa = new Map<string, number>();
    itens.forEach((i) => (i.estados || []).forEach((e) => mapa.set(e, (mapa.get(e) || 0) + 1)));
    return mapa;
  }, [itens]);

  const regioes = useMemo(() => {
    const conhecidas = new Set(REGIOES.flatMap((r) => r.ufs));
    const outras = Array.from(porUf.keys()).filter((e) => !conhecidas.has(e)).sort();
    return [...REGIOES, { nome: "Outros", ufs: outras }]
      .map((r) => ({ ...r, ufs: r.ufs.filter((e) => porUf.has(e)) }))
      .filter((r) => r.ufs.length > 0);
  }, [porUf]);

  const resumo = useMemo(
    () => ({
      abertos: itens.filter((i) => i.situacao !== "breve").length,
      vagas: itens.reduce((s, i) => s + (Number(i.vagas) || 0), 0),
      ultimos: itens.filter((i) => i.situacao === "ultimos").length,
      breve: itens.filter((i) => i.situacao === "breve").length,
      maiorSalario: itens.reduce((m, i) => Math.max(m, i.salarioMax), 0),
    }),
    [itens]
  );

  const termo = normalizar(termoUrl);

  // Itens que passam pelos filtros, menos o de situação (para contar cada situação)
  const filtradosSemSituacao = useMemo(() => {
    const palavras = termo.split(/\s+/).filter(Boolean);
    return itens.filter(
      (i) =>
        (!uf || (i.estados || []).includes(uf as never)) &&
        (niveis.length === 0 || niveis.some((n) => (i.niveis || []).includes(n))) &&
        palavras.every((p) => i.busca.includes(p))
    );
  }, [itens, uf, niveis, termo]);

  const contagemSituacao = useMemo(() => {
    const c = { todos: filtradosSemSituacao.length, abertos: 0, ultimos: 0, breve: 0 };
    filtradosSemSituacao.forEach((i) => {
      if (i.situacao === "breve") c.breve++;
      else c.abertos++;
      if (i.situacao === "ultimos") c.ultimos++;
    });
    return c;
  }, [filtradosSemSituacao]);

  const visiveis = useMemo(() => {
    const lista = filtradosSemSituacao.filter(
      (i) => situacao === "todos" || (situacao === "abertos" ? i.situacao !== "breve" : i.situacao === situacao)
    );
    const porFim = (a: ItemConcurso, b: ItemConcurso) => {
      // Abertos primeiro (pelo prazo), depois os que ainda vão abrir
      const ga = a.situacao === "breve" ? 1 : 0;
      const gb = b.situacao === "breve" ? 1 : 0;
      return ga - gb || (ga ? a.diasParaInicio - b.diasParaInicio : a.diasParaFim - b.diasParaFim);
    };
    return [...lista].sort((a, b) => {
      if (ordem === "recentes") return (b.inicio?.getTime() || 0) - (a.inicio?.getTime() || 0) || porFim(a, b);
      if (ordem === "vagas") return (Number(b.vagas) || 0) - (Number(a.vagas) || 0) || porFim(a, b);
      if (ordem === "salario") return b.salarioMax - a.salarioMax || porFim(a, b);
      return porFim(a, b) || a.titulo.localeCompare(b.titulo, "pt-BR");
    });
  }, [filtradosSemSituacao, situacao, ordem]);

  useEffect(() => setLimite(POR_PAGINA), [uf, niveis, termo, situacao, ordem]);

  const alternarNivel = (n: Nivel) => setNiveis((atual) => (atual.includes(n) ? atual.filter((x) => x !== n) : [...atual, n]));
  const temFiltro = !!termo || !!uf || niveis.length > 0 || situacao !== "todos";
  const limparFiltros = () => {
    setBusca("");
    setNiveis([]);
    const p = new URLSearchParams(params);
    ["q", "uf", "situacao"].forEach((k) => p.delete(k));
    setParams(p, { replace: true });
  };
  const escolherUf = (valor: string) => {
    mudarParam("uf", valor === uf ? "" : valor);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const tituloLista = uf ? `Concursos em ${NOMES_UF[uf] || uf}` : "Todos os concursos";

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo com a busca */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className={cn(LARGURA, "relative grid gap-6 py-8 md:py-10 lg:grid-cols-[1fr_420px] lg:items-end")}>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Concursos</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Concursos com inscrições abertas</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-500">
                  Veja os prazos, as vagas e os salários de cada edital e não perca a data de inscrição.
                </p>

                <div className="relative mt-5 max-w-2xl">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Busque por órgão, cargo, estado ou salário"
                    aria-label="Buscar concursos"
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

              <div className="grid grid-cols-2 gap-2 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur sm:grid-cols-4 lg:grid-cols-2 lg:p-4">
                {[
                  { rotulo: "com inscrições abertas", valor: resumo.abertos.toLocaleString("pt-BR"), icone: Trophy },
                  { rotulo: "vagas somadas", valor: resumo.vagas.toLocaleString("pt-BR"), icone: Users },
                  { rotulo: "encerram em 7 dias", valor: resumo.ultimos.toLocaleString("pt-BR"), icone: Flame },
                  { rotulo: "maior salário", valor: resumo.maiorSalario ? reais(resumo.maiorSalario) : "—", icone: Wallet },
                ].map((m) => (
                  <div key={m.rotulo} className="min-w-0 rounded-xl p-1.5">
                    <m.icone className="h-4 w-4 text-[#5f2ebe]" />
                    <div className="mt-1.5 truncate text-lg font-bold tabular-nums text-slate-900 lg:text-xl">
                      {carregando ? <Skeleton className="h-7 w-14" /> : m.valor}
                    </div>
                    <div className="text-xs text-slate-500">{m.rotulo}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className={cn(LARGURA, "grid gap-6 py-6 lg:grid-cols-[280px_minmax(0,1fr)]")}>
            {/* Estados: lateral no computador, faixa rolável no celular */}
            <aside className="min-w-0">
              <div className="-mx-[10px] flex gap-2 overflow-x-auto px-[10px] pb-1 scrollbar-none md:-mx-[32px] md:px-[32px] lg:hidden">
                {[{ valor: "", rotulo: "Todos", total: itens.length }, ...regioes.flatMap((r) => r.ufs.map((e) => ({ valor: e, rotulo: e, total: porUf.get(e) || 0 })))].map(
                  (e) => {
                    const ativa = uf === e.valor;
                    return (
                      <button
                        key={e.valor || "todos"}
                        type="button"
                        onClick={() => escolherUf(e.valor)}
                        title={NOMES_UF[e.valor] || undefined}
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                          ativa ? "bg-[#5f2ebe] text-white shadow-sm" : "bg-white text-slate-600 ring-1 ring-slate-200"
                        )}
                      >
                        {e.rotulo}
                        <span className={cn("rounded-full px-1.5 text-[11px] tabular-nums", ativa ? "bg-white/20" : "bg-slate-100 text-slate-500")}>
                          {e.total}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>

              <Painel className="sticky top-4 hidden p-3 lg:block">
                <p className="mb-2 flex items-center gap-2 px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <MapPin className="h-3.5 w-3.5" />
                  Onde
                </p>
                {carregando ? (
                  <div className="space-y-2 px-2 py-1">
                    {[70, 55, 80, 60, 45, 65].map((w, i) => (
                      <Skeleton key={i} className="h-7" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                ) : (
                  <nav aria-label="Filtrar por estado" className="max-h-[calc(100vh-8rem)] space-y-3 overflow-y-auto pr-1">
                    <BotaoUf rotulo="Todo o Brasil" total={itens.length} ativa={!uf} onClick={() => escolherUf("")} />
                    {regioes.map((r) => (
                      <div key={r.nome}>
                        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{r.nome}</p>
                        <div className="space-y-0.5">
                          {r.ufs.map((e) => (
                            <BotaoUf
                              key={e}
                              sigla={e.length === 2 ? e : undefined}
                              rotulo={NOMES_UF[e] || e}
                              total={porUf.get(e) || 0}
                              ativa={uf === e}
                              onClick={() => escolherUf(e)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </nav>
                )}
              </Painel>
            </aside>

            <div className="min-w-0 space-y-5">
              {/* Barra de resultados */}
              <div className="space-y-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">{tituloLista}</h2>
                    <p className="text-sm text-slate-500">
                      {carregando ? "Carregando..." : plural(visiveis.length, "concurso encontrado", "concursos encontrados")}
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
                  <div className="flex items-center gap-2">
                    <label htmlFor="concursos-ordem" className="text-sm text-slate-500">
                      Ordenar
                    </label>
                    <select
                      id="concursos-ordem"
                      value={ordem}
                      onChange={(e) => mudarParam("ordem", e.target.value === "encerram" ? "" : e.target.value)}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]"
                    >
                      {ORDENS.map((o) => (
                        <option key={o.valor} value={o.valor}>
                          {o.rotulo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <Segmentos<Situacao>
                    valor={situacao}
                    onChange={(v) => mudarParam("situacao", v === "todos" ? "" : v)}
                    opcoes={[
                      { valor: "todos", rotulo: "Todos", contagem: carregando ? undefined : contagemSituacao.todos },
                      { valor: "abertos", rotulo: "Abertos", contagem: carregando ? undefined : contagemSituacao.abertos },
                      {
                        valor: "ultimos",
                        rotulo: (
                          <>
                            <Flame className="h-3.5 w-3.5 text-orange-500" /> Últimos dias
                          </>
                        ),
                        contagem: carregando ? undefined : contagemSituacao.ultimos,
                      },
                      { valor: "breve", rotulo: "Em breve", contagem: carregando ? undefined : contagemSituacao.breve },
                    ]}
                    className="bg-slate-200/60"
                  />
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Escolaridade">
                    <GraduationCap className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden />
                    {NIVEIS.map((n) => {
                      const ativo = niveis.includes(n.valor);
                      return (
                        <button
                          key={n.valor}
                          type="button"
                          aria-pressed={ativo}
                          onClick={() => alternarNivel(n.valor)}
                          title={`Só concursos de ${n.valor.toLowerCase()}`}
                          className={cn(
                            "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                            ativo
                              ? "bg-[#5f2ebe] text-white shadow-sm"
                              : "bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#5f2ebe] hover:ring-[#5f2ebe]/30"
                          )}
                        >
                          {n.rotulo}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Resultados */}
              {carregando ? (
                <div className="grid gap-3 xl:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Painel key={i} className="space-y-3 p-4">
                      <Skeleton className="h-5 w-28 rounded-full" />
                      <Skeleton className="h-5 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                      <div className="grid grid-cols-3 gap-2 pt-2">
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                        <Skeleton className="h-12" />
                      </div>
                      <Skeleton className="h-2 w-full" />
                    </Painel>
                  ))}
                </div>
              ) : erro ? (
                <EstadoVazio
                  icone={Trophy}
                  titulo="Não foi possível carregar os concursos"
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
                  icone={temFiltro ? SearchX : Trophy}
                  titulo={temFiltro ? "Nenhum concurso com esses filtros" : "Nenhum concurso com inscrições abertas agora"}
                  texto={
                    temFiltro
                      ? "Tente outra palavra, outro estado ou tire algum filtro."
                      : "Assim que novos editais forem publicados, eles aparecem aqui."
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
                  <div className="grid gap-3 xl:grid-cols-2">
                    {visiveis.slice(0, limite).map((item, i) => (
                      <React.Fragment key={item.id}>
                        <CartaoConcurso item={item} ufAtiva={uf} onUf={escolherUf} />
                        {(i + 1) % ANUNCIO_A_CADA === 0 && i + 1 < Math.min(limite, visiveis.length) && (
                          <AdBanner position="concursos_list" className="col-span-full rounded-lg" />
                        )}
                      </React.Fragment>
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
          </div>
        </main>
        <Footer />
      </div>
    </PublicLayout>
  );
};

const BotaoUf: React.FC<{ rotulo: string; sigla?: string; total: number; ativa: boolean; onClick: () => void }> = ({
  rotulo,
  sigla,
  total,
  ativa,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-current={ativa ? "true" : undefined}
    className={cn(
      "flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-sm transition-colors",
      ativa ? "bg-[#5f2ebe]/10 font-semibold text-[#5f2ebe]" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    )}
  >
    {sigla && (
      <span
        className={cn(
          "w-7 shrink-0 rounded-md py-0.5 text-center text-[10px] font-bold",
          ativa ? "bg-[#5f2ebe] text-white" : "bg-slate-100 text-slate-500"
        )}
      >
        {sigla}
      </span>
    )}
    <span className="min-w-0 flex-1 truncate">{rotulo}</span>
    <span className={cn("shrink-0 text-xs tabular-nums", ativa ? "text-[#5f2ebe]" : "text-slate-400")}>{total}</span>
  </button>
);

const TONS = {
  abertos: { rotulo: "Inscrições abertas", classe: "bg-emerald-50 text-emerald-700 ring-emerald-200", barra: "bg-emerald-500", icone: CalendarClock },
  ultimos: { rotulo: "Últimos dias", classe: "bg-orange-50 text-orange-700 ring-orange-200", barra: "bg-orange-500", icone: Flame },
  breve: { rotulo: "Em breve", classe: "bg-sky-50 text-sky-700 ring-sky-200", barra: "bg-sky-400", icone: Hourglass },
} as const;

const CartaoConcurso: React.FC<{ item: ItemConcurso; ufAtiva: string; onUf: (uf: string) => void }> = ({ item, ufAtiva, onUf }) => {
  const tom = TONS[item.situacao];
  const Icone = tom.icone;
  const vagas = Number(item.vagas) || 0;

  // Quanto do período de inscrição já passou
  let decorrido = 0;
  if (item.inicio && item.fim && item.situacao !== "breve") {
    const total = Math.max(1, differenceInCalendarDays(item.fim, item.inicio) + 1);
    decorrido = Math.min(100, Math.max(4, ((total - item.diasParaFim) / total) * 100));
  }
  const prazo = item.situacao === "breve" ? prazoInicio(item.diasParaInicio) : prazoFim(item.diasParaFim);
  const salarioTexto = item.salarioMax ? `até ${reais(item.salarioMax)}` : item.salario?.trim() || "A definir";
  const cargos = item.nomesCargos;

  return (
    <Painel className="group relative flex flex-col p-4 transition hover:-translate-y-0.5 hover:border-[#5f2ebe]/30 hover:shadow-md sm:p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1", tom.classe)}>
          <Icone className="h-3.5 w-3.5" />
          {tom.rotulo}
        </span>
        {item.prorrogado && (
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">Prorrogado</span>
        )}
        <div className="relative z-10 ml-auto flex flex-wrap justify-end gap-1">
          {(item.estados || []).slice(0, 4).map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => onUf(e)}
              title={`Ver concursos em ${NOMES_UF[e] || e}`}
              className={cn(
                "rounded-md px-1.5 py-0.5 text-[11px] font-bold transition-colors",
                ufAtiva === e ? "bg-[#5f2ebe] text-white" : "bg-slate-100 text-slate-500 hover:bg-[#5f2ebe]/10 hover:text-[#5f2ebe]"
              )}
            >
              {e}
            </button>
          ))}
          {(item.estados || []).length > 4 && (
            <span className="px-1 py-0.5 text-[11px] text-slate-400">+{item.estados.length - 4}</span>
          )}
        </div>
      </div>

      <Link to={item.url} className="mt-3 after:absolute after:inset-0 after:rounded-2xl focus:outline-none">
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-slate-900 group-hover:text-[#5f2ebe] md:text-[17px]">
          {item.titulo}
        </h3>
      </Link>

      {cargos.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-1" aria-label="Cargos">
          {cargos.slice(0, 3).map((c, i) => (
            <li key={`${c}-${i}`} className="max-w-full truncate rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200/80">
              {c}
            </li>
          ))}
          {cargos.length > 3 && (
            <li className="px-1 py-0.5 text-xs text-slate-400" title={cargos.slice(3).join(", ")}>
              +{cargos.length - 3} cargos
            </li>
          )}
        </ul>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-2">
        {[
          { icone: Users, rotulo: "Vagas", valor: vagas > 0 ? vagas.toLocaleString("pt-BR") : "Cadastro reserva" },
          { icone: Wallet, rotulo: "Salário", valor: salarioTexto },
          { icone: CalendarDays, rotulo: "Prova", valor: item.prova ? dataLonga(item.prova) : "A definir" },
        ].map((d) => (
          <div key={d.rotulo} className="min-w-0 rounded-xl bg-slate-50 px-2.5 py-2">
            <dt className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
              <d.icone className="h-3 w-3" />
              {d.rotulo}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-semibold text-slate-800" title={d.valor}>
              {d.valor}
            </dd>
          </div>
        ))}
      </dl>

      <div className="min-h-3 flex-1" aria-hidden />

      <div className="mt-4">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500">
            Inscrições {dataCurta(item.inicio)}
            {item.fim ? ` a ${dataCurta(item.fim)}` : ""}
          </span>
          <span
            className={cn(
              "font-semibold",
              item.situacao === "ultimos" ? "text-orange-600" : item.situacao === "breve" ? "text-sky-700" : "text-emerald-700"
            )}
          >
            {prazo}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden>
          <div className={cn("h-full rounded-full", tom.barra)} style={{ width: `${decorrido}%` }} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-slate-500">
          {(item.niveis || []).length > 0 ? (
            <>
              <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
              <span className="truncate">{item.niveis.map((n) => n.replace("Ensino ", "")).join(" · ")}</span>
            </>
          ) : (
            <>
              <Briefcase className="h-3.5 w-3.5 text-slate-400" />
              <span>{plural(cargos.length, "cargo", "cargos")}</span>
            </>
          )}
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#5f2ebe]">
          Ver detalhes
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Painel>
  );
};

export default Concursos;
