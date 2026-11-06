import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle2, ChevronDown, ChevronRight, Layers, ListChecks, Map, PartyPopper, PlayCircle, Search, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarraProgresso, CabecalhoAba, Carregando, EstadoVazio, Painel, Segmentos, normalizar } from "../ui";
import { useDisciplinasCurso, type Linha, type DisciplinaCurso, type TeoriaCurso } from "./useDisciplinasCurso";
import { linkTeoriaNoCurso, ultimaTeoria, useProgressoTeorias, type ProgressoTeorias } from "./useProgressoTeorias";
import { AnelProgresso, MarcaConcluido } from "./Marcadores";

type Filtro = "todas" | "andamento" | "naoIniciadas" | "concluidas";

interface Props {
  courseId: string;
  onSubjectsCountChange?: (count: number, data?: Linha[]) => void;
}

/** Teorias seguidas com o mesmo assunto ficam sob um mesmo subtítulo. */
const agruparPorAssunto = (teorias: TeoriaCurso[]) => {
  const grupos: { assunto: string; itens: TeoriaCurso[] }[] = [];
  teorias.forEach((t) => {
    const ult = grupos[grupos.length - 1];
    if (ult && ult.assunto === t.assunto) ult.itens.push(t);
    else grupos.push({ assunto: t.assunto, itens: [t] });
  });
  return grupos;
};

/**
 * Aba Disciplinas: cada disciplina do curso é uma lista de teorias. Clicar numa teoria
 * abre a página dela (com a barra "Voltar ao curso"); a caixa ao lado marca como concluída.
 */
export const DisciplinasTrilha: React.FC<Props> = ({ courseId, onSubjectsCountChange }) => {
  const { disciplinas, isCurso, carregando, erro } = useDisciplinasCurso(courseId, (linhas) =>
    onSubjectsCountChange?.(linhas.length, linhas)
  );
  const progresso = useProgressoTeorias(disciplinas);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());

  // Disciplina avulsa já começa aberta; num curso, abre a disciplina onde o aluno parou
  useEffect(() => {
    if (!disciplinas.length) return;
    if (!isCurso && disciplinas.length === 1) {
      setAbertas(new Set([disciplinas[0].id]));
      return;
    }
    const ultima = ultimaTeoria.ler(courseId);
    if (ultima && disciplinas.some((d) => d.id === ultima.disciplinaId)) setAbertas(new Set([ultima.disciplinaId]));
  }, [isCurso, disciplinas, courseId]);

  const statsDisciplina = (d: DisciplinaCurso) => {
    const total = d.teorias.length;
    const feitos = progresso.feitasEm(d.teorias);
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
  }, [disciplinas, progresso.concluidas]);

  // Ponto para continuar: última teoria aberta, se ainda pendente; senão a primeira pendente
  const continuar = useMemo(() => {
    const ultima = ultimaTeoria.ler(courseId);
    if (ultima) {
      const d = disciplinas.find((x) => x.id === ultima.disciplinaId);
      const t = d?.teorias.find((x) => x.id === ultima.teoriaId);
      if (d && t && !progresso.feita(t.id)) return { disciplina: d, teoria: t };
    }
    for (const d of disciplinas) for (const t of d.teorias) if (!progresso.feita(t.id)) return { disciplina: d, teoria: t };
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplinas, progresso.concluidas, courseId]);

  const termo = normalizar(busca);
  const visiveis = useMemo(() => {
    return disciplinas
      .filter((d) => filtro === "todas" || situacao(d) === filtro)
      .map((d) => {
        if (!termo || normalizar(d.titulo).includes(termo)) return { disciplina: d, teorias: d.teorias };
        const teorias = d.teorias.filter((t) => normalizar(t.titulo).includes(termo) || normalizar(t.assunto).includes(termo));
        return teorias.length ? { disciplina: d, teorias } : null;
      })
      .filter(Boolean) as Array<{ disciplina: DisciplinaCurso; teorias: TeoriaCurso[] }>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disciplinas, filtro, termo, progresso.concluidas]);

  if (carregando) return <Carregando texto="Carregando disciplinas..." />;
  if (erro)
    return <EstadoVazio icone={BookOpen} titulo="Não foi possível carregar as disciplinas" texto="Verifique sua conexão e recarregue a página." />;
  if (disciplinas.length === 0)
    return <EstadoVazio icone={BookOpen} titulo="Nenhuma disciplina por aqui" texto="Quando o curso tiver disciplinas cadastradas, elas aparecem nesta aba." />;

  const tudoAberto = visiveis.length > 0 && visiveis.every((v) => abertas.has(v.disciplina.id));
  const ao = (d: DisciplinaCurso, t: TeoriaCurso) => ultimaTeoria.salvar(courseId, d.id, t.id);

  return (
    <div className="space-y-5 pb-10 pt-5">
      <CabecalhoAba
        titulo={isCurso ? "Disciplinas" : "Disciplina"}
        descricao="Clique numa teoria para estudar. Marque as que concluir e acompanhe seu avanço."
      />

      {/* Resumo + continuar */}
      <div className="grid gap-3 lg:grid-cols-2">
        <Painel className="flex items-center gap-4 p-4 sm:p-5">
          <AnelProgresso valor={progresso.totais.percentual} tamanho={76} espessura={7}>
            <span className="text-base">{progresso.totais.percentual}%</span>
          </AnelProgresso>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Seu progresso {isCurso ? "no curso" : "na disciplina"}</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {progresso.totais.feitos} <span className="font-medium text-slate-400">de {progresso.totais.total} {progresso.totais.total === 1 ? "teoria" : "teorias"}</span>
            </p>
            {isCurso && (
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Layers className="h-3.5 w-3.5 text-[#5f2ebe]" />
                  {contagem.concluidas}/{disciplinas.length} disciplinas concluídas
                </span>
              </div>
            )}
          </div>
        </Painel>

        {continuar ? (
          <Painel className="relative overflow-hidden p-4 sm:p-5">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/15" />
            <p className="text-xs font-medium uppercase tracking-wide text-[#5f2ebe]">
              {progresso.totais.feitos > 0 ? "Continue de onde parou" : "Comece por aqui"}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {continuar.disciplina.titulo}
              {continuar.teoria.assunto && <> · {continuar.teoria.assunto}</>}
            </p>
            <p className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-slate-900">{continuar.teoria.titulo}</p>
            <Link
              to={linkTeoriaNoCurso(courseId, continuar.disciplina.id, continuar.teoria)}
              onClick={() => ao(continuar.disciplina, continuar.teoria)}
              className="relative mt-3 inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4f25a0]"
            >
              <PlayCircle className="h-4 w-4" />
              {progresso.totais.feitos > 0 ? "Continuar" : "Começar"}
            </Link>
          </Painel>
        ) : (
          <Painel className="flex items-center gap-4 p-4 sm:p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <PartyPopper className="h-6 w-6" />
            </span>
            <div>
              <p className="font-semibold text-slate-900">
                {progresso.totais.total > 0 ? "Você concluiu todas as teorias!" : "As teorias deste curso ainda estão sendo preparadas"}
              </p>
              <p className="text-sm text-slate-500">
                {progresso.totais.total > 0 ? "Agora é revisar e treinar com questões e simulados." : "Volte em breve para começar a estudar."}
              </p>
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
            placeholder="Buscar disciplina, assunto ou teoria"
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
          texto={termo ? `Nenhuma disciplina, assunto ou teoria com “${busca}”.` : "Nenhuma disciplina nesta situação."}
        />
      ) : (
        <div className="space-y-3">
          {visiveis.map(({ disciplina: d, teorias }) => (
            <CartaoDisciplina
              key={d.id}
              courseId={courseId}
              disciplina={d}
              teorias={teorias}
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
              onAbrirTeoria={(t) => ao(d, t)}
              progresso={progresso}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CartaoDisciplina: React.FC<{
  courseId: string;
  disciplina: DisciplinaCurso;
  teorias: TeoriaCurso[];
  stats: { total: number; feitos: number; pct: number };
  aberta: boolean;
  onAlternar: () => void;
  onAbrirTeoria: (t: TeoriaCurso) => void;
  progresso: ProgressoTeorias;
}> = ({ courseId, disciplina: d, teorias, stats, aberta, onAlternar, onAbrirTeoria, progresso }) => {
  const concluida = stats.total > 0 && stats.feitos === stats.total;
  const grupos = agruparPorAssunto(teorias);
  const comAssunto = grupos.some((g) => g.assunto);
  const nAssuntos = new Set(d.teorias.map((t) => t.assunto).filter(Boolean)).size;
  return (
    <Painel className={cn("overflow-hidden transition-shadow", aberta && "shadow-[0_4px_16px_rgba(16,24,40,0.06)]")}>
      <button type="button" onClick={onAlternar} aria-expanded={aberta} className="flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4">
        <AnelProgresso valor={stats.pct} tamanho={52} />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">{d.titulo}</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span>
              {stats.total} {stats.total === 1 ? "teoria" : "teorias"}
              {nAssuntos > 1 && <> · {nAssuntos} assuntos</>}
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
          {teorias.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-slate-500">Esta disciplina ainda não tem teorias.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-1 px-3 py-2 text-[11px] text-slate-400 sm:px-4">
                <span className="inline-flex items-center gap-1">
                  <PlayCircle className="h-3.5 w-3.5 text-red-500" />
                  Videoaula
                </span>
                <span className="inline-flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5 text-[#5f2ebe]" />
                  Questões
                </span>
                <span className="inline-flex items-center gap-1">
                  <Map className="h-3.5 w-3.5 text-amber-600" />
                  Mapa mental
                </span>
              </div>
              {grupos.map((g, gi) => {
                const ok = progresso.feitasEm(g.itens);
                return (
                  <div key={`${g.assunto}-${gi}`}>
                    {comAssunto && (
                      <div className="flex items-center justify-between gap-3 bg-slate-50 px-3 py-2 sm:px-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{g.assunto || "Outras teorias"}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] tabular-nums text-slate-400">
                            {ok}/{g.itens.length}
                          </span>
                          <BarraProgresso
                            valor={(ok / g.itens.length) * 100}
                            className="hidden h-1.5 w-16 sm:block"
                            corClasse={ok === g.itens.length ? "bg-emerald-500" : "bg-[#5f2ebe]"}
                          />
                        </div>
                      </div>
                    )}
                    <ol className="divide-y divide-slate-100">
                      {g.itens.map((t) => (
                        <LinhaTeoria
                          key={t.id}
                          teoria={t}
                          numero={d.teorias.indexOf(t) + 1}
                          href={linkTeoriaNoCurso(courseId, d.id, t)}
                          feita={progresso.feita(t.id)}
                          onMarcar={() => progresso.alternar(t.id)}
                          onAbrir={() => onAbrirTeoria(t)}
                        />
                      ))}
                    </ol>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </Painel>
  );
};

const Indicador: React.FC<{ ativo: boolean; titulo: string; icone: React.ElementType; cor: string }> = ({ ativo, titulo, icone: Icone, cor }) => (
  <span
    title={ativo ? titulo : `Sem ${titulo.toLowerCase()}`}
    aria-label={ativo ? titulo : undefined}
    aria-hidden={!ativo}
    className={cn("flex h-7 w-7 items-center justify-center rounded-lg", ativo ? cor : "text-slate-200")}
  >
    <Icone className="h-4 w-4" />
  </span>
);

const LinhaTeoria: React.FC<{
  teoria: TeoriaCurso;
  numero: number;
  href: string;
  feita: boolean;
  onMarcar: () => void;
  onAbrir: () => void;
}> = ({ teoria: t, numero, href, feita, onMarcar, onAbrir }) => (
  <li className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#f8f5ff] sm:px-4">
    <MarcaConcluido marcado={feita} onClick={onMarcar} rotulo={`Concluir ${t.titulo}`} />
    <Link to={href} onClick={onAbrir} className="group flex min-w-0 flex-1 items-center gap-3">
      <p
        className={cn(
          "min-w-0 flex-1 text-sm font-semibold leading-snug group-hover:text-[#5f2ebe] group-hover:underline group-hover:underline-offset-2 sm:text-[15px]",
          feita ? "text-slate-500" : "text-slate-800"
        )}
      >
        <span className="mr-1.5 tabular-nums text-slate-400">{numero}.</span>
        {t.titulo}
      </p>
      <span className="flex shrink-0 items-center gap-1.5">
        <Indicador ativo={t.temVideo} titulo="Videoaula" icone={PlayCircle} cor="bg-red-50 text-red-500" />
        <Indicador ativo={t.temQuestoes} titulo="Questões" icone={ListChecks} cor="bg-[#5f2ebe]/10 text-[#5f2ebe]" />
        <Indicador ativo={t.temMapa} titulo="Mapa mental" icone={Map} cor="bg-amber-50 text-amber-600" />
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#5f2ebe]" />
    </Link>
  </li>
);
