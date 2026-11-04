import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarClock, CheckCircle2, ClipboardList, FileQuestion, PlayCircle, RotateCcw, Target, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { extractIdFromFriendlyUrl } from "@/utils/slug-utils";
import { cn } from "@/lib/utils";
import { BarraProgresso, CabecalhoAba, Carregando, EstadoVazio, Metrica, Painel, Segmentos, tomAproveitamento } from "../ui";

interface SimuladoLinha {
  id: string;
  titulo: string;
  questoes: number;
  dataInicio: Date | null;
  dataFim: Date | null;
  acertos: number;
  erros: number;
  realizado: boolean;
  feitoEm: Date | null;
}

type Filtro = "todos" | "pendentes" | "realizados";
type Situacao = "realizado" | "disponivel" | "em-breve" | "encerrado";

const situacaoDe = (s: SimuladoLinha, agora: Date): Situacao => {
  if (s.realizado) return "realizado";
  if (s.dataInicio && isBefore(agora, s.dataInicio)) return "em-breve";
  if (s.dataFim && isAfter(agora, s.dataFim)) return "encerrado";
  return "disponivel";
};

const ETIQUETAS: Record<Situacao, { texto: string; classe: string }> = {
  realizado: { texto: "Realizado", classe: "bg-emerald-50 text-emerald-700" },
  disponivel: { texto: "Disponível", classe: "bg-[#5f2ebe]/10 text-[#5f2ebe]" },
  "em-breve": { texto: "Em breve", classe: "bg-sky-50 text-sky-700" },
  encerrado: { texto: "Encerrado", classe: "bg-slate-100 text-slate-500" },
};

const dataCurta = (d: Date) => format(d, "dd/MM/yyyy", { locale: ptBR });

const lerData = (v: string | null | undefined) => {
  if (!v) return null;
  try {
    return parseISO(v);
  } catch {
    return null;
  }
};

export const SimuladosTab: React.FC<{ courseId: string }> = ({ courseId }) => {
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const [simulados, setSimulados] = useState<SimuladoLinha[]>([]);
  const [meta, setMeta] = useState(70);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  useEffect(() => {
    let cancelado = false;
    const carregar = async () => {
      setCarregando(true);
      setErro(false);
      try {
        const realId = extractIdFromFriendlyUrl(courseId);
        const { data, error } = await supabase
          .from("simulados")
          .select("id, titulo, questoes_ids, quantidade_questoes, data_inicio, data_fim, created_at")
          .eq("curso_id", realId)
          .eq("ativo", true)
          .order("created_at", { ascending: true });
        if (error) throw error;

        // Resultados do aluno numa consulta só
        const resultados = new Map<string, { acertos: number; erros: number; updated_at?: string; created_at?: string }>();
        if (user && data && data.length > 0) {
          // Tabela fora dos tipos gerados em algumas versões; o formato da linha está em Resultado
          type Resultado = { simulado_id: string; acertos: number; erros: number; created_at?: string; updated_at?: string };
          const { data: res } = await supabase
            .from("user_simulado_results")
            .select("simulado_id, acertos, erros, created_at, updated_at")
            .eq("user_id", user.id)
            .in(
              "simulado_id",
              data.map((s) => s.id)
            );
          ((res || []) as Resultado[]).forEach((r) => resultados.set(r.simulado_id, r));

          const { data: progresso } = await supabase
            .from("user_course_progress")
            .select("performance_goal")
            .eq("user_id", user.id)
            .eq("course_id", realId)
            .maybeSingle();
          if (progresso?.performance_goal && !cancelado) setMeta(Number(progresso.performance_goal));
        }

        if (cancelado) return;
        setSimulados(
          (data || []).map((s) => {
            const r = resultados.get(s.id);
            return {
              id: s.id,
              titulo: s.titulo,
              questoes: s.questoes_ids?.length || s.quantidade_questoes || 0,
              dataInicio: lerData(s.data_inicio),
              dataFim: lerData(s.data_fim),
              acertos: r?.acertos || 0,
              erros: r?.erros || 0,
              realizado: !!r,
              feitoEm: lerData(r?.updated_at || r?.created_at),
            };
          })
        );
      } catch (e) {
        console.error("Erro ao carregar simulados:", e);
        if (!cancelado) setErro(true);
      } finally {
        if (!cancelado) setCarregando(false);
      }
    };
    carregar();
    return () => {
      cancelado = true;
    };
  }, [courseId, user]);

  const agora = new Date();
  const feitos = simulados.filter((s) => s.realizado);
  const resumo = useMemo(() => {
    const questoes = feitos.reduce((a, s) => a + s.questoes, 0);
    const acertos = feitos.reduce((a, s) => a + s.acertos, 0);
    const melhor = feitos.reduce<SimuladoLinha | null>((m, s) => {
      const p = s.questoes > 0 ? s.acertos / s.questoes : 0;
      const pm = m && m.questoes > 0 ? m.acertos / m.questoes : -1;
      return p > pm ? s : m;
    }, null);
    return {
      questoes,
      acertos,
      erros: feitos.reduce((a, s) => a + s.erros, 0),
      aproveitamento: questoes > 0 ? Math.round((acertos / questoes) * 100) : 0,
      melhor,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simulados]);

  const lista = simulados.filter((s) => (filtro === "todos" ? true : filtro === "realizados" ? s.realizado : !s.realizado));
  const mostrarRanking = config.pages.showSimuladoRankingPage;

  if (carregando) return <Carregando texto="Carregando simulados..." />;

  if (erro) {
    return <EstadoVazio icone={FileQuestion} titulo="Não foi possível carregar os simulados" texto="Verifique sua conexão e recarregue a página." />;
  }

  if (simulados.length === 0) {
    return (
      <EstadoVazio
        icone={ClipboardList}
        titulo="Nenhum simulado por enquanto"
        texto="Quando houver simulados para este curso, eles aparecem aqui com seu resultado e sua posição no ranking."
      />
    );
  }

  const tomGeral = tomAproveitamento(resumo.aproveitamento, meta, resumo.questoes);

  return (
    <div className="space-y-5 pb-5">
      <CabecalhoAba
        titulo="Simulados"
        descricao="Treine com provas completas, compare seu resultado com a sua meta e veja sua posição no ranking."
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <Metrica
          rotulo="Realizados"
          valor={
            <>
              {feitos.length}
              <span className="text-base font-medium text-slate-400">/{simulados.length}</span>
            </>
          }
          icone={CheckCircle2}
          detalhe={feitos.length === simulados.length ? "Você fez todos os simulados!" : `${simulados.length - feitos.length} para fazer`}
        >
          <BarraProgresso valor={(feitos.length / simulados.length) * 100} corClasse="bg-gradient-to-r from-[#5f2ebe] to-[#ea2be2]" />
        </Metrica>
        <Metrica
          rotulo="Questões respondidas"
          valor={resumo.questoes.toLocaleString("pt-BR")}
          icone={FileQuestion}
          tom="azul"
          detalhe={
            <span className="flex gap-3">
              <span>
                <b className="font-semibold text-emerald-600">{resumo.acertos}</b> acertos
              </span>
              <span>
                <b className="font-semibold text-red-500">{resumo.erros}</b> erros
              </span>
            </span>
          }
        />
        <Metrica
          rotulo="Aproveitamento médio"
          valor={<span className={resumo.questoes > 0 ? tomGeral.texto : "text-slate-400"}>{resumo.questoes > 0 ? `${resumo.aproveitamento}%` : "—"}</span>}
          icone={Target}
          tom={resumo.questoes === 0 ? "cinza" : resumo.aproveitamento >= meta ? "verde" : "laranja"}
          detalhe={`Sua meta: ${meta}%`}
        >
          <BarraProgresso valor={resumo.aproveitamento} corClasse={tomGeral.barra} marca={meta} />
        </Metrica>
        <Metrica
          rotulo="Melhor resultado"
          valor={
            resumo.melhor && resumo.melhor.questoes > 0 ? (
              `${Math.round((resumo.melhor.acertos / resumo.melhor.questoes) * 100)}%`
            ) : (
              <span className="text-slate-400">—</span>
            )
          }
          icone={Trophy}
          tom="rosa"
          detalhe={resumo.melhor ? <span className="line-clamp-1">{resumo.melhor.titulo}</span> : "Faça um simulado para começar"}
        />
      </div>

      {!user && (
        <Painel className="border-[#5f2ebe]/20 bg-[#5f2ebe]/[0.04] p-4 text-sm text-slate-700">
          <Link to="/login" className="font-semibold text-[#5f2ebe] hover:underline">
            Entre na sua conta
          </Link>{" "}
          para fazer os simulados e guardar seus resultados.
        </Painel>
      )}

      <Segmentos<Filtro>
        valor={filtro}
        onChange={setFiltro}
        opcoes={[
          { valor: "todos", rotulo: "Todos", contagem: simulados.length },
          { valor: "pendentes", rotulo: "Para fazer", contagem: simulados.length - feitos.length },
          { valor: "realizados", rotulo: "Realizados", contagem: feitos.length },
        ]}
      />

      <div className="grid gap-3 md:grid-cols-2">
        {lista.map((s) => {
          const situacao = situacaoDe(s, agora);
          const etiqueta = ETIQUETAS[situacao];
          const perf = s.questoes > 0 ? Math.round((s.acertos / s.questoes) * 100) : 0;
          const tom = tomAproveitamento(perf, meta, s.realizado ? 1 : 0);
          const bloqueado = situacao === "em-breve";

          return (
            <Painel key={s.id} className="flex flex-col p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold leading-snug text-slate-900">{s.titulo}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                    <span>
                      {s.questoes} {s.questoes === 1 ? "questão" : "questões"}
                    </span>
                    {(s.dataInicio || s.dataFim) && (
                      <span className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {s.dataInicio && s.dataFim
                          ? `${dataCurta(s.dataInicio)} a ${dataCurta(s.dataFim)}`
                          : s.dataInicio
                            ? `A partir de ${dataCurta(s.dataInicio)}`
                            : `Até ${dataCurta(s.dataFim as Date)}`}
                      </span>
                    )}
                  </p>
                </div>
                <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium", etiqueta.classe)}>{etiqueta.texto}</span>
              </div>

              {s.realizado ? (
                <div className="mt-4 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className={cn("text-2xl font-bold tabular-nums", tom.texto)}>{perf}%</p>
                      <p className="text-xs text-slate-500">
                        <span className="text-emerald-600">{s.acertos} acertos</span> ·{" "}
                        <span className="text-red-500">{s.erros} erros</span>
                        {s.feitoEm && <> · feito em {dataCurta(s.feitoEm)}</>}
                      </p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", tom.fundo)}>
                      {perf >= meta ? "Acima da meta" : `${meta - perf} p.p. abaixo da meta`}
                    </span>
                  </div>
                  <BarraProgresso valor={perf} corClasse={tom.barra} marca={meta} className="mt-3" />
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">
                  {bloqueado && s.dataInicio
                    ? `Este simulado abre em ${format(s.dataInicio, "dd 'de' MMMM", { locale: ptBR })}.`
                    : situacao === "encerrado"
                      ? "O período deste simulado terminou, mas você ainda pode treinar com ele."
                      : "Você ainda não fez este simulado. Reserve um tempo sem interrupções e comece quando quiser."}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                {s.realizado ? (
                  <>
                    {mostrarRanking && (
                      <Link
                        to={`/simulado-ranking/${s.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-[#5f2ebe] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#4f25a0]"
                      >
                        <Trophy className="h-4 w-4" /> Ver ranking
                      </Link>
                    )}
                    <Link
                      to={`/simulado/${s.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
                    >
                      <RotateCcw className="h-4 w-4" /> Revisar / refazer
                    </Link>
                  </>
                ) : bloqueado ? (
                  <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg bg-slate-100 px-3.5 py-2 text-sm font-medium text-slate-400">
                    <PlayCircle className="h-4 w-4" /> Em breve
                  </span>
                ) : (
                  <Link
                    to={user ? `/simulado/${s.id}` : "/login"}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#5f2ebe] px-3.5 py-2 text-sm font-medium text-white hover:bg-[#4f25a0]"
                  >
                    <PlayCircle className="h-4 w-4" /> {user ? "Fazer simulado" : "Entrar para fazer"}
                  </Link>
                )}
              </div>
            </Painel>
          );
        })}
        {lista.length === 0 && (
          <Painel className="p-8 text-center text-sm text-slate-500 md:col-span-2">
            {filtro === "realizados" ? "Você ainda não fez nenhum simulado." : "Você já fez todos os simulados deste curso. 🎉"}
          </Painel>
        )}
      </div>
    </div>
  );
};
