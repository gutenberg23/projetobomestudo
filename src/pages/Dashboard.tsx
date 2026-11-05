import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  Check,
  ChevronRight,
  ClipboardList,
  Flame,
  ListChecks,
  RotateCcw,
  Target,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import AdBanner from "@/components/ads/AdBanner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BarraProgresso, EstadoVazio, Metrica, Painel, Segmentos, tomAproveitamento } from "@/components/course/ui";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useDesempenho, type Contagem, type NoDisciplina, type PontoGrafico } from "@/components/dashboard/useDesempenho";

type Periodo = "7" | "30" | "90" | "365";
type OrdemDisc = "total" | "pior" | "nome";

const PERIODOS: Array<{ valor: Periodo; rotulo: string; extenso: string }> = [
  { valor: "7", rotulo: "7 dias", extenso: "nos últimos 7 dias" },
  { valor: "30", rotulo: "30 dias", extenso: "nos últimos 30 dias" },
  { valor: "90", rotulo: "90 dias", extenso: "nos últimos 90 dias" },
  { valor: "365", rotulo: "1 ano", extenso: "nos últimos 12 meses" },
];

/** Meta de aproveitamento usada nas cores (verde a partir de 70%). */
const META = 70;

const fmt = (n: number) => n.toLocaleString("pt-BR");

const lerPeriodo = (): Periodo => {
  try {
    const v = localStorage.getItem("dashboard_periodo") as Periodo;
    return PERIODOS.some((p) => p.valor === v) ? v : "30";
  } catch {
    return "30";
  }
};

const linkQuestoes = (disciplina: string, assunto?: string, situacao?: "erradas") => {
  const p = new URLSearchParams();
  if (disciplina && disciplina !== "Sem disciplina") p.set("disciplines", JSON.stringify([disciplina]));
  if (assunto && assunto !== "Sem assunto") p.set("topics", JSON.stringify([assunto]));
  if (situacao) p.set("status", situacao);
  return `/questions?${p.toString()}`;
};

/** Variação em relação ao período anterior. */
const Variacao: React.FC<{ atual: number; anterior: number; sufixo?: string; pontos?: boolean }> = ({ atual, anterior, sufixo = "", pontos }) => {
  if (!anterior && !atual) return <span className="text-slate-400">sem dados no período anterior</span>;
  const dif = pontos ? atual - anterior : anterior ? Math.round(((atual - anterior) / anterior) * 100) : 100;
  if (!anterior && !pontos) return <span className="text-slate-400">nada no período anterior</span>;
  if (dif === 0) return <span className="text-slate-400">igual ao período anterior</span>;
  const sobe = dif > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-medium", sobe ? "text-emerald-600" : "text-red-500")}>
      {sobe ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {sobe ? "+" : ""}
      {dif}
      {pontos ? " p.p." : "%"}
      {sufixo}
      <span className="ml-1 font-normal text-slate-400">vs. anterior</span>
    </span>
  );
};

/** Anel de aproveitamento. */
const Anel: React.FC<{ valor: number; total: number }> = ({ valor, total }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  const tom = tomAproveitamento(valor, META, total);
  const cor = total === 0 ? "#cbd5e1" : valor >= META ? "#10b981" : valor >= META - 15 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative mx-auto h-36 w-36">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke={cor}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, valor) / 100)}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold tabular-nums", tom.texto)}>{valor}%</span>
        <span className="text-xs text-slate-500">de acerto</span>
      </div>
    </div>
  );
};

const DicaGrafico: React.FC<{ active?: boolean; payload?: Array<{ payload: PontoGrafico }> }> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const total = p.acertos + p.erros;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold capitalize text-slate-900">{p.rotuloLongo}</p>
      {total === 0 ? (
        <p className="text-slate-500">Nenhuma questão</p>
      ) : (
        <>
          <p className="text-slate-600">
            <strong className="tabular-nums text-slate-900">{fmt(total)}</strong> {total === 1 ? "questão" : "questões"} ·{" "}
            {Math.round((p.acertos / total) * 100)}% de acerto
          </p>
          <p className="mt-1 flex gap-3">
            <span className="text-emerald-600">● {fmt(p.acertos)} acertos</span>
            <span className="text-red-500">● {fmt(p.erros)} erros</span>
          </p>
        </>
      )}
    </div>
  );
};

const Numeros: React.FC<{ c: Contagem; className?: string }> = ({ c, className }) => (
  <div className={cn("flex items-center gap-3 text-xs tabular-nums text-slate-500", className)}>
    <span className="hidden sm:inline" title="Resolvidas">
      {fmt(c.total)}
    </span>
    <span className="flex items-center gap-0.5 text-emerald-600" title="Acertos">
      <Check className="h-3 w-3" />
      {fmt(c.acertos)}
    </span>
    <span className="flex items-center gap-0.5 text-red-500" title="Erros">
      <X className="h-3 w-3" />
      {fmt(c.erros)}
    </span>
  </div>
);

const Percentual: React.FC<{ c: Contagem; largura?: string }> = ({ c, largura = "w-20 sm:w-28" }) => {
  const tom = tomAproveitamento(c.aproveitamento, META, c.total);
  return (
    <div className={cn("flex shrink-0 items-center gap-2", largura)}>
      <BarraProgresso valor={c.aproveitamento} corClasse={tom.barra} className="h-1.5 flex-1" marca={META} />
      <span className={cn("w-9 text-right text-xs font-bold tabular-nums", tom.texto)}>{c.aproveitamento}%</span>
    </div>
  );
};

/** Linha de disciplina com assuntos e tópicos que abrem dentro. */
const LinhaDisciplina: React.FC<{ d: NoDisciplina; maior: number }> = ({ d, maior }) => {
  const [aberta, setAberta] = useState(false);
  const [assuntoAberto, setAssuntoAberto] = useState<string | null>(null);
  return (
    <li>
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        aria-expanded={aberta}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/80"
      >
        <ChevronRight className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", aberta && "rotate-90")} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900" title={d.nome}>
            {d.nome}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 w-24 overflow-hidden rounded-full bg-slate-100 sm:w-40" title={`${fmt(d.total)} resolvidas`}>
              <div className="h-full rounded-full bg-[#5f2ebe]/40" style={{ width: `${(d.total / maior) * 100}%` }} />
            </div>
            <span className="text-xs tabular-nums text-slate-400">
              {fmt(d.total)} {d.total === 1 ? "questão" : "questões"}
            </span>
          </div>
        </div>
        <Numeros c={d} className="hidden md:flex" />
        <Percentual c={d} />
      </button>
      {aberta && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-2 py-2 sm:px-4">
          <ul className="space-y-1">
            {d.assuntos.map((a) => {
              const chave = a.nome;
              const abertoA = assuntoAberto === chave;
              const temTopicos = a.topicos.length > 1 || (a.topicos[0] && a.topicos[0].nome !== "Sem tópico");
              return (
                <li key={chave} className="rounded-xl bg-white ring-1 ring-slate-200/70">
                  <div className="flex items-center gap-2 px-3 py-2">
                    <button
                      type="button"
                      onClick={() => temTopicos && setAssuntoAberto(abertoA ? null : chave)}
                      className={cn("flex min-w-0 flex-1 items-center gap-2 text-left", !temTopicos && "cursor-default")}
                      aria-expanded={temTopicos ? abertoA : undefined}
                    >
                      {temTopicos ? (
                        <ChevronRight className={cn("h-3.5 w-3.5 shrink-0 text-slate-400 transition-transform", abertoA && "rotate-90")} />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}
                      <span className="truncate text-sm text-slate-700" title={a.nome}>
                        {a.nome}
                      </span>
                    </button>
                    <Numeros c={a} className="hidden sm:flex" />
                    <Percentual c={a} largura="w-20 sm:w-24" />
                    <Link
                      to={linkQuestoes(d.nome, a.nome)}
                      title="Treinar este assunto"
                      className="hidden rounded-lg px-2 py-1 text-xs font-semibold text-[#5f2ebe] hover:bg-[#5f2ebe]/10 sm:inline"
                    >
                      Treinar
                    </Link>
                  </div>
                  {abertoA && (
                    <ul className="border-t border-slate-100 py-1">
                      {a.topicos.map((t) => (
                        <li key={t.nome} className="flex items-center gap-2 py-1.5 pl-9 pr-3">
                          <span className="min-w-0 flex-1 truncate text-xs text-slate-600" title={t.nome}>
                            {t.nome}
                          </span>
                          <Numeros c={t} className="hidden sm:flex" />
                          <Percentual c={t} largura="w-20 sm:w-24" />
                          <span className="hidden w-[52px] sm:inline" />
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex justify-end px-1 pt-2">
            <Link to={linkQuestoes(d.nome)} className="text-xs font-semibold text-[#5f2ebe] hover:underline">
              Resolver questões de {d.nome} →
            </Link>
          </div>
        </div>
      )}
    </li>
  );
};

const Carregando = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-[104px] rounded-2xl" />
      ))}
    </div>
    <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
      <Skeleton className="h-[340px] rounded-2xl" />
      <Skeleton className="h-[340px] rounded-2xl" />
    </div>
    <Skeleton className="h-64 rounded-2xl" />
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [periodo, setPeriodoEstado] = useState<Periodo>(lerPeriodo);
  const [ordem, setOrdem] = useState<OrdemDisc>("total");
  const [confirmar, setConfirmar] = useState(false);
  const [apagando, setApagando] = useState(false);
  const dias = Number(periodo);
  const d = useDesempenho(user?.id, dias);
  const extenso = PERIODOS.find((p) => p.valor === periodo)!.extenso;

  const setPeriodo = (p: Periodo) => {
    setPeriodoEstado(p);
    try {
      localStorage.setItem("dashboard_periodo", p);
    } catch {
      /* sem armazenamento */
    }
  };

  const disciplinas = useMemo(() => {
    const l = [...d.arvore];
    if (ordem === "total") l.sort((a, b) => b.total - a.total);
    if (ordem === "pior") l.sort((a, b) => a.aproveitamento - b.aproveitamento || b.total - a.total);
    if (ordem === "nome") l.sort((a, b) => a.nome.localeCompare(b.nome));
    return l;
  }, [d.arvore, ordem]);
  const maior = Math.max(1, ...disciplinas.map((x) => x.total));

  /** Assuntos com pelo menos 5 questões e abaixo da meta, do pior para o melhor. */
  const atencao = useMemo(
    () =>
      d.arvore
        .flatMap((disc) => disc.assuntos.map((a) => ({ ...a, disciplina: disc.nome })))
        .filter((a) => a.total >= 5 && a.aproveitamento < META && a.nome !== "Sem assunto")
        .sort((a, b) => a.aproveitamento - b.aproveitamento || b.total - a.total)
        .slice(0, 4),
    [d.arvore]
  );

  const mediaDia = d.diasEstudados ? Math.round(d.resumo.total / d.diasEstudados) : 0;
  const nome = (user?.nome || "").split(" ")[0];

  const zerar = async () => {
    if (!user) return;
    setApagando(true);
    try {
      const { error } = await supabase.from("respostas_alunos").delete().eq("aluno_id", user.id);
      if (error) throw error;
      const { error: erroSim } = await supabase.from("user_simulado_results").delete().eq("user_id", user.id);
      if (erroSim) console.warn("Não foi possível apagar os simulados:", erroSim.message);
      toast.success("Estatísticas zeradas");
      d.recarregar();
    } catch (e) {
      console.error("Erro ao apagar estatísticas:", e);
      toast.error("Não foi possível zerar as estatísticas. Tente novamente.");
    } finally {
      setApagando(false);
      setConfirmar(false);
    }
  };

  const vazio = !d.carregando && !d.erro && d.resumo.total === 0 && d.bancas.length === 0;

  return (
    <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
      <Header />
      <main className="flex-1">
        {/* Topo */}
        <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
          <div className="container relative mx-auto flex flex-col gap-5 px-4 py-8 md:py-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">
                <BarChart3 className="h-3.5 w-3.5" /> Seu desempenho
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
                {nome ? `Olá, ${nome}` : "Dashboard"}
              </h1>
              <p className="mt-1 max-w-xl text-sm text-slate-500">
                Veja como você foi {extenso}: quanto resolveu, onde acerta mais e o que precisa revisar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Segmentos<Periodo> valor={periodo} onChange={setPeriodo} opcoes={PERIODOS.map((p) => ({ valor: p.valor, rotulo: p.rotulo }))} />
              {d.bancas.length > 1 && (
                <label className="flex items-center">
                  <span className="sr-only">Banca</span>
                  <select
                    value={d.banca}
                    onChange={(e) => d.setBanca(e.target.value)}
                    className="h-9 max-w-[200px] rounded-xl border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]"
                  >
                    <option value="todas">Todas as bancas</option>
                    {d.bancas.map((b) => (
                      <option key={b.nome} value={b.nome}>
                        {b.nome} ({fmt(b.total)})
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          </div>
        </section>

        <div className="container mx-auto space-y-5 px-4 py-6">
          <AdBanner position="dashboard_top" className="rounded-lg" />

          {d.carregando ? (
            <Carregando />
          ) : d.erro ? (
            <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {d.erro}
              <button type="button" onClick={d.recarregar} className="ml-auto font-semibold underline">
                Tentar de novo
              </button>
            </div>
          ) : vazio ? (
            <EstadoVazio
              icone={Target}
              titulo={`Nenhuma questão resolvida ${extenso}`}
              texto="Resolva questões para acompanhar aqui seus acertos, erros e a evolução em cada disciplina."
              acao={
                <div className="flex flex-wrap justify-center gap-2">
                  <Link to="/questions" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
                    Resolver questões
                  </Link>
                  {periodo !== "365" && (
                    <button
                      type="button"
                      onClick={() => setPeriodo("365")}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Ver o último ano
                    </button>
                  )}
                </div>
              }
            />
          ) : (
            <>
              {/* Números do período */}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Metrica
                  rotulo="Resolvidas"
                  valor={fmt(d.resumo.total)}
                  icone={ListChecks}
                  detalhe={<Variacao atual={d.resumo.total} anterior={d.resumoAnterior.total} />}
                />
                <Metrica rotulo="Acertos" valor={fmt(d.resumo.acertos)} icone={Check} tom="verde" detalhe={`${d.resumo.aproveitamento}% do total`} />
                <Metrica
                  rotulo="Erros"
                  valor={fmt(d.resumo.erros)}
                  icone={X}
                  tom="rosa"
                  detalhe={
                    d.resumo.erros > 0 ? (
                      <Link to="/questions?status=erradas" className="font-semibold text-[#5f2ebe] hover:underline">
                        Refazer as que errei →
                      </Link>
                    ) : (
                      "Nenhum erro, parabéns!"
                    )
                  }
                />
                <Metrica
                  rotulo="Aproveitamento"
                  valor={<span className={tomAproveitamento(d.resumo.aproveitamento, META, d.resumo.total).texto}>{d.resumo.aproveitamento}%</span>}
                  icone={Target}
                  tom="laranja"
                  detalhe={
                    d.resumoAnterior.total > 0 && d.resumo.total > 0 ? (
                      <Variacao atual={d.resumo.aproveitamento} anterior={d.resumoAnterior.aproveitamento} pontos />
                    ) : (
                      `Meta: ${META}%`
                    )
                  }
                />
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                {/* Atividade */}
                <Painel className="flex flex-col p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Atividade</h2>
                      <p className="text-xs text-slate-500">Questões resolvidas {dias > 90 ? "por mês" : "por dia"}</p>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Acertos
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Erros
                      </span>
                    </div>
                  </div>
                  <div className="h-[260px] lg:h-auto lg:min-h-[260px] lg:flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={d.grafico} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap={dias <= 7 ? "30%" : "15%"}>
                        <CartesianGrid vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="rotulo"
                          tickLine={false}
                          axisLine={false}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                          interval="preserveStartEnd"
                          minTickGap={12}
                        />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <Tooltip content={<DicaGrafico />} cursor={{ fill: "rgba(95,46,190,0.06)" }} />
                        <Bar dataKey="acertos" stackId="a" fill="#10b981" />
                        <Bar dataKey="erros" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Painel>

                {/* Resumo lateral */}
                <div className="space-y-5">
                  <Painel className="p-5">
                    <Anel valor={d.resumo.aproveitamento} total={d.resumo.total} />
                    <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <div className="flex items-center justify-center gap-1 text-lg font-bold tabular-nums text-slate-900">
                          <CalendarCheck className="h-4 w-4 text-[#5f2ebe]" />
                          {d.diasEstudados}
                        </div>
                        <div className="text-[11px] text-slate-500">{d.diasEstudados === 1 ? "dia com estudo" : "dias com estudo"}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-2.5">
                        <div className="flex items-center justify-center gap-1 text-lg font-bold tabular-nums text-slate-900">
                          <Flame className="h-4 w-4 text-orange-500" />
                          {fmt(mediaDia)}
                        </div>
                        <div className="text-[11px] text-slate-500">questões por dia de estudo</div>
                      </div>
                    </div>
                  </Painel>

                  <Painel className="p-4">
                    <h2 className="text-sm font-bold text-slate-900">Pontos de atenção</h2>
                    <p className="text-xs text-slate-500">Assuntos abaixo de {META}% (com 5 questões ou mais)</p>
                    {atencao.length === 0 ? (
                      <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                        {d.resumo.total < 5 ? "Resolva mais questões para ver onde revisar." : "Nenhum assunto abaixo da meta. Muito bem!"}
                      </p>
                    ) : (
                      <ul className="mt-3 space-y-2">
                        {atencao.map((a) => (
                          <li key={`${a.disciplina}-${a.nome}`}>
                            <Link
                              to={linkQuestoes(a.disciplina, a.nome)}
                              className="group block rounded-xl border border-slate-200/80 px-3 py-2 hover:border-[#5f2ebe]/30 hover:bg-[#5f2ebe]/[0.03]"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate text-sm font-medium text-slate-800" title={a.nome}>
                                  {a.nome}
                                </span>
                                <span className={cn("shrink-0 text-xs font-bold tabular-nums", tomAproveitamento(a.aproveitamento, META, a.total).texto)}>
                                  {a.aproveitamento}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between gap-2 text-[11px] text-slate-400">
                                <span className="truncate">{a.disciplina}</span>
                                <span className="shrink-0 font-semibold text-[#5f2ebe] opacity-0 transition-opacity group-hover:opacity-100">Treinar →</span>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Painel>
                </div>
              </div>

              {/* Disciplinas */}
              <Painel className="overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Por disciplina</h2>
                    <p className="text-xs text-slate-500">
                      Toque numa disciplina para ver assuntos e tópicos{d.banca !== "todas" ? ` · banca ${d.banca}` : ""}
                    </p>
                  </div>
                  <Segmentos<OrdemDisc>
                    valor={ordem}
                    onChange={setOrdem}
                    opcoes={[
                      { valor: "total", rotulo: "Mais resolvidas" },
                      { valor: "pior", rotulo: "Pior %" },
                      { valor: "nome", rotulo: "A–Z" },
                    ]}
                  />
                </div>
                {disciplinas.length === 0 ? (
                  <p className="px-4 py-10 text-center text-sm text-slate-500">Nenhuma questão desta banca no período.</p>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {disciplinas.map((disc) => (
                      <LinhaDisciplina key={`${periodo}-${d.banca}-${disc.nome}`} d={disc} maior={maior} />
                    ))}
                  </ul>
                )}
              </Painel>
            </>
          )}

          <AdBanner position="dashboard_middle" className="rounded-lg" />

          {/* Simulados */}
          {!d.carregando && !d.erro && (
            <Painel className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Simulados</h2>
                  <p className="text-xs text-slate-500">Seus resultados, do mais recente para o mais antigo</p>
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5f2ebe]/10 text-[#5f2ebe]">
                  <ClipboardList className="h-4 w-4" />
                </span>
              </div>
              {d.simulados.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-semibold text-slate-800">Você ainda não fez nenhum simulado</p>
                  <p className="mt-1 text-xs text-slate-500">Os simulados ficam na aba Simulados de cada curso.</p>
                  <Link to="/my-courses" className="mt-3 inline-block text-xs font-semibold text-[#5f2ebe] hover:underline">
                    Ir para meus cursos →
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {d.simulados.map((s) => {
                    const tom = tomAproveitamento(s.aproveitamento, META, s.total);
                    return (
                      <li key={s.id}>
                        <Link to={`/simulado/${s.simuladoId}`} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/80">
                          <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums", tom.fundo)}>
                            {s.aproveitamento}%
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">{s.titulo}</p>
                            <p className="text-xs text-slate-500">
                              {new Date(s.data).toLocaleDateString("pt-BR")} · {fmt(s.total)} questões
                            </p>
                          </div>
                          <div className="hidden items-center gap-3 text-xs tabular-nums sm:flex">
                            <span className="flex items-center gap-0.5 text-emerald-600">
                              <Check className="h-3 w-3" />
                              {s.acertos}
                            </span>
                            <span className="flex items-center gap-0.5 text-red-500">
                              <X className="h-3 w-3" />
                              {s.erros}
                            </span>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Painel>
          )}

          {/* Zerar */}
          {!d.carregando && !vazio && (
            <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">Começar do zero</p>
                <p className="text-xs text-slate-500">Apaga todas as suas respostas e resultados de simulados. Não dá para desfazer.</p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmar(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <RotateCcw className="h-4 w-4" /> Zerar estatísticas
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AlertDialog open={confirmar} onOpenChange={(v) => !apagando && setConfirmar(v)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zerar todas as estatísticas?</AlertDialogTitle>
            <AlertDialogDescription>
              Todas as suas respostas de questões e os resultados de simulados serão apagados de vez. Seus cadernos e anotações continuam
              guardados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={apagando}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                zerar();
              }}
              disabled={apagando}
              className="bg-red-600 hover:bg-red-700"
            >
              {apagando ? "Apagando..." : "Sim, zerar tudo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
