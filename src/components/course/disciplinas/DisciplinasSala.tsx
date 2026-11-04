import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, ChevronDown, ChevronRight, ListVideo, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarraProgresso, Carregando, EstadoVazio, Painel, normalizar } from "../ui";
import { useDisciplinasCurso, type AulaCurso, type DisciplinaCurso, type Linha, type TopicoCurso } from "./useDisciplinasCurso";
import { proximoPendente, ultimoTopico, useProgressoTopicos, type ProgressoTopicos } from "./useProgressoTopicos";
import { AnelProgresso, MarcaConcluido, MateriaisTopico, QuestoesTopico, VideoTopico } from "./PlayerTopico";

interface Props {
  courseId: string;
  onSubjectsCountChange?: (count: number, data?: Linha[]) => void;
}

interface Posicao {
  disciplina: DisciplinaCurso;
  aula: AulaCurso;
  topico: TopicoCurso;
}

/**
 * Aba Disciplinas, versão "Sala de estudo": o player fica em destaque e o conteúdo do curso
 * vira uma trilha lateral (disciplina > aula > tópico), com anterior/próximo atravessando
 * aulas e disciplinas. O aluno abre a aba já no ponto onde parou.
 */
export const DisciplinasSala: React.FC<Props> = ({ courseId, onSubjectsCountChange }) => {
  const { disciplinas, carregando, erro } = useDisciplinasCurso(courseId, (linhas) => onSubjectsCountChange?.(linhas.length, linhas));
  const progresso = useProgressoTopicos(courseId, disciplinas);
  const [atual, setAtual] = useState<{ aulaId: string; topicoId: string } | null>(null);
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [questoes, setQuestoes] = useState(false);
  const [listaMobile, setListaMobile] = useState(false);

  // Todos os tópicos em ordem, para anterior/próximo
  const sequencia = useMemo<Posicao[]>(
    () => disciplinas.flatMap((d) => d.aulas.flatMap((a) => a.topicos.map((t) => ({ disciplina: d, aula: a, topico: t })))),
    [disciplinas]
  );

  // Abre no último tópico visto; se não houver, no primeiro pendente
  useEffect(() => {
    if (atual || !progresso.carregado || sequencia.length === 0) return;
    const salvo = ultimoTopico.ler(courseId);
    const inicial =
      (salvo && sequencia.find((p) => p.aula.id === salvo.aulaId && p.topico.id === salvo.topicoId)) ||
      proximoPendente(disciplinas, progresso) ||
      sequencia[0];
    setAtual({ aulaId: inicial.aula.id, topicoId: inicial.topico.id });
    setAbertas(new Set([inicial.disciplina.id]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progresso.carregado, sequencia]);

  const idx = atual ? sequencia.findIndex((p) => p.aula.id === atual.aulaId && p.topico.id === atual.topicoId) : -1;
  const pos = idx >= 0 ? sequencia[idx] : null;
  const anterior = idx > 0 ? sequencia[idx - 1] : null;
  const proximo = idx >= 0 && idx < sequencia.length - 1 ? sequencia[idx + 1] : null;

  useEffect(() => setQuestoes(false), [atual?.topicoId]);

  const ir = (p: Posicao, rolar = true) => {
    setAtual({ aulaId: p.aula.id, topicoId: p.topico.id });
    setAbertas((s) => new Set(s).add(p.disciplina.id));
    ultimoTopico.salvar(courseId, p.aula.id, p.topico.id);
    setListaMobile(false);
    if (rolar) document.getElementById("sala-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (carregando) return <Carregando texto="Carregando disciplinas..." />;
  if (erro)
    return <EstadoVazio icone={BookOpen} titulo="Não foi possível carregar as disciplinas" texto="Verifique sua conexão e recarregue a página." />;
  if (sequencia.length === 0)
    return <EstadoVazio icone={BookOpen} titulo="Nenhuma aula por aqui" texto="Quando o curso tiver aulas cadastradas, elas aparecem nesta aba." />;

  const feito = pos ? progresso.feito(pos.aula.id, pos.topico.id) : false;
  const numAula = pos ? pos.disciplina.aulas.indexOf(pos.aula) + 1 : 0;
  const numTopico = pos ? pos.aula.topicos.indexOf(pos.topico) + 1 : 0;

  return (
    <div className="pb-10 pt-5">
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Player */}
        <section id="sala-player" className="min-w-0 scroll-mt-4 space-y-4">
          {pos && (
            <>
              <div className="min-w-0">
                <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500" aria-label="Você está em">
                  <span className="font-medium text-[#5f2ebe]">{pos.disciplina.titulo}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>
                    Aula {numAula} de {pos.disciplina.aulas.length}
                  </span>
                  <ChevronRight className="h-3 w-3" />
                  <span>
                    Tópico {numTopico} de {pos.aula.topicos.length}
                  </span>
                </nav>
                <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{pos.aula.titulo}</h2>
                {pos.aula.descricao && (
                  <p className="mt-1 text-sm text-slate-500">
                    <span className="font-medium text-slate-600">No edital:</span> {pos.aula.descricao}
                  </p>
                )}
              </div>

              <Painel className="overflow-hidden p-2 sm:p-3">
                <VideoTopico topico={pos.topico} />
                <div className="flex flex-col gap-3 px-1 pb-1 pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">{pos.topico.nome}</h3>
                    {pos.topico.professorNome && <p className="text-xs text-slate-500">Prof. {pos.topico.professorNome}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => progresso.alternar(pos.aula.id, pos.topico.id)}
                    className={cn(
                      "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      feito ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {feito ? "Concluído" : "Marcar como concluído"}
                  </button>
                </div>
              </Painel>

              <MateriaisTopico topico={pos.topico} questoesAbertas={questoes} onQuestoes={() => setQuestoes((v) => !v)} />

              {questoes && (
                <Painel className="p-3 sm:p-4">
                  <QuestoesTopico topicoId={pos.topico.id} />
                </Painel>
              )}

              {/* Anterior / próximo */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!anterior}
                  onClick={() => anterior && ir(anterior)}
                  className="group flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-[#5f2ebe]/40 disabled:pointer-events-none disabled:opacity-40"
                >
                  <ArrowLeft className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-[#5f2ebe]" />
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-wide text-slate-400">Anterior</span>
                    <span className="line-clamp-1 text-sm font-medium text-slate-700">{anterior?.topico.nome || "Início do curso"}</span>
                  </span>
                </button>
                <button
                  type="button"
                  disabled={!proximo}
                  onClick={() => {
                    if (!proximo) return;
                    if (!feito) progresso.alternar(pos.aula.id, pos.topico.id, true);
                    ir(proximo);
                  }}
                  className="group flex min-w-0 items-center justify-end gap-3 rounded-2xl bg-[#5f2ebe] p-3 text-right text-white shadow-sm transition-colors hover:bg-[#4f25a0] disabled:pointer-events-none disabled:opacity-40"
                >
                  <span className="min-w-0">
                    <span className="block text-[11px] uppercase tracking-wide text-white/70">{feito ? "Próximo" : "Concluir e avançar"}</span>
                    <span className="line-clamp-1 text-sm font-semibold">{proximo?.topico.nome || "Fim do curso"}</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </button>
              </div>
            </>
          )}
        </section>

        {/* Trilha do curso */}
        <aside className="min-w-0 lg:sticky lg:top-4">
          <Painel className="overflow-hidden">
            <button
              type="button"
              onClick={() => setListaMobile((v) => !v)}
              className="flex w-full items-center gap-3 border-b border-slate-100 p-4 text-left lg:pointer-events-none"
              aria-expanded={listaMobile}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
                <ListVideo className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">Conteúdo do curso</span>
                <span className="block text-xs text-slate-500">
                  {progresso.totais.feitos} de {progresso.totais.total} tópicos · {progresso.totais.percentual}%
                </span>
                <BarraProgresso valor={progresso.totais.percentual} className="mt-1.5 h-1.5" corClasse="bg-gradient-to-r from-[#5f2ebe] to-[#ea2be2]" />
              </span>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform lg:hidden", listaMobile && "rotate-180")} />
            </button>

            <div className={cn(listaMobile ? "block" : "hidden", "lg:block")}>
              <div className="border-b border-slate-100 p-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar aula ou tópico"
                    className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm outline-none transition focus:border-[#5f2ebe] focus:bg-white focus:ring-2 focus:ring-[#5f2ebe]/15"
                  />
                  {busca && (
                    <button
                      type="button"
                      aria-label="Limpar busca"
                      onClick={() => setBusca("")}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <Trilha
                disciplinas={disciplinas}
                busca={normalizar(busca)}
                abertas={abertas}
                onAlternar={(id) =>
                  setAbertas((s) => {
                    const n = new Set(s);
                    if (n.has(id)) n.delete(id);
                    else n.add(id);
                    return n;
                  })
                }
                atual={atual}
                onIr={(p) => ir(p)}
                progresso={progresso}
              />
            </div>
          </Painel>
        </aside>
      </div>
    </div>
  );
};

const Trilha: React.FC<{
  disciplinas: DisciplinaCurso[];
  busca: string;
  abertas: Set<string>;
  onAlternar: (id: string) => void;
  atual: { aulaId: string; topicoId: string } | null;
  onIr: (p: Posicao) => void;
  progresso: ProgressoTopicos;
}> = ({ disciplinas, busca, abertas, onAlternar, atual, onIr, progresso }) => {
  const [aulaVista, setAulaVista] = useState<string | null>(null);
  // A aula em reprodução mostra seus tópicos; outra aula pode ser espiada com um clique
  const aulaExpandida = aulaVista ?? atual?.aulaId ?? null;
  useEffect(() => setAulaVista(null), [atual?.aulaId]);

  const itens = disciplinas
    .map((d) => {
      if (!busca || normalizar(d.titulo).includes(busca)) return { d, aulas: d.aulas };
      const aulas = d.aulas.filter((a) => normalizar(a.titulo).includes(busca) || a.topicos.some((t) => normalizar(t.nome).includes(busca)));
      return aulas.length ? { d, aulas } : null;
    })
    .filter(Boolean) as Array<{ d: DisciplinaCurso; aulas: AulaCurso[] }>;

  if (itens.length === 0) return <p className="px-4 py-8 text-center text-sm text-slate-500">Nada encontrado.</p>;

  return (
    <div className="lg:max-h-[calc(100vh-190px)] lg:overflow-y-auto">
      {itens.map(({ d, aulas }) => {
        const total = d.aulas.reduce((s, a) => s + a.topicos.length, 0);
        const feitos = d.aulas.reduce((s, a) => s + progresso.feitosNaAula(a), 0);
        const pct = total ? Math.round((feitos / total) * 100) : 0;
        const aberta = abertas.has(d.id) || !!busca;
        return (
          <div key={d.id} className="border-b border-slate-100 last:border-b-0">
            <button
              type="button"
              onClick={() => onAlternar(d.id)}
              aria-expanded={aberta}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
            >
              <AnelProgresso valor={pct} tamanho={36} espessura={4}>
                <span className="text-[9px]">{pct}%</span>
              </AnelProgresso>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold leading-snug text-slate-900">{d.titulo}</span>
                <span className="flex items-center gap-2 text-[11px] text-slate-500">
                  {feitos}/{total} tópicos
                  {d.relevancia !== null && (
                    <span className="inline-flex items-center gap-0.5 text-amber-600" title="Relevância para a prova">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {d.relevancia}
                    </span>
                  )}
                </span>
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", aberta && "rotate-180")} />
            </button>

            {aberta && (
              <ol className="pb-2">
                {aulas.map((a) => {
                  const n = progresso.feitosNaAula(a);
                  const completa = a.topicos.length > 0 && n === a.topicos.length;
                  const tocando = atual?.aulaId === a.id;
                  const expandida = aulaExpandida === a.id || (!!busca && a.topicos.some((t) => normalizar(t.nome).includes(busca)));
                  return (
                    <li key={a.id} className="px-2">
                      <button
                        type="button"
                        onClick={() => setAulaVista(expandida && !tocando ? atual?.aulaId ?? null : a.id)}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors",
                          tocando ? "bg-[#5f2ebe]/[0.06]" : "hover:bg-slate-50"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                            completa ? "bg-emerald-500 text-white" : n > 0 ? "bg-[#5f2ebe]/15 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {completa ? <CheckCircle2 className="h-3.5 w-3.5" /> : d.aulas.indexOf(a) + 1}
                        </span>
                        <span className={cn("min-w-0 flex-1 text-[13px] leading-snug", tocando ? "font-semibold text-[#5f2ebe]" : "text-slate-700")}>
                          {a.titulo}
                        </span>
                        <span className="shrink-0 text-[11px] tabular-nums text-slate-400">
                          {n}/{a.topicos.length}
                        </span>
                      </button>
                      {expandida && a.topicos.length > 0 && (
                        <ul className="mb-1 ml-[18px] border-l border-slate-200 py-1 pl-3">
                          {a.topicos.map((t) => {
                            const sel = atual?.aulaId === a.id && atual.topicoId === t.id;
                            const ok = progresso.feito(a.id, t.id);
                            return (
                              <li key={t.id}>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => onIr({ disciplina: d, aula: a, topico: t })}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                      e.preventDefault();
                                      onIr({ disciplina: d, aula: a, topico: t });
                                    }
                                  }}
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors",
                                    sel ? "bg-[#5f2ebe] text-white" : "hover:bg-slate-50"
                                  )}
                                >
                                  <MarcaConcluido tamanho="sm" marcado={ok} onClick={() => progresso.alternar(a.id, t.id)} rotulo={`Concluir ${t.nome}`} />
                                  <span className={cn("min-w-0 flex-1 text-[13px] leading-snug", sel ? "font-medium" : ok ? "text-slate-400" : "text-slate-600")}>
                                    {t.nome}
                                  </span>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
};
