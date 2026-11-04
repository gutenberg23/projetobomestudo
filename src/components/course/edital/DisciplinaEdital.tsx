import React from "react";
import { Check, ChevronDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Subject, Topic } from "../types/editorialized";
import type { ImportanceStats, UserAnswerStats } from "@/hooks/useSubjectImportanceStats";
import { BarraProgresso, Painel, tomAproveitamento } from "../ui";

const vazio: UserAnswerStats = { totalAttempts: 0, correctAnswers: 0, wrongAnswers: 0 };

export interface TopicoVisivel {
  topic: Topic;
  importancia: number;
  stats: UserAnswerStats;
}

interface DisciplinaEditalProps {
  subject: Subject;
  topicos: TopicoVisivel[];
  /** Quantos tópicos a disciplina tem ao todo (antes dos filtros). */
  totalTopicos: number;
  concluidos: number;
  importancia: ImportanceStats | undefined;
  stats: UserAnswerStats | undefined;
  meta: number;
  aberta: boolean;
  onAlternar: () => void;
  onMarcar: (topic: Topic) => void;
  podeEditar: boolean;
  filtrando: boolean;
}

const Caixa: React.FC<{ marcada: boolean; desabilitada: boolean; onClick: () => void; titulo: string }> = ({
  marcada,
  desabilitada,
  onClick,
  titulo,
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={marcada}
    aria-label={titulo}
    title={desabilitada ? "Entre na sua conta para marcar seu progresso" : titulo}
    disabled={desabilitada}
    onClick={onClick}
    className={cn(
      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
      marcada ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-300 bg-white hover:border-[#5f2ebe]",
      desabilitada && "cursor-not-allowed opacity-60 hover:border-slate-300"
    )}
  >
    {marcada && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
  </button>
);

export const DisciplinaEdital: React.FC<DisciplinaEditalProps> = ({
  subject,
  topicos,
  totalTopicos,
  concluidos,
  importancia,
  stats = vazio,
  meta,
  aberta,
  onAlternar,
  onMarcar,
  podeEditar,
  filtrando,
}) => {
  const progresso = totalTopicos > 0 ? Math.round((concluidos / totalTopicos) * 100) : 0;
  const aproveitamento = stats.totalAttempts > 0 ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0;
  const tom = tomAproveitamento(aproveitamento, meta, stats.totalAttempts);
  const completa = totalTopicos > 0 && concluidos === totalTopicos;

  return (
    <Painel className="overflow-hidden">
      <button
        type="button"
        onClick={onAlternar}
        aria-expanded={aberta}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/70 md:px-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h3 className="font-semibold text-slate-900 md:text-[17px]">{subject.name}</h3>
            {completa && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">Concluída</span>
            )}
            {filtrando && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                {topicos.length} de {totalTopicos}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3">
            <BarraProgresso valor={progresso} className="max-w-[220px]" />
            <span className="shrink-0 text-xs tabular-nums text-slate-500">
              {concluidos}/{totalTopicos} tópicos
            </span>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-6 text-right sm:flex">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Importância</p>
            <p className="text-sm font-semibold tabular-nums text-slate-700">{importancia?.percentage ?? 0}%</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Questões</p>
            <p className="text-sm font-semibold tabular-nums text-slate-700">{stats.totalAttempts}</p>
          </div>
          <div className="min-w-[64px]">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">Aproveit.</p>
            <p className={cn("text-sm font-semibold tabular-nums", tom.texto)}>
              {stats.totalAttempts > 0 ? `${aproveitamento}%` : "—"}
            </p>
          </div>
        </div>
        <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums sm:hidden", tom.fundo)}>
          {stats.totalAttempts > 0 ? `${aproveitamento}%` : "—"}
        </span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", aberta && "rotate-180")} />
      </button>

      {aberta && (
        <div className="border-t border-slate-100">
          {/* Cabeçalho das colunas (telas largas) */}
          <div className="hidden grid-cols-[28px_32px_minmax(0,1fr)_110px_64px_64px_64px_96px_104px] items-center gap-3 bg-slate-50/80 px-5 py-2 text-[11px] font-medium uppercase tracking-wide text-slate-400 lg:grid">
            <span />
            <span>#</span>
            <span>Tópico</span>
            <span>Importância</span>
            <span className="text-center">Feitas</span>
            <span className="text-center">Acertos</span>
            <span className="text-center">Erros</span>
            <span className="text-center">Aproveit.</span>
            <span />
          </div>

          {topicos.length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-slate-400">Nenhum tópico desta disciplina corresponde ao filtro.</p>
          )}

          <ul className="divide-y divide-slate-100">
            {topicos.map(({ topic, importancia: imp, stats: st }) => {
              const perf = st.totalAttempts > 0 ? Math.round((st.correctAnswers / st.totalAttempts) * 100) : 0;
              const t = tomAproveitamento(perf, meta, st.totalAttempts);
              const link = topic.link ? (
                <a
                  href={topic.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
                >
                  Questões <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-xs text-slate-300">Sem questões</span>
              );

              return (
                <li
                  key={topic.id}
                  className={cn("px-4 py-3 md:px-5 lg:py-2.5", topic.isDone && "bg-[#5f2ebe]/[0.025]")}
                >
                  {/* Telas largas: linha em colunas */}
                  <div className="hidden grid-cols-[28px_32px_minmax(0,1fr)_110px_64px_64px_64px_96px_104px] items-center gap-3 text-sm lg:grid">
                    <Caixa
                      marcada={topic.isDone}
                      desabilitada={!podeEditar}
                      onClick={() => onMarcar(topic)}
                      titulo={topic.isDone ? "Desmarcar tópico" : "Marcar como concluído"}
                    />
                    <span className="tabular-nums text-slate-400">{topic.id}</span>
                    <span className={cn("leading-snug text-slate-700", topic.isDone && "text-slate-500")}>{topic.topic}</span>
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100">
                        <span className="block h-full rounded-full bg-[#ea2be2]/70" style={{ width: `${Math.min(100, imp * 2.5)}%` }} />
                      </span>
                      <span className="text-xs tabular-nums text-slate-600">{imp}%</span>
                    </span>
                    <span className="text-center tabular-nums text-slate-700">{st.totalAttempts}</span>
                    <span className="text-center tabular-nums text-emerald-600">{st.correctAnswers}</span>
                    <span className="text-center tabular-nums text-red-500">{st.wrongAnswers}</span>
                    <span className="flex justify-center">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", t.fundo)}>
                        {st.totalAttempts > 0 ? `${perf}%` : "—"}
                      </span>
                    </span>
                    <span className="flex justify-end">{link}</span>
                  </div>

                  {/* Celular e tablet: cartão compacto */}
                  <div className="flex gap-3 lg:hidden">
                    <div className="pt-0.5">
                      <Caixa
                        marcada={topic.isDone}
                        desabilitada={!podeEditar}
                        onClick={() => onMarcar(topic)}
                        titulo={topic.isDone ? "Desmarcar tópico" : "Marcar como concluído"}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm leading-snug text-slate-700", topic.isDone && "text-slate-500")}>
                        <span className="mr-1.5 tabular-nums text-slate-400">{topic.id}.</span>
                        {topic.topic}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                        <span>
                          Importância <b className="font-semibold text-slate-700">{imp}%</b>
                        </span>
                        <span>
                          <b className="font-semibold text-slate-700">{st.totalAttempts}</b> feitas
                          {st.totalAttempts > 0 && (
                            <>
                              {" "}
                              (<span className="text-emerald-600">{st.correctAnswers}</span>/
                              <span className="text-red-500">{st.wrongAnswers}</span>)
                            </>
                          )}
                        </span>
                        <span className={cn("rounded-full px-2 py-0.5 font-semibold tabular-nums", t.fundo)}>
                          {st.totalAttempts > 0 ? `${perf}%` : "—"}
                        </span>
                        <span className="ml-auto">{link}</span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Painel>
  );
};
