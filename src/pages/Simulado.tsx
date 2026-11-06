import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  Flag,
  LayoutGrid,
  List,
  Loader2,
  LogIn,
  Square,
  Trophy,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { QuestionCard } from "@/components/new/QuestionCard";
import { Question } from "@/components/new/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BarraProgresso, EstadoVazio, Painel, Segmentos } from "@/components/course/ui";
import { Paginacao } from "@/components/questions/busca/Paginacao";
import { CartaoResposta, type SituacaoQuestao } from "@/components/simulado/CartaoResposta";
import { CronometroProva, relogio, useCronometro } from "@/components/simulado/CronometroProva";
import { usePermissions } from "@/hooks/usePermissions";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { ActivityLogger } from "@/services/activity-logger";
import { generateFriendlyUrl } from "@/utils/slug-utils";
import { cn } from "@/lib/utils";

type Modo = "lista" | "foco";

/** Questões por página no modo lista. */
const POR_PAGINA = 10;
/** Minutos sugeridos por questão. */
const MIN_POR_QUESTAO = 3;

interface SimuladoInfo {
  id: string;
  titulo?: string | null;
  title?: string | null;
  questoes_ids?: string[] | null;
  curso_id?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  ranking_is_public?: boolean | null;
}

interface Resultado {
  acertos: number;
  erros: number;
  total: number;
  respondidas: number;
  segundos?: number;
  data?: string;
}

// Tabela fora dos tipos gerados em algumas versões
type ClienteComResultados = typeof supabase & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  from(table: "user_simulado_results"): any;
};

const lerModo = (): Modo => {
  try {
    return localStorage.getItem("simulado_modo") === "lista" ? "lista" : "foco";
  } catch {
    return "foco";
  }
};

// Converte as alternativas do banco para o formato do QuestionCard
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parseOptions = (options: Json | null): any[] => {
  if (!Array.isArray(options)) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return options.map((option: any) => ({
    id: option.id || `option-${Math.random().toString(36).substr(2, 9)}`,
    text: option.text || "",
    isCorrect: Boolean(option.isCorrect),
  }));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const paraCartao = (q: any): Question => ({
  id: q.id,
  number: q.number || 0,
  content: q.content,
  command: q.command || "",
  options: parseOptions(q.options),
  year: q.year,
  institution: q.institution,
  organization: q.organization,
  role: q.role,
  educationLevel: q.education_level,
  discipline: q.discipline,
  topics: Array.isArray(q.topics) ? q.topics : [],
  expandableContent: q.expandablecontent || undefined,
  teacherExplanation: q.teacherexplanation || undefined,
  aiExplanation: q.aiexplanation || undefined,
  comments: [],
});

const CartaoCarregando = () => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-5">
    <div className="flex items-center gap-3">
      <Skeleton className="h-7 w-7 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
    <Skeleton className="mt-5 h-16 w-full" />
    <div className="mt-4 space-y-2">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-12 w-full rounded-xl" />
      ))}
    </div>
  </div>
);

const Simulado = () => {
  const { simuladoId } = useParams<{ simuladoId: string }>();
  const [searchParams] = useSearchParams();
  const { isAdmin } = usePermissions();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const mostrarRanking = config.pages.showSimuladoRankingPage;

  const [simulado, setSimulado] = useState<SimuladoInfo | null>(null);
  const [curso, setCurso] = useState<{ id: string; titulo: string } | null>(null);
  const [questoes, setQuestoes] = useState<Question[]>([]);
  const [carregando, setCarregando] = useState(true);
  /** Resultado de cada questão já respondida (true = acertou). */
  const [respostas, setRespostas] = useState<Map<string, boolean>>(new Map());
  const [disabledOptions, setDisabledOptions] = useState<Record<string, string[]>>({});
  const [ultimoResultado, setUltimoResultado] = useState<Resultado | null>(null);

  const [modo, setModo] = useState<Modo>(lerModo);
  const [atual, setAtual] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [rolarPara, setRolarPara] = useState<number | null>(null);
  const [cartaoAberto, setCartaoAberto] = useState(false);
  const [confirmarAberto, setConfirmarAberto] = useState(false);
  const [finalizando, setFinalizando] = useState(false);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const [rankingPublico, setRankingPublico] = useState(false);
  const [salvandoRanking, setSalvandoRanking] = useState(false);

  const topoQuestoes = useRef<HTMLDivElement>(null);
  const cronometro = useCronometro(simuladoId, !carregando && questoes.length > 0 && !resultado);

  const total = questoes.length;
  const respondidas = questoes.filter((q) => respostas.has(q.id)).length;
  const acertos = questoes.filter((q) => respostas.get(q.id) === true).length;
  const emBranco = total - respondidas;
  const aproveitamento = respondidas ? Math.round((acertos / respondidas) * 100) : 0;
  const estimadoMin = total * MIN_POR_QUESTAO;
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));
  const titulo = simulado?.titulo || simulado?.title || "Simulado";

  const situacoes: SituacaoQuestao[] = useMemo(
    () => questoes.map((q) => (!respostas.has(q.id) ? "branco" : respostas.get(q.id) ? "acertou" : "errou")),
    [questoes, respostas]
  );

  // Carrega o simulado, as questões (na ordem do simulado) e as respostas do aluno
  useEffect(() => {
    let ativo = true;
    const carregar = async () => {
      setCarregando(true);
      try {
        const { data: simuladoData, error } = await supabase.from("simulados").select("*").eq("id", simuladoId).single();
        if (error) throw error;
        if (!ativo) return;
        const info = simuladoData as unknown as SimuladoInfo;
        setSimulado(info);
        setRankingPublico(Boolean(info.ranking_is_public));
        const ids = info.questoes_ids || [];

        if (info.curso_id) {
          supabase
            .from("cursos")
            .select("id, titulo")
            .eq("id", info.curso_id)
            .maybeSingle()
            .then(({ data }) => ativo && data && setCurso(data as { id: string; titulo: string }));
        }

        // Questões de um caderno (?caderno=) substituem as do simulado
        const caderno = searchParams.get("caderno");
        let lista: Question[] = [];
        if (caderno) {
          lista = await carregarCaderno(caderno);
        } else if (ids.length > 0) {
          const { data: questionsData, error: questionsError } = await supabase.from("questoes").select("*").in("id", ids);
          if (questionsError) throw questionsError;
          const posicao = new Map(ids.map((id, i) => [id, i]));
          lista = (questionsData || [])
            .map(paraCartao)
            .sort((a, b) => (posicao.get(a.id) ?? 0) - (posicao.get(b.id) ?? 0));
        }
        if (!ativo) return;
        setQuestoes(lista);

        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (uid && lista.length > 0) {
          const { data: resp } = await supabase
            .from("respostas_alunos")
            .select("questao_id, is_correta, created_at")
            .eq("aluno_id", uid)
            .in(
              "questao_id",
              lista.map((q) => q.id)
            )
            .order("created_at", { ascending: true });
          const mapa = new Map<string, boolean>();
          (resp || []).forEach((r) => mapa.set(r.questao_id, Boolean(r.is_correta)));
          if (ativo) setRespostas(mapa);
        }

        if (uid && simuladoId) {
          const { data: res } = await (supabase as ClienteComResultados)
            .from("user_simulado_results")
            .select("acertos, erros, updated_at, created_at")
            .eq("user_id", uid)
            .eq("simulado_id", simuladoId)
            .maybeSingle();
          if (ativo && res) {
            const totalRes = (res.acertos || 0) + (res.erros || 0);
            setUltimoResultado({
              acertos: res.acertos || 0,
              erros: res.erros || 0,
              total: totalRes,
              respondidas: totalRes,
              data: res.updated_at || res.created_at,
            });
          }
        }
      } catch (e) {
        console.error("Erro ao buscar simulado:", e);
        if (ativo) toast.error("Erro ao carregar o simulado. Tente novamente.");
      } finally {
        if (ativo) setCarregando(false);
      }
    };
    carregar();
    return () => {
      ativo = false;
    };
  }, [simuladoId, searchParams]);

  const carregarCaderno = async (caderno: string): Promise<Question[]> => {
    const {
      data: { user: atualUser },
    } = await supabase.auth.getUser();
    if (!atualUser) {
      toast.error("Você precisa estar logado para fazer o simulado");
      return [];
    }
    const { data: bookData, error: bookError } = await supabase.from("cadernos_questoes").select("*").eq("id", caderno).single();
    if (bookError) throw bookError;
    if (bookData.user_id !== atualUser.id && !bookData.is_public) {
      toast.error("Você não tem permissão para ver este caderno");
      return [];
    }
    const { data, error } = await supabase
      .from("questoes_caderno")
      .select(
        `questao:questao_id (id, number, content, command, options, year, institution, organization, role, education_level, discipline, topics, expandablecontent, teacherexplanation, aiexplanation)`
      )
      .eq("caderno_id", caderno)
      .order("position", { ascending: true });
    if (error) throw error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((qc: any) => qc.questao).filter(Boolean).map(paraCartao);
  };

  const trocarModo = (m: Modo) => {
    // Mantém a questão em foco ao trocar de modo
    if (m === "lista") setPagina(Math.floor(atual / POR_PAGINA) + 1);
    else setAtual((pagina - 1) * POR_PAGINA);
    setModo(m);
    try {
      localStorage.setItem("simulado_modo", m);
    } catch {
      /* sem armazenamento: só não lembra a escolha */
    }
  };

  const rolarParaQuestoes = () => topoQuestoes.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const irPara = (i: number) => {
    setCartaoAberto(false);
    setAtual(i);
    if (modo === "foco") {
      rolarParaQuestoes();
    } else {
      setPagina(Math.floor(i / POR_PAGINA) + 1);
      setRolarPara(i);
    }
  };

  // No modo lista, rola até a questão escolhida no cartão-resposta depois que a página aparece
  useEffect(() => {
    if (rolarPara === null) return;
    const t = setTimeout(() => {
      document.getElementById(`questao-${rolarPara + 1}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      setRolarPara(null);
    }, 50);
    return () => clearTimeout(t);
  }, [rolarPara, pagina]);

  const proxima = () => {
    if (atual < total - 1) {
      setAtual(atual + 1);
      rolarParaQuestoes();
    }
  };
  const anterior = () => {
    if (atual > 0) {
      setAtual(atual - 1);
      rolarParaQuestoes();
    }
  };

  // Setas do teclado no modo "uma por vez"
  useEffect(() => {
    if (modo !== "foco") return;
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (alvo.closest("input, textarea, select, [contenteditable=true], [role=dialog]")) return;
      if (e.key === "ArrowRight") proxima();
      if (e.key === "ArrowLeft") anterior();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  });

  const trocarPagina = (p: number) => {
    setPagina(p);
    rolarParaQuestoes();
  };

  const riscarAlternativa = (questionId: string, optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions((prev) => {
      const atuais = prev[questionId] || [];
      return { ...prev, [questionId]: atuais.includes(optionId) ? atuais.filter((id) => id !== optionId) : [...atuais, optionId] };
    });
  };

  const registrarResposta = (questionId: string, acertou: boolean) =>
    setRespostas((m) => {
      const novo = new Map(m);
      novo.set(questionId, acertou);
      return novo;
    });

  const finalizar = async () => {
    if (!simulado || !simuladoId) return;
    try {
      setFinalizando(true);
      if (!user) {
        toast.error("Você precisa estar logado para finalizar o simulado");
        return;
      }
      // A nota é calculada e gravada no banco (função finalizar_simulado), com o gabarito oficial
      type RetornoFinalizar = { acertos: number; erros: number; total: number; respondidas: number };
      const { data, error } = await (supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>
      ) => Promise<{ data: RetornoFinalizar[] | RetornoFinalizar | null; error: { code?: string; message: string } | null }>)(
        "finalizar_simulado",
        { p_simulado_id: simuladoId }
      );
      if (error) {
        if (error.code === "PGRST202" || error.code === "42883") {
          toast.error("O banco ainda não tem a função finalizar_simulado. Aplique a migration 20251115000000_finalizar_simulado.sql.");
          return;
        }
        throw error;
      }
      const linha = (Array.isArray(data) ? data[0] : data) as RetornoFinalizar | null;
      if (!linha) throw new Error("Resposta vazia ao finalizar o simulado");
      const percentual = linha.total > 0 ? Math.round((linha.acertos / linha.total) * 100) : 0;

      await ActivityLogger.logActivity({
        event_type: "exam_complete",
        resource_id: simuladoId,
        resource_type: "simulado",
        description: `Finalizou o simulado ${titulo}`,
        metadata: { correctAnswers: linha.acertos, totalQuestions: linha.total, percentage: percentual },
      });

      const final: Resultado = {
        acertos: linha.acertos,
        erros: linha.erros,
        total: linha.total,
        respondidas: linha.respondidas,
        segundos: cronometro.segundos,
        data: new Date().toISOString(),
      };
      cronometro.parar();
      setConfirmarAberto(false);
      setResultado(final);
      setUltimoResultado(final);
    } catch (e) {
      console.error("Erro ao calcular e salvar resultados:", e);
      toast.error("Erro ao finalizar simulado. Tente novamente.");
    } finally {
      setFinalizando(false);
    }
  };

  const alternarRanking = async () => {
    try {
      setSalvandoRanking(true);
      const { error } = await supabase
        .from("simulados")
        .update({ ranking_is_public: !rankingPublico })
        .eq("id", simuladoId);
      if (error) throw error;
      setRankingPublico(!rankingPublico);
      toast.success(`Ranking ${!rankingPublico ? "público" : "privado"} agora.`);
    } catch (e) {
      console.error("Erro ao atualizar visibilidade do ranking:", e);
      toast.error("Erro ao atualizar visibilidade do ranking. Tente novamente.");
    } finally {
      setSalvandoRanking(false);
    }
  };

  const linkCurso = curso ? `/course/${generateFriendlyUrl(curso.titulo, curso.id)}` : "/my-courses";
  const periodo =
    simulado?.data_inicio || simulado?.data_fim
      ? [
          simulado.data_inicio && `de ${format(new Date(simulado.data_inicio), "dd/MM", { locale: ptBR })}`,
          simulado.data_fim && `até ${format(new Date(simulado.data_fim), "dd/MM/yyyy", { locale: ptBR })}`,
        ]
          .filter(Boolean)
          .join(" ")
      : null;

  // Painel lateral (computador) e gaveta (celular)
  const painelProva = (
    <div className="space-y-4">
      <Painel className="p-4">
        <CronometroProva
          segundos={cronometro.segundos}
          rodando={cronometro.rodando && !resultado}
          onAlternar={cronometro.alternar}
          estimadoMin={estimadoMin}
        />
      </Painel>
      <Painel className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <LayoutGrid className="h-4 w-4 text-[#5f2ebe]" /> Cartão-resposta
          </span>
          <span className="text-xs tabular-nums text-slate-500">
            {respondidas}/{total}
          </span>
        </div>
        <CartaoResposta situacoes={situacoes} atual={modo === "foco" ? atual : null} onIr={irPara} />
      </Painel>
      {user ? (
        <button
          type="button"
          onClick={() => {
            setCartaoAberto(false);
            setConfirmarAberto(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
        >
          <Flag className="h-4 w-4" /> Finalizar simulado
        </button>
      ) : (
        <Link
          to="/login"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
        >
          <LogIn className="h-4 w-4" /> Entrar para salvar o resultado
        </Link>
      )}
      {mostrarRanking && (
        <Link
          to={`/simulado-ranking/${simuladoId}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <Trophy className="h-4 w-4 text-amber-500" /> Ver ranking
        </Link>
      )}
      {isAdmin() && (
        <label className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-600">
          <span>
            Ranking público
            <span className="block text-xs text-slate-400">{salvandoRanking ? "Salvando..." : "Só administradores veem esta opção"}</span>
          </span>
          <Switch checked={rankingPublico} onCheckedChange={alternarRanking} disabled={salvandoRanking} />
        </label>
      )}
    </div>
  );

  if (!carregando && !simulado) {
    return (
      <PublicLayout>
        <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
          <Header />
          <main className="flex-1 py-10 mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px]">
            <EstadoVazio
              icone={FileQuestion}
              titulo="Simulado não encontrado"
              texto="O simulado que você está tentando acessar não existe ou foi removido."
              acao={
                <Link to="/my-courses" className="rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]">
                  Ir para meus cursos
                </Link>
              }
            />
          </main>
          <Footer />
        </div>
      </PublicLayout>
    );
  }

  const ultimaDoFoco = atual === total - 1;
  const visiveis = modo === "foco" ? questoes.slice(atual, atual + 1) : questoes.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const primeiroIndice = modo === "foco" ? atual : (pagina - 1) * POR_PAGINA;

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className="relative grid gap-6 py-8 mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px] md:py-10 lg:grid-cols-[1fr_320px] lg:items-end">
              <div className="min-w-0">
                <Link to={linkCurso} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#5f2ebe]">
                  <ArrowLeft className="h-3.5 w-3.5" /> {curso ? curso.titulo : "Meus cursos"}
                </Link>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Simulado</p>
                {carregando ? (
                  <Skeleton className="mt-2 h-8 w-2/3" />
                ) : (
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{titulo}</h1>
                )}
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    <ClipboardList className="h-3.5 w-3.5" /> {carregando ? "..." : `${total} ${total === 1 ? "questão" : "questões"}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                    cerca de {carregando ? "..." : estimadoMin} min
                  </span>
                  {periodo && <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">{periodo}</span>}
                </div>
                <p className="mt-3 max-w-xl text-sm text-slate-500">
                  Responda cada questão para ver o gabarito na hora. Quando terminar, finalize para guardar sua nota
                  {mostrarRanking ? " e entrar no ranking" : ""}. Questões em branco contam como erro.
                </p>
              </div>

              {/* Progresso do aluno */}
              {user ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur lg:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seu progresso</span>
                    <span className="text-xs tabular-nums text-slate-500">
                      {respondidas} de {total}
                    </span>
                  </div>
                  <div className="mt-2 flex items-end gap-6">
                    <div>
                      <div className="text-xl font-bold tabular-nums text-slate-900 lg:text-2xl">{respondidas}</div>
                      <div className="text-xs text-slate-500">respondidas</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold tabular-nums text-emerald-600 lg:text-2xl">{acertos}</div>
                      <div className="text-xs text-slate-500">acertos</div>
                    </div>
                    <div>
                      <div className={cn("text-xl font-bold tabular-nums lg:text-2xl", respondidas ? "text-slate-900" : "text-slate-300")}>
                        {aproveitamento}%
                      </div>
                      <div className="text-xs text-slate-500">de acerto</div>
                    </div>
                  </div>
                  <BarraProgresso valor={total ? (respondidas / total) * 100 : 0} className="mt-3" />
                  {ultimoResultado && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <Trophy className="h-3.5 w-3.5 text-amber-500" />
                      Resultado salvo: <strong className="font-semibold text-slate-800">
                        {ultimoResultado.acertos}/{ultimoResultado.total}
                      </strong>
                      {ultimoResultado.data && ` em ${format(new Date(ultimoResultado.data), "dd/MM/yyyy", { locale: ptBR })}`}
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
                  <p className="text-sm font-semibold text-slate-800">Entre para valer nota</p>
                  <p className="mt-1 text-xs text-slate-500">Sem entrar você pode treinar, mas suas respostas e sua nota não ficam guardadas.</p>
                  <Link
                    to="/login"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5f2ebe] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4f25a0]"
                  >
                    <LogIn className="h-3.5 w-3.5" /> Entrar
                  </Link>
                </div>
              )}
            </div>
          </section>

          <div className="grid gap-6 py-6 mx-auto w-full max-w-[1400px] px-[10px] md:px-[32px] lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
              {/* Barra de controles */}
              <div ref={topoQuestoes} className="flex scroll-mt-4 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCartaoAberto(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 lg:hidden"
                >
                  <LayoutGrid className="h-4 w-4" />
                  <span className="tabular-nums">
                    {respondidas}/{total}
                  </span>
                  <span className="hidden text-slate-400 sm:inline">·</span>
                  <span className="hidden tabular-nums sm:inline">{relogio(cronometro.segundos)}</span>
                </button>
                <p className="mr-auto text-sm text-slate-500">
                  {carregando ? (
                    "Carregando questões..."
                  ) : modo === "foco" ? (
                    <>
                      Questão <strong className="text-base font-bold tabular-nums text-slate-900">{atual + 1}</strong> de {total}
                    </>
                  ) : (
                    <>
                      <strong className="text-base font-bold tabular-nums text-slate-900">{total}</strong> {total === 1 ? "questão" : "questões"}
                    </>
                  )}
                </p>
                <Segmentos<Modo>
                  valor={modo}
                  onChange={trocarModo}
                  className="bg-slate-200/60"
                  opcoes={[
                    {
                      valor: "foco",
                      rotulo: (
                        <>
                          <Square className="h-4 w-4" /> <span className="hidden sm:inline">Uma por vez</span>
                        </>
                      ),
                    },
                    {
                      valor: "lista",
                      rotulo: (
                        <>
                          <List className="h-4 w-4" /> <span className="hidden sm:inline">Lista</span>
                        </>
                      ),
                    },
                  ]}
                />
              </div>

              {carregando ? (
                <CartaoCarregando />
              ) : total === 0 ? (
                <EstadoVazio icone={FileQuestion} titulo="Este simulado ainda não tem questões" texto="Volte mais tarde ou escolha outro simulado do curso." />
              ) : (
                <>
                  {modo === "foco" && (
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                      <button
                        type="button"
                        onClick={anterior}
                        disabled={atual === 0}
                        aria-label="Questão anterior"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="tabular-nums">
                            {respondidas} de {total} respondidas
                          </span>
                          <span className="tabular-nums">{total ? Math.round((respondidas / total) * 100) : 0}%</span>
                        </div>
                        {total <= 60 ? (
                          <div className="mt-1.5 flex gap-0.5">
                            {situacoes.map((s, i) => (
                              <button
                                key={i}
                                type="button"
                                onClick={() => irPara(i)}
                                aria-label={`Ir para a questão ${i + 1}`}
                                className={cn(
                                  "h-1.5 flex-1 rounded-full transition-all",
                                  i === atual
                                    ? "bg-[#5f2ebe]"
                                    : s === "acertou"
                                      ? "bg-emerald-400"
                                      : s === "errou"
                                        ? "bg-red-400"
                                        : "bg-slate-200 hover:bg-slate-300"
                                )}
                              />
                            ))}
                          </div>
                        ) : (
                          <BarraProgresso valor={(respondidas / total) * 100} className="mt-1.5 h-1.5" />
                        )}
                      </div>
                      {ultimaDoFoco ? (
                        <button
                          type="button"
                          onClick={() => setConfirmarAberto(true)}
                          disabled={!user}
                          className="inline-flex h-9 items-center gap-1 rounded-lg bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
                        >
                          <Flag className="h-4 w-4" /> <span className="hidden sm:inline">Finalizar</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={proxima}
                          className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#5f2ebe] px-3 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                        >
                          <span className="hidden sm:inline">Próxima</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-4">
                    {visiveis.map((questao, i) => {
                      const indice = primeiroIndice + i;
                      return (
                        <div key={questao.id} id={`questao-${indice + 1}`} className="scroll-mt-4">
                          <QuestionCard
                            question={questao}
                            disabledOptions={disabledOptions[questao.id] || []}
                            onToggleDisabled={(optionId, event) => riscarAlternativa(questao.id, optionId, event)}
                            aparencia="moderna"
                            numero={indice + 1}
                            onAnswered={registrarResposta}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {modo === "foco" ? (
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={anterior}
                        disabled={atual === 0}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" /> Anterior
                      </button>
                      {ultimaDoFoco ? (
                        user && (
                          <button
                            type="button"
                            onClick={() => setConfirmarAberto(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                          >
                            <Flag className="h-4 w-4" /> Finalizar simulado
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={proxima}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-[#5f2ebe] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
                        >
                          Próxima questão <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Paginacao
                        pagina={pagina}
                        totalPaginas={totalPaginas}
                        total={total}
                        porPagina={POR_PAGINA}
                        onPagina={trocarPagina}
                        className="rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3"
                      />
                      {pagina === totalPaginas && user && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setConfirmarAberto(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                          >
                            <Flag className="h-4 w-4" /> Finalizar simulado
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Painel da prova (computador) */}
            <aside className="hidden lg:block">
              <div className="sticky top-20">{painelProva}</div>
            </aside>
          </div>
        </main>
        <Footer />
      </div>

      {/* Painel da prova no celular */}
      <Sheet open={cartaoAberto} onOpenChange={setCartaoAberto}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl bg-[rgb(242,244,246)] px-4 pb-6 pt-4">
          <SheetHeader className="mb-3 text-left">
            <SheetTitle>Sua prova</SheetTitle>
          </SheetHeader>
          {painelProva}
        </SheetContent>
      </Sheet>

      {/* Confirmação para finalizar */}
      <Dialog open={confirmarAberto} onOpenChange={(v) => !finalizando && setConfirmarAberto(v)}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Finalizar o simulado?</DialogTitle>
            <DialogDescription>
              Sua nota será calculada com as respostas que você deu até agora{mostrarRanking ? " e vai para o ranking" : ""}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xl font-bold tabular-nums text-slate-900">{respondidas}</div>
              <div className="text-xs text-slate-500">respondidas</div>
            </div>
            <div className={cn("rounded-xl p-3", emBranco ? "bg-amber-50" : "bg-slate-50")}>
              <div className={cn("text-xl font-bold tabular-nums", emBranco ? "text-amber-600" : "text-slate-900")}>{emBranco}</div>
              <div className="text-xs text-slate-500">em branco</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xl font-bold tabular-nums text-slate-900">{relogio(cronometro.segundos)}</div>
              <div className="text-xs text-slate-500">de prova</div>
            </div>
          </div>
          {emBranco > 0 && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {emBranco === 1 ? "Há 1 questão em branco, que conta" : `Há ${emBranco} questões em branco, que contam`} como erro.
            </p>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setConfirmarAberto(false);
                const primeiraEmBranco = situacoes.indexOf("branco");
                if (primeiraEmBranco >= 0) irPara(primeiraEmBranco);
              }}
              disabled={finalizando}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {emBranco > 0 ? "Ir para as em branco" : "Continuar revisando"}
            </button>
            <button
              type="button"
              onClick={finalizar}
              disabled={finalizando}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {finalizando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              {finalizando ? "Calculando..." : "Finalizar e ver nota"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resultado */}
      <Dialog open={!!resultado} onOpenChange={(v) => !v && setResultado(null)}>
        <DialogContent className="max-w-md rounded-2xl">
          {resultado && (
            <>
              <DialogHeader className="items-center text-center sm:text-center">
                <span className="mb-1 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5f2ebe] to-[#ea2be2] text-white">
                  <Trophy className="h-7 w-7" />
                </span>
                <DialogTitle className="text-xl">Simulado finalizado!</DialogTitle>
                <DialogDescription>{titulo}</DialogDescription>
              </DialogHeader>
              <div className="text-center">
                <div className="text-5xl font-bold tabular-nums tracking-tight text-slate-900">
                  {resultado.total ? Math.round((resultado.acertos / resultado.total) * 100) : 0}%
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {resultado.acertos} de {resultado.total} questões certas
                </p>
                <BarraProgresso
                  valor={resultado.total ? (resultado.acertos / resultado.total) * 100 : 0}
                  corClasse="bg-gradient-to-r from-[#5f2ebe] to-[#ea2be2]"
                  className="mt-4"
                />
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-600" />
                  <div className="mt-1 text-lg font-bold tabular-nums text-emerald-700">{resultado.acertos}</div>
                  <div className="text-xs text-emerald-700/70">acertos</div>
                </div>
                <div className="rounded-xl bg-red-50 p-3">
                  <XCircle className="mx-auto h-4 w-4 text-red-500" />
                  <div className="mt-1 text-lg font-bold tabular-nums text-red-600">{resultado.erros}</div>
                  <div className="text-xs text-red-600/70">erros</div>
                  {resultado.total - resultado.respondidas > 0 && (
                    <div className="text-[11px] text-red-600/60">{resultado.total - resultado.respondidas} em branco</div>
                  )}
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <ClipboardList className="mx-auto h-4 w-4 text-slate-500" />
                  <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">{relogio(resultado.segundos || 0)}</div>
                  <div className="text-xs text-slate-500">de prova</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {mostrarRanking && (
                  <Link
                    to={`/simulado-ranking/${simuladoId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                  >
                    <Trophy className="h-4 w-4" /> Ver minha posição no ranking
                  </Link>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResultado(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Revisar questões
                  </button>
                  <Link
                    to={linkCurso}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Voltar ao curso
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
};

export default Simulado;
