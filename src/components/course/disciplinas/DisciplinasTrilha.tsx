import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronDown, FileText, Layers, PartyPopper, PlayCircle, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarraProgresso, CabecalhoAba, Carregando, EstadoVazio, Painel, Segmentos, normalizar } from "../ui";
import { useDisciplinasCurso, type Linha, type AulaCurso, type DisciplinaCurso, type TopicoCurso } from "./useDisciplinasCurso";
import { proximoPendente, ultimoTopico, useProgressoTopicos, type ProgressoTopicos } from "./useProgressoTopicos";
import { AnelProgresso, MarcaConcluido, MateriaisTopico, QuestoesTopico, VideoTopico } from "./PlayerTopico";

type Filtro = "todas" | "andamento" | "naoIniciadas" | "concluidas";

interface Props {
  courseId: string;
  onSubjectsCountChange?: (count: number, data?: Linha[]) => void;
  /** Quantidade de flashcards de cada tópico neste curso */
  flashcardsPorTopico?: Record<string, number>;
  /** Abre a aba Flashcards nos cartões do tópico */
  onFlashcards?: (topicoId: string, aulaId: string) => void;
}

/**
 * Aba Disciplinas, versão "Trilha": a lista de disciplinas continua no centro, agora com
 * progresso por disciplina e por aula, busca, filtros e um atalho para continuar de onde parou.
 */
export const DisciplinasTrilha: React.FC<Props> = ({ courseId, onSubjectsCountChange, flashcardsPorTopico = {}, onFlashcards }) => {
  const { disciplinas, isCurso, carregando, erro } = useDisciplinasCurso(courseId, (linhas) =>
    onSubjectsCountChange?.(linhas.length, linhas)
  );
  const progresso = useProgressoTopicos(courseId, disciplinas);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());
  const [aulaAberta, setAulaAberta] = useState<string | null>(null);
  const [topicoPorAula, setTopicoPorAula] = useState<Record<string, string>>({});

  // Disciplina avulsa: já começa aberta
  useEffect(() => {
    if (!isCurso && disciplinas.length === 1) setAbertas(new Set([disciplinas[0].id]));
  }, [isCurso, disciplinas]);

  const statsDisciplina = (d: DisciplinaCurso) => {
    const total = d.aulas.reduce((s, a) => s + a.topicos.length, 0);
    const feitos = d.aulas.reduce((s, a) => s + progresso.feitosNaAula(a), 0);
    return { total, feitos, pct: total > 0 ? Math.round((feitos / total) * 100) : 0 };
  };

  const situacao = (d: DisciplinaCurso): Exclude<Filtro, "todas"> => {
    const s = statsDisciplina(d);
    if (s.total > 0 && s.feitos === s.total) return "concluidas";
    return s.feitos > 0 ? "andamento" : "naoIniciadas";
  };

  const contagem = useMemo(() => {
    const c = { todas: disciplinas.length, andamento: 0, naoIniciadas: 0, concluidas: 0 };
    disciplinas.forEach((d) => c[situacao(d)]++);
    return c;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplinas, progresso.concluidos]);

  const aulasConcluidas = useMemo(
    () => disciplinas.reduce((s, d) => s + d.aulas.filter((a) => a.topicos.length > 0 && progresso.feitosNaAula(a) === a.topicos.length).length, 0),
    [disciplinas, progresso]
  );
  const totalAulas = disciplinas.reduce((s, d) => s + d.aulas.length, 0);

  // Ponto para continuar: último tópico aberto, se ainda pendente; senão o primeiro pendente
  const continuar = useMemo(() => {
    const ultimo = ultimoTopico.ler(courseId);
    if (ultimo) {
      for (const d of disciplinas)
        for (const a of d.aulas)
          if (a.id === ultimo.aulaId) {
            const t = a.topicos.find((x) => x.id === ultimo.topicoId);
            if (t && !progresso.feito(a.id, t.id)) return { disciplina: d, aula: a, topico: t };
          }
    }
    return proximoPendente(disciplinas, progresso);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplinas, progresso.concluidos, courseId]);

  const termo = normalizar(busca);
  const visiveis = useMemo(() => {
    return disciplinas
      .filter((d) => filtro === "todas" || situacao(d) === filtro)
      .map((d) => {
        if (!termo) return { disciplina: d, aulas: d.aulas };
        if (normalizar(d.titulo).includes(termo)) return { disciplina: d, aulas: d.aulas };
        const aulas = d.aulas.filter(
          (a) =>
            normalizar(a.titulo).includes(termo) ||
            normalizar(a.descricao).includes(termo) ||
            a.topicos.some((t) => normalizar(t.nome).includes(termo))
        );
        return aulas.length ? { disciplina: d, aulas } : null;
      })
      .filter(Boolean) as Array<{ disciplina: DisciplinaCurso; aulas: AulaCurso[] }>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplinas, filtro, termo, progresso.concluidos]);

  const abrirTopico = (d: DisciplinaCurso, a: AulaCurso, t: TopicoCurso) => {
    setAbertas((p) => new Set(p).add(d.id));
    setAulaAberta(a.id);
    setTopicoPorAula((p) => ({ ...p, [a.id]: t.id }));
    ultimoTopico.salvar(courseId, a.id, t.id);
    setTimeout(() => document.getElementById(`aula-${a.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  if (carregando) return <Carregando texto="Carregando disciplinas..." />;
  if (erro)
    return <EstadoVazio icone={BookOpen} titulo="Não foi possível carregar as disciplinas" texto="Verifique sua conexão e recarregue a página." />;
  if (disciplinas.length === 0)
    return <EstadoVazio icone={BookOpen} titulo="Nenhuma disciplina por aqui" texto="Quando o curso tiver disciplinas cadastradas, elas aparecem nesta aba." />;

  const tudoAberto = visiveis.length > 0 && visiveis.every((v) => abertas.has(v.disciplina.id));

  return (
    <div className="space-y-5 pb-10 pt-5">
      <CabecalhoAba
        titulo="Disciplinas"
        descricao="Assista às aulas, marque os tópicos que concluir e acompanhe seu avanço em cada disciplina."
      />

      {/* Resumo + continuar */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Painel className="flex items-center gap-4 p-4 sm:p-5">
          <AnelProgresso valor={progresso.totais.percentual} tamanho={76} espessura={7}>
            <span className="text-base">{progresso.totais.percentual}%</span>
          </AnelProgresso>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Seu progresso no curso</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {progresso.totais.feitos} <span className="font-medium text-slate-400">de {progresso.totais.total} tópicos</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {aulasConcluidas}/{totalAulas} aulas
              </span>
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-[#5f2ebe]" />
                {contagem.concluidas}/{disciplinas.length} disciplinas
              </span>
            </div>
          </div>
        </Painel>

        {continuar ? (
          <Painel className="relative overflow-hidden p-4 sm:p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/15" />
            <p className="text-xs font-medium uppercase tracking-wide text-[#5f2ebe]">
              {progresso.totais.feitos > 0 ? "Continue de onde parou" : "Comece por aqui"}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {continuar.disciplina.titulo} · {continuar.aula.titulo}
            </p>
            <p className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-slate-900">{continuar.topico.nome}</p>
            <button
              type="button"
              onClick={() => abrirTopico(continuar.disciplina, continuar.aula, continuar.topico)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4f25a0]"
            >
              <PlayCircle className="h-4 w-4" />
              {progresso.totais.feitos > 0 ? "Continuar" : "Começar"}
            </button>
          </Painel>
        ) : (
          <Painel className="flex items-center gap-4 p-4 sm:p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <PartyPopper className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">Você concluiu todos os tópicos!</p>
              <p className="text-sm text-slate-500">Agora é revisar e treinar com questões e simulados.</p>
            </div>
          </Painel>
        )}
      </div>

      {/* Busca e filtros */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar disciplina, aula ou tópico"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/15"
          />
          {busca && (
            <button
              type="button"
              aria-label="Limpar busca"
              onClick={() => setBusca("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmentos<Filtro>
            valor={filtro}
            onChange={setFiltro}
            opcoes={[
              { valor: "todas", rotulo: "Todas", contagem: contagem.todas },
              { valor: "andamento", rotulo: "Em andamento", contagem: contagem.andamento },
              { valor: "naoIniciadas", rotulo: "Não iniciadas", contagem: contagem.naoIniciadas },
              { valor: "concluidas", rotulo: "Concluídas", contagem: contagem.concluidas },
            ]}
          />
          <button
            type="button"
            onClick={() => setAbertas(tudoAberto ? new Set() : new Set(visiveis.map((v) => v.disciplina.id)))}
            className="hidden rounded-xl px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-white hover:text-[#5f2ebe] sm:block"
          >
            {tudoAberto ? "Recolher todas" : "Expandir todas"}
          </button>
        </div>
      </div>

      {visiveis.length === 0 ? (
        <EstadoVazio
          icone={Search}
          titulo="Nada encontrado"
          texto={termo ? `Nenhuma disciplina, aula ou tópico com “${busca}”.` : "Nenhuma disciplina nesta situação."}
        />
      ) : (
        <div className="space-y-3">
          {visiveis.map(({ disciplina: d, aulas }) => (
            <CartaoDisciplina
              key={d.id}
              disciplina={d}
              aulas={aulas}
              stats={statsDisciplina(d)}
              aberta={abertas.has(d.id) || !!termo}
              onAlternar={() =>
                setAbertas((p) => {
                  const n = new Set(p);
                  if (n.has(d.id)) n.delete(d.id);
                  else n.add(d.id);
                  return n;
                })
              }
              aulaAberta={aulaAberta}
              onAulaAberta={(a) => setAulaAberta(aulaAberta === a.id ? null : a.id)}
              topicoPorAula={topicoPorAula}
              onTopico={(a, t) => abrirTopico(d, a, t)}
              progresso={progresso}
              flashcardsPorTopico={flashcardsPorTopico}
              onFlashcards={onFlashcards}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CartaoDisciplina: React.FC<{
  disciplina: DisciplinaCurso;
  aulas: AulaCurso[];
  stats: { total: number; feitos: number; pct: number };
  aberta: boolean;
  onAlternar: () => void;
  aulaAberta: string | null;
  onAulaAberta: (a: AulaCurso) => void;
  topicoPorAula: Record<string, string>;
  onTopico: (a: AulaCurso, t: TopicoCurso) => void;
  progresso: ProgressoTopicos;
  flashcardsPorTopico: Record<string, number>;
  onFlashcards?: (topicoId: string, aulaId: string) => void;
}> = ({ disciplina: d, aulas, stats, aberta, onAlternar, aulaAberta, onAulaAberta, topicoPorAula, onTopico, progresso, flashcardsPorTopico, onFlashcards }) => {
  const concluida = stats.total > 0 && stats.feitos === stats.total;
  return (
    <Painel className={cn("overflow-hidden transition-shadow", aberta && "shadow-[0_4px_16px_rgba(16,24,40,0.06)]")}>
      <button type="button" onClick={onAlternar} aria-expanded={aberta} className="flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4">
        <AnelProgresso valor={stats.pct} tamanho={52} />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">{d.titulo}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              {d.aulas.length} {d.aulas.length === 1 ? "aula" : "aulas"} · {stats.total} {stats.total === 1 ? "tópico" : "tópicos"}
            </span>
            {d.relevancia !== null && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700" title="Relevância para a prova">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                Relevância {d.relevancia}/10
              </span>
            )}
            {concluida && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Concluída
              </span>
            )}
          </div>
        </div>
        <span className="hidden text-sm tabular-nums text-slate-500 sm:block">
          <b className="text-slate-900">{stats.feitos}</b>/{stats.total}
        </span>
        <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", aberta && "rotate-180")} />
      </button>

      {aberta && (
        <div className="border-t border-slate-100">
          {aulas.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">Esta disciplina ainda não tem aulas.</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {aulas.map((a) => (
                <LinhaAula
                  key={a.id}
                  aula={a}
                  numero={d.aulas.indexOf(a) + 1}
                  aberta={aulaAberta === a.id}
                  onAlternar={() => onAulaAberta(a)}
                  topicoId={topicoPorAula[a.id]}
                  onTopico={(t) => onTopico(a, t)}
                  progresso={progresso}
                  flashcardsPorTopico={flashcardsPorTopico}
                  onFlashcards={onFlashcards}
                />
              ))}
            </ol>
          )}
        </div>
      )}
    </Painel>
  );
};

const LinhaAula: React.FC<{
  aula: AulaCurso;
  numero: number;
  aberta: boolean;
  onAlternar: () => void;
  topicoId?: string;
  onTopico: (t: TopicoCurso) => void;
  progresso: ProgressoTopicos;
  flashcardsPorTopico: Record<string, number>;
  onFlashcards?: (topicoId: string, aulaId: string) => void;
}> = ({ aula: a, numero, aberta, onAlternar, topicoId, onTopico, progresso, flashcardsPorTopico, onFlashcards }) => {
  const feitos = progresso.feitosNaAula(a);
  const total = a.topicos.length;
  const completa = total > 0 && feitos === total;
  return (
    <li id={`aula-${a.id}`} className="scroll-mt-4">
      <div className={cn("flex items-center gap-3 px-3 py-3 transition-colors sm:px-4", aberta ? "bg-[#f8f5ff]" : "hover:bg-slate-50")}>
        <span
          aria-hidden
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums",
            completa ? "bg-emerald-500 text-white" : feitos > 0 ? "bg-[#5f2ebe]/10 text-[#5f2ebe]" : "bg-slate-100 text-slate-500"
          )}
        >
          {completa ? <CheckCircle2 className="h-4 w-4" /> : numero}
        </span>
        <button type="button" onClick={onAlternar} aria-expanded={aberta} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <div className="min-w-0 flex-1">
            <p className={cn("text-sm font-semibold leading-snug sm:text-[15px]", aberta ? "text-[#5f2ebe]" : "text-slate-800")}>{a.titulo}</p>
            {a.descricao && (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                <span className="font-medium">No edital:</span> {a.descricao}
              </p>
            )}
          </div>
          <div className="hidden w-24 shrink-0 sm:block">
            <div className="mb-1 text-right text-[11px] tabular-nums text-slate-500">
              {feitos}/{total} tópicos
            </div>
            <BarraProgresso valor={total ? (feitos / total) * 100 : 0} className="h-1.5" corClasse={completa ? "bg-emerald-500" : "bg-[#5f2ebe]"} />
          </div>
          <span className="text-[11px] tabular-nums text-slate-500 sm:hidden">
            {feitos}/{total}
          </span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", aberta && "rotate-180")} />
        </button>
      </div>
      {aberta && (
        <AulaAberta
          aula={a}
          topicoId={topicoId}
          onTopico={onTopico}
          progresso={progresso}
          flashcardsPorTopico={flashcardsPorTopico}
          onFlashcards={onFlashcards}
        />
      )}
    </li>
  );
};

const AulaAberta: React.FC<{
  aula: AulaCurso;
  topicoId?: string;
  onTopico: (t: TopicoCurso) => void;
  progresso: ProgressoTopicos;
  flashcardsPorTopico: Record<string, number>;
  onFlashcards?: (topicoId: string, aulaId: string) => void;
}> = ({ aula: a, topicoId, onTopico, progresso, flashcardsPorTopico, onFlashcards }) => {
  const [questoes, setQuestoes] = useState(false);
  const atual = a.topicos.find((t) => t.id === topicoId) || a.topicos[0] || null;
  const idx = atual ? a.topicos.indexOf(atual) : -1;
  const proximo = idx >= 0 ? a.topicos[idx + 1] : undefined;
  const feito = atual ? progresso.feito(a.id, atual.id) : false;

  useEffect(() => setQuestoes(false), [atual?.id]);

  if (a.topicos.length === 0)
    return <p className="bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">Esta aula ainda não tem tópicos.</p>;

  return (
    <div className="bg-slate-50/80 px-3 pb-4 pt-1 sm:px-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-3">
          <VideoTopico topico={atual} />
          {atual && (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Tópico {idx + 1} de {a.topicos.length}
                    {atual.professorNome && <> · Prof. {atual.professorNome}</>}
                  </p>
                  <h4 className="text-base font-semibold leading-snug text-slate-900">{atual.nome}</h4>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => progresso.alternar(a.id, atual.id)}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                      feito ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:text-emerald-700"
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {feito ? "Concluído" : "Marcar como concluído"}
                  </button>
                  {proximo && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!feito) progresso.alternar(a.id, atual.id, true);
                        onTopico(proximo);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[#5f2ebe] px-3 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
                    >
                      Próximo
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <MateriaisTopico
                topico={atual}
                questoesAbertas={questoes}
                onQuestoes={() => setQuestoes((v) => !v)}
                flashcards={flashcardsPorTopico[atual.id] || 0}
                onFlashcards={onFlashcards ? () => onFlashcards(atual.id, a.id) : undefined}
              />
            </>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Tópicos desta aula</p>
          <ul className="space-y-1.5 lg:max-h-[420px] lg:overflow-y-auto lg:pr-1">
            {a.topicos.map((t, i) => {
              const sel = atual?.id === t.id;
              const ok = progresso.feito(a.id, t.id);
              return (
                <li key={t.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onTopico(t)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onTopico(t))}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                      sel ? "border-[#5f2ebe] bg-white shadow-sm" : "border-transparent bg-white/70 hover:border-slate-200 hover:bg-white"
                    )}
                  >
                    <MarcaConcluido tamanho="sm" marcado={ok} onClick={() => progresso.alternar(a.id, t.id)} rotulo={`Concluir ${t.nome}`} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("line-clamp-2 text-sm leading-snug", sel ? "font-semibold text-[#5f2ebe]" : ok ? "text-slate-500" : "text-slate-800")}>
                        <span className="mr-1 tabular-nums text-slate-400">{i + 1}.</span>
                        {t.nome}
                      </p>
                    </div>
                    <span className="flex shrink-0 gap-1 text-slate-300">
                      {t.videoUrl && <PlayCircle className="h-3.5 w-3.5" />}
                      {(t.pdfUrl || t.teoriaId) && <FileText className="h-3.5 w-3.5" />}
                      {flashcardsPorTopico[t.id] > 0 && <Layers className="h-3.5 w-3.5" />}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {questoes && atual && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
          <QuestoesTopico topicoId={atual.id} />
        </div>
      )}
    </div>
  );
};
