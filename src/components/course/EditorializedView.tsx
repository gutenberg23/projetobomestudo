import { useEffect, useMemo, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { AlertCircle, Check, ChevronsDownUp, ChevronsUpDown, FileX, Loader2, LogIn, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { StatisticsCard } from "./components/StatisticsCard";
import { useEditorializedData } from "./hooks/useEditorializedData";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjectImportanceStats } from "@/hooks/useSubjectImportanceStats";
import { CabecalhoAba, Carregando, EstadoVazio, Painel, Segmentos, normalizar } from "./ui";
import { ResumoEdital } from "./edital/ResumoEdital";
import { DisciplinaEdital, TopicoVisivel } from "./edital/DisciplinaEdital";
import type { Topic } from "./types/editorialized";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    forceRefreshEdital?: () => void;
  }
}

interface EditorializedViewProps {
  courseId: string;
  activeTab?: string;
}

type FiltroStatus = "todos" | "pendentes" | "concluidos" | "abaixo";
type Ordem = "edital" | "importancia";

const vazio = { totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 };

/**
 * Aba "Edital" do curso: edital verticalizado com o progresso do aluno.
 *
 * Atenção: o progresso é guardado por disciplina + POSIÇÃO do tópico (topic.id = índice + 1).
 * Filtros e ordenação aqui são só de exibição; nada muda a ordem dos dados.
 */
export const EditorializedView: React.FC<EditorializedViewProps> = ({ courseId }) => {
  const {
    subjects,
    loading,
    updateTopicProgress,
    forceRefresh,
    unsavedChanges,
    saveAllDataToDatabase,
    performanceGoal,
    updatePerformanceGoal,
    examDate,
    updateExamDate,
    lastSaveTime,
    saveStatus,
  } = useEditorializedData();
  const { user } = useAuth();
  const [hasEdital, setHasEdital] = useState<boolean | null>(null);
  const [isLoadingEdital, setIsLoadingEdital] = useState(false);

  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<FiltroStatus>("todos");
  const [ordem, setOrdem] = useState<Ordem>("edital");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  // Com filtro ativo, as disciplinas com resultado abrem sozinhas; aqui ficam as que o aluno recolheu
  const [recolhidas, setRecolhidas] = useState<Set<string>>(new Set());
  const iniciouAbertas = useRef(false);

  const { importanceStats, userStats, topicUserStats, loading: statsLoading } = useSubjectImportanceStats(subjects, user?.id);

  // Junta o progresso salvo com as estatísticas reais de questões
  const disciplinas = useMemo(
    () =>
      subjects.map((subject) => {
        const s = userStats[subject.id.toString()] || vazio;
        return {
          ...subject,
          topics: subject.topics.map((topic, index) => {
            const t = topicUserStats[`${subject.id}-${index}`] || vazio;
            return { ...topic, exercisesDone: t.totalAttempts, hits: t.correctAnswers, errors: t.wrongAnswers };
          }),
          totalExercises: s.totalAttempts,
          correctAnswers: s.correctAnswers,
        };
      }),
    [subjects, userStats, topicUserStats]
  );

  // Primeira disciplina aberta por padrão
  useEffect(() => {
    if (!iniciouAbertas.current && disciplinas.length > 0) {
      iniciouAbertas.current = true;
      setAbertas(new Set([String(disciplinas[0].id)]));
    }
  }, [disciplinas]);

  useEffect(() => {
    window.forceRefreshEdital = () => {
      forceRefresh?.();
      checkEditalExists();
    };
    return () => {
      delete window.forceRefreshEdital;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    if (courseId) checkEditalExists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const checkEditalExists = async () => {
    if (!courseId) return;
    setIsLoadingEdital(true);
    try {
      const realId = extractIdFromFriendlyUrl(courseId);
      const { data } = await supabase
        .from("cursoverticalizado")
        .select("id, curso_id")
        .eq("curso_id", realId)
        .or("ativo.is.null,ativo.eq.true")
        .limit(1)
        .maybeSingle();
      setHasEdital(!!data?.id && data.curso_id === realId);
    } catch {
      setHasEdital(false);
    } finally {
      setIsLoadingEdital(false);
    }
  };

  // Meta e data da prova salvam sozinhas, logo depois da mudança
  const [salvarPendente, setSalvarPendente] = useState(0);
  useEffect(() => {
    if (!salvarPendente) return;
    const t = setTimeout(() => saveAllDataToDatabase(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salvarPendente]);

  const podeEditar = !!user;

  const marcarTopico = (subjectId: string | number, topic: Topic) => {
    if (!podeEditar) return;
    updateTopicProgress(subjectId, topic.id, "isDone", !topic.isDone);
  };

  // Totais gerais
  const totais = useMemo(() => {
    let concluidos = 0;
    let total = 0;
    let tentativas = 0;
    let acertos = 0;
    let erros = 0;
    disciplinas.forEach((d) => {
      total += d.topics.length;
      concluidos += d.topics.filter((t) => t.isDone).length;
      const s = userStats[d.id.toString()] || vazio;
      tentativas += s.totalAttempts;
      acertos += s.correctAnswers;
      erros += s.wrongAnswers;
    });
    return { concluidos, total, tentativas, acertos, erros };
  }, [disciplinas, userStats]);

  // Tópicos visíveis de cada disciplina, depois de busca, filtro e ordenação
  const termo = normalizar(busca);
  const filtrando = termo !== "" || status !== "todos";
  const visiveis = useMemo(
    () =>
      disciplinas.map((d) => {
        let lista: TopicoVisivel[] = d.topics.map((topic) => ({
          topic,
          importancia: importanceStats[`${d.id}-${topic.id - 1}`]?.percentage ?? 0,
          stats: topicUserStats[`${d.id}-${topic.id - 1}`] || vazio,
        }));
        if (termo) lista = lista.filter((x) => normalizar(x.topic.topic).includes(termo));
        if (status === "pendentes") lista = lista.filter((x) => !x.topic.isDone);
        if (status === "concluidos") lista = lista.filter((x) => x.topic.isDone);
        if (status === "abaixo")
          lista = lista.filter(
            (x) => x.stats.totalAttempts > 0 && Math.round((x.stats.correctAnswers / x.stats.totalAttempts) * 100) < performanceGoal
          );
        if (ordem === "importancia") lista = [...lista].sort((a, b) => b.importancia - a.importancia || a.topic.id - b.topic.id);
        return { disciplina: d, lista };
      }),
    [disciplinas, importanceStats, topicUserStats, termo, status, ordem, performanceGoal]
  );

  const contagem = useMemo(() => {
    const todos = disciplinas.flatMap((d) => d.topics.map((t) => ({ d, t })));
    return {
      todos: todos.length,
      pendentes: todos.filter((x) => !x.t.isDone).length,
      concluidos: todos.filter((x) => x.t.isDone).length,
      abaixo: todos.filter(({ d, t }) => {
        const s = topicUserStats[`${d.id}-${t.id - 1}`];
        return s && s.totalAttempts > 0 && Math.round((s.correctAnswers / s.totalAttempts) * 100) < performanceGoal;
      }).length,
    };
  }, [disciplinas, topicUserStats, performanceGoal]);

  const mostradas = filtrando ? visiveis.filter((v) => v.lista.length > 0) : visiveis;
  const todasAbertas =
    disciplinas.length > 0 &&
    (filtrando ? recolhidas.size === 0 : disciplinas.every((d) => abertas.has(String(d.id))));

  const alternar = (id: string) =>
    (filtrando ? setRecolhidas : setAbertas)((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  // Primeira carga: tela de espera. Depois disso, as atualizações não escondem a página.
  if ((loading || isLoadingEdital || statsLoading) && subjects.length === 0) {
    return <Carregando texto="Carregando o edital..." />;
  }

  if (hasEdital === false || (!loading && subjects.length === 0)) {
    return (
      <EstadoVazio
        icone={FileX}
        titulo="Edital ainda não disponível"
        texto="Este curso ainda não tem um edital verticalizado. Assim que ele for publicado, você poderá acompanhar seu progresso tópico por tópico aqui."
      />
    );
  }

  const statusSalvar = !podeEditar ? null : saveStatus === "error" ? (
    <button
      type="button"
      onClick={() => saveAllDataToDatabase()}
      className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
    >
      <AlertCircle className="h-3.5 w-3.5" /> Não foi possível salvar · Tentar de novo
    </button>
  ) : unsavedChanges || saveStatus === "saving" ? (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Salvando...
    </span>
  ) : (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      <Check className="h-3.5 w-3.5 text-emerald-600" />
      {lastSaveTime ? `Salvo às ${format(parseISO(lastSaveTime), "HH:mm")}` : "Seu progresso é salvo automaticamente"}
    </span>
  );

  return (
    <div className="space-y-5 pb-5">
      <CabecalhoAba
        titulo="Edital verticalizado"
        descricao="Marque os tópicos que já estudou e acompanhe seu desempenho nas questões de cada um."
        acoes={statusSalvar}
      />

      {!podeEditar && (
        <Painel className="flex flex-col gap-3 border-[#5f2ebe]/20 bg-[#5f2ebe]/[0.04] p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-sm text-slate-700">
            <b className="font-semibold">Entre na sua conta</b> para marcar os tópicos estudados, definir sua meta e a data da prova.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#5f2ebe] px-4 py-2 text-sm font-medium text-white hover:bg-[#4f25a0]"
          >
            <LogIn className="h-4 w-4" /> Entrar
          </Link>
        </Painel>
      )}

      <ResumoEdital
        concluidos={totais.concluidos}
        totalTopicos={totais.total}
        tentativas={totais.tentativas}
        acertos={totais.acertos}
        erros={totais.erros}
        meta={performanceGoal}
        onMeta={(v) => {
          updatePerformanceGoal(v);
          setSalvarPendente((n) => n + 1);
        }}
        dataProva={examDate}
        onDataProva={(d) => {
          updateExamDate(d);
          setSalvarPendente((n) => n + 1);
        }}
        podeEditar={podeEditar}
      />

      <StatisticsCard subjects={disciplinas} performanceGoal={performanceGoal} />

      {/* Barra de ferramentas: busca, filtros e ordenação */}
      <div className="sticky top-16 z-20 -mx-[10px] bg-[rgb(242,244,246)]/95 px-[10px] py-2 backdrop-blur md:-mx-1 md:px-1">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar tópico..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm outline-none placeholder:text-slate-400 focus:border-[#5f2ebe]/50 focus:ring-2 focus:ring-[#5f2ebe]/10"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Limpar busca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Segmentos<FiltroStatus>
              valor={status}
              onChange={setStatus}
              opcoes={[
                { valor: "todos", rotulo: "Todos", contagem: contagem.todos },
                { valor: "pendentes", rotulo: "Pendentes", contagem: contagem.pendentes },
                { valor: "concluidos", rotulo: "Concluídos", contagem: contagem.concluidos },
                { valor: "abaixo", rotulo: "Abaixo da meta", contagem: contagem.abaixo },
              ]}
            />
            <select
              value={ordem}
              onChange={(e) => setOrdem(e.target.value as Ordem)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]/50"
              aria-label="Ordenar tópicos"
            >
              <option value="edital">Ordem do edital</option>
              <option value="importancia">Mais importantes primeiro</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setRecolhidas(todasAbertas ? new Set(disciplinas.map((d) => String(d.id))) : new Set());
                setAbertas(todasAbertas ? new Set() : new Set(disciplinas.map((d) => String(d.id))));
              }}
              className="flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
            >
              {todasAbertas ? <ChevronsDownUp className="h-4 w-4" /> : <ChevronsUpDown className="h-4 w-4" />}
              <span className="hidden sm:inline">{todasAbertas ? "Recolher todas" : "Expandir todas"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {mostradas.map(({ disciplina, lista }) => {
          const id = String(disciplina.id);
          return (
            <DisciplinaEdital
              key={id}
              subject={disciplina}
              topicos={lista}
              totalTopicos={disciplina.topics.length}
              concluidos={disciplina.topics.filter((t) => t.isDone).length}
              importancia={importanceStats[id]}
              stats={userStats[id]}
              meta={performanceGoal}
              aberta={filtrando ? !recolhidas.has(id) : abertas.has(id)}
              onAlternar={() => alternar(id)}
              onMarcar={(topic) => marcarTopico(disciplina.id, topic)}
              podeEditar={podeEditar}
              filtrando={filtrando}
            />
          );
        })}

        {filtrando && mostradas.length === 0 && (
          <Painel className="p-8 text-center">
            <p className="text-sm text-slate-500">Nenhum tópico encontrado com esses filtros.</p>
            <button
              type="button"
              onClick={() => {
                setBusca("");
                setStatus("todos");
              }}
              className={cn("mt-3 text-sm font-medium text-[#5f2ebe] hover:underline")}
            >
              Limpar filtros
            </button>
          </Painel>
        )}
      </div>
    </div>
  );
};
