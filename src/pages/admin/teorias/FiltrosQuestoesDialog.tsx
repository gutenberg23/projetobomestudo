import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  ExternalLink,
  FileQuestion,
  GraduationCap,
  Gauge,
  Landmark,
  Layers,
  ListTree,
  Loader2,
  Search,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizar } from "@/components/course/ui";
import { ListaOpcoes } from "@/components/questions/busca/ListaOpcoes";
import {
  FILTROS_VISIVEIS,
  ROTULOS,
  alternarValor,
  contarFiltros,
  filtrosVazios,
  formatarNumero,
  type ChaveFiltro,
  type EstadoBusca,
  type Filtros,
} from "@/components/questions/busca/filtros";
import { useOpcoesFiltro } from "@/components/questions/busca/useOpcoesFiltro";
import { useBuscaQuestoes } from "@/components/questions/busca/useBuscaQuestoes";
import {
  gravarFiltrosTeoria,
  lerFiltrosTeoria,
  linkQuestoesTeoria,
  type FiltrosQuestoesTeoria,
} from "@/components/teorias/filtrosQuestoes";

type Secao = ChaveFiltro | "palavra";

const ICONES: Record<Secao, typeof Tag> = {
  palavra: Search,
  disciplines: BookOpen,
  topics: Layers,
  subtopics: ListTree,
  institutions: Landmark,
  organizations: Building2,
  roles: Tag,
  years: CalendarDays,
  educationLevels: GraduationCap,
  difficulty: Gauge,
};

const DICAS: Partial<Record<Secao, string>> = {
  palavra: "Só entram questões que tenham este texto no enunciado.",
  disciplines: "Comece por aqui: assuntos e tópicos dependem da disciplina.",
  topics: "Assuntos das disciplinas escolhidas.",
  subtopics: "Tópicos dos assuntos escolhidos (ou de toda a disciplina, se nenhum assunto for marcado).",
  institutions: "Banca organizadora da prova.",
  organizations: "Órgão ou instituição do concurso.",
  years: "Ano em que a prova foi aplicada.",
  educationLevels: "Nível de escolaridade do cargo.",
  difficulty: "Dificuldade cadastrada na questão.",
};

const SECOES: Secao[] = ["disciplines", "topics", "subtopics", "institutions", "organizations", "years", "educationLevels", "difficulty", "palavra"];

const textoSimples = (html: string) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

interface Props {
  aberto: boolean;
  onFechar: () => void;
  /** O que está gravado na teoria hoje. */
  inicial: FiltrosQuestoesTeoria;
  onAplicar: (filtros: FiltrosQuestoesTeoria, link: string) => void;
  /** Classificação da teoria, usada para sugerir um ponto de partida. */
  disciplinaTeoria?: string;
  assuntoTeoria?: string;
}

/**
 * Escolha das questões que aparecem na aba Questões de uma teoria. Usa os
 * mesmos filtros de /questions, com listas de busca inline (sem Popover,
 * que não funciona dentro de Dialog neste projeto).
 */
export const FiltrosQuestoesDialog: React.FC<Props> = ({ aberto, onFechar, inicial, onAplicar, disciplinaTeoria, assuntoTeoria }) => {
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios);
  const [palavra, setPalavra] = useState("");
  const [secao, setSecao] = useState<Secao>("disciplines");

  // Recomeça do que está gravado sempre que abre
  useEffect(() => {
    if (!aberto) return;
    const lido = lerFiltrosTeoria(inicial);
    setFiltros(lido.filtros);
    setPalavra(lido.palavra);
    setSecao("disciplines");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const { carregando, erro, opcoesDe, dicaVazio } = useOpcoesFiltro();

  // Prévia: espera uma pausa nos cliques antes de consultar
  const [estadoPrevia, setEstadoPrevia] = useState<EstadoBusca | null>(null);
  useEffect(() => {
    if (!aberto) return;
    const t = setTimeout(
      () => setEstadoPrevia({ q: palavra.trim(), filtros, pagina: 1, porPagina: 3, ordem: "recentes", situacao: "todas" }),
      350
    );
    return () => clearTimeout(t);
  }, [aberto, filtros, palavra]);
  const previa = useBuscaQuestoes(
    estadoPrevia || { q: "", filtros: filtrosVazios(), pagina: 1, porPagina: 3, ordem: "recentes", situacao: "todas" },
    null,
    !aberto || !estadoPrevia
  );

  const qtdFiltros = contarFiltros(filtros) + (palavra.trim() ? 1 : 0);
  const gravado = useMemo(() => gravarFiltrosTeoria(filtros, palavra), [filtros, palavra]);
  const link = useMemo(() => linkQuestoesTeoria(gravado), [gravado]);

  const alternar = (chave: ChaveFiltro, valor: string) => setFiltros((f) => alternarValor(f, chave, valor));
  const limparChave = (chave: ChaveFiltro) =>
    setFiltros((f) => {
      const novo = { ...f, [chave]: [] };
      if (chave === "disciplines") {
        novo.topics = [];
        novo.subtopics = [];
      }
      return novo;
    });
  const tirar = (chave: ChaveFiltro, valor: string) =>
    setFiltros((f) => (f[chave].includes(valor) ? alternarValor(f, chave, valor) : f));

  // Sugestão: a disciplina e o assunto da própria teoria, se existirem no banco de questões
  const sugestao = useMemo(() => {
    if (carregando || !disciplinaTeoria) return null;
    const achar = (lista: string[], alvo: string) => lista.find((v) => normalizar(v) === normalizar(alvo));
    const disciplinas = opcoesDe("disciplines", filtrosVazios())[0]?.opcoes.map((o) => o.valor) || [];
    const disciplina = achar(disciplinas, disciplinaTeoria);
    if (!disciplina) return null;
    let assunto: string | undefined;
    if (assuntoTeoria) {
      const base = { ...filtrosVazios(), disciplines: [disciplina] };
      const assuntos = opcoesDe("topics", base).flatMap((g) => g.opcoes.map((o) => o.valor));
      assunto =
        achar(assuntos, assuntoTeoria) ||
        assuntos.find((a) => normalizar(a.replace(/^[\d.\s\-–)]+/, "")) === normalizar(assuntoTeoria));
    }
    return { disciplina, assunto };
  }, [carregando, disciplinaTeoria, assuntoTeoria, opcoesDe]);

  const usarSugestao = () => {
    if (!sugestao) return;
    setFiltros((f) => ({
      ...f,
      disciplines: Array.from(new Set([...f.disciplines, sugestao.disciplina])),
      topics: sugestao.assunto ? Array.from(new Set([...f.topics, sugestao.assunto])) : f.topics,
    }));
    setSecao(sugestao.assunto ? "subtopics" : "topics");
  };

  const travada = (s: Secao) => (s === "topics" || s === "subtopics") && filtros.disciplines.length === 0;
  const qtdSecao = (s: Secao) => (s === "palavra" ? (palavra.trim() ? 1 : 0) : filtros[s].length);

  // Valores gravados que não existem mais nas opções (ex.: assunto renomeado)
  const orfaos = useMemo(() => {
    if (carregando || erro) return new Set<string>();
    const set = new Set<string>();
    FILTROS_VISIVEIS.forEach((c) => {
      const existentes = new Set(opcoesDe(c, filtros).flatMap((g) => g.opcoes.map((o) => o.valor)));
      filtros[c].forEach((v) => !existentes.has(v) && set.add(`${c}|${v}`));
    });
    return set;
  }, [carregando, erro, filtros, opcoesDe]);

  const total = previa.total;
  const consultando = !estadoPrevia || previa.carregando;

  const aplicar = () => {
    onAplicar(gravado, qtdFiltros ? link : "");
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="flex h-[100dvh] max-w-none flex-col gap-0 overflow-hidden p-0 sm:h-[min(780px,92vh)] sm:max-w-[1100px] sm:rounded-2xl">
        {/* Cabeçalho */}
        <header className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 pr-12">
          <span className="mt-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe] sm:flex">
            <FileQuestion className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <DialogTitle className="text-base font-semibold text-slate-900">Questões da teoria</DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-slate-500">
              O aluno vê, na aba Questões, as questões que atendem a todos os filtros abaixo.
            </DialogDescription>
          </div>
        </header>

        {/* Seções no celular */}
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-slate-100 px-4 py-2.5 md:hidden" aria-label="Filtros">
          {SECOES.map((s) => {
            const Icone = ICONES[s];
            const n = qtdSecao(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSecao(s)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  secao === s ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 bg-white text-slate-600",
                  travada(s) && secao !== s && "text-slate-400"
                )}
              >
                <Icone className="h-3.5 w-3.5" />
                {s === "palavra" ? "Palavra-chave" : ROTULOS[s]}
                {n > 0 && (
                  <span className={cn("rounded-full px-1.5 text-[10px] tabular-nums", secao === s ? "bg-white/25" : "bg-[#5f2ebe]/10 text-[#5f2ebe]")}>
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="grid min-h-0 flex-1 md:grid-cols-[210px_minmax(0,1fr)_300px]">
          {/* Seções no computador */}
          <nav className="hidden min-h-0 flex-col gap-0.5 overflow-y-auto border-r border-slate-100 bg-slate-50/60 p-3 md:flex" aria-label="Filtros">
            {SECOES.map((s) => {
              const Icone = ICONES[s];
              const n = qtdSecao(s);
              const bloqueada = travada(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSecao(s)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    s === "palavra" && "mt-2 border-t border-slate-200 pt-3",
                    secao === s
                      ? "bg-white font-semibold text-[#5f2ebe] shadow-sm ring-1 ring-slate-200"
                      : bloqueada
                        ? "text-slate-400 hover:bg-white/70"
                        : "text-slate-700 hover:bg-white/70"
                  )}
                >
                  <Icone className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate">{s === "palavra" ? "Palavra-chave" : ROTULOS[s]}</span>
                  {n > 0 && (
                    <span className="rounded-full bg-[#5f2ebe] px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums text-white">{n}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Opções da seção escolhida */}
          <section className="flex min-h-0 flex-col overflow-y-auto px-4 py-4 sm:px-5">
            {sugestao && qtdFiltros === 0 && (
              <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#5f2ebe]/20 bg-[#5f2ebe]/[0.04] p-3 sm:flex-row sm:items-center">
                <Sparkles className="hidden h-5 w-5 shrink-0 text-[#5f2ebe] sm:block" />
                <p className="flex-1 text-sm text-slate-700">
                  Começar pela classificação da teoria:{" "}
                  <strong className="font-semibold">{sugestao.disciplina}</strong>
                  {sugestao.assunto && (
                    <>
                      {" "}
                      › <strong className="font-semibold">{sugestao.assunto}</strong>
                    </>
                  )}
                </p>
                <Button type="button" size="sm" onClick={usarSugestao} className="bg-[#5f2ebe] hover:bg-[#4a2394]">
                  Usar
                </Button>
              </div>
            )}

            <div className="mb-3">
              <h3 className="text-sm font-semibold text-slate-900">{secao === "palavra" ? "Palavra-chave" : ROTULOS[secao]}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{DICAS[secao]}</p>
            </div>

            {secao === "palavra" ? (
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={palavra}
                  onChange={(e) => setPalavra(e.target.value)}
                  placeholder="Ex.: discricionariedade"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#5f2ebe] focus:ring-4 focus:ring-[#5f2ebe]/10"
                />
                {palavra && (
                  <button
                    type="button"
                    aria-label="Limpar palavra-chave"
                    onClick={() => setPalavra("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : carregando ? (
              <div className="flex items-center gap-2 py-6 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando opções do banco de questões...
              </div>
            ) : erro ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Não foi possível carregar as opções. Feche e abra de novo.</p>
            ) : travada(secao) ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                <p className="text-sm text-slate-500">Escolha uma disciplina primeiro.</p>
                <button type="button" onClick={() => setSecao("disciplines")} className="mt-2 text-sm font-semibold text-[#5f2ebe] hover:underline">
                  Ir para Disciplina
                </button>
              </div>
            ) : (
              <ListaOpcoes
                key={secao}
                grupos={opcoesDe(secao, filtros)}
                selecionados={filtros[secao]}
                onAlternar={(v) => alternar(secao, v)}
                onLimpar={() => limparChave(secao)}
                vazio={dicaVazio(secao, filtros)}
                alturaMax="max-h-none"
                autoFocus
              />
            )}

            <div className="md:hidden">
              <ResumoFiltros filtros={filtros} palavra={palavra} orfaos={orfaos} onTirar={tirar} onTirarPalavra={() => setPalavra("")} />
            </div>
          </section>

          {/* Resumo (computador) */}
          <aside className="hidden min-h-0 flex-col overflow-y-auto border-l border-slate-100 bg-slate-50/60 p-4 md:flex">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-medium text-slate-500">Questões encontradas</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-bold tabular-nums text-slate-900">
                {consultando ? <Loader2 className="h-5 w-5 animate-spin text-slate-300" /> : formatarNumero(total)}
              </p>
              {!consultando && qtdFiltros > 0 && total === 0 && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-700">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Nenhuma questão atende a todos os filtros. A aba aparece vazia para o aluno.
                </p>
              )}
              {qtdFiltros === 0 && <p className="mt-2 text-xs text-slate-500">Sem filtros, a aba Questões não aparece na teoria.</p>}
              {qtdFiltros > 0 && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#5f2ebe] hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir em Questões
                </a>
              )}
            </div>

            <ResumoFiltros filtros={filtros} palavra={palavra} orfaos={orfaos} onTirar={tirar} onTirarPalavra={() => setPalavra("")} />

            {qtdFiltros > 0 && !consultando && previa.questoes.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Prévia</p>
                <ul className="space-y-2">
                  {previa.questoes.map((q) => (
                    <li key={q.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                      <p className="truncate text-[11px] text-slate-400">
                        {[q.institution, q.year, q.organization].filter(Boolean).join(" · ")}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-slate-700">{textoSimples(q.content)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Rodapé */}
        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="whitespace-nowrap text-sm text-slate-600 md:hidden">
              {consultando ? (
                <Loader2 className="inline h-4 w-4 animate-spin text-slate-300" />
              ) : (
                <>
                  <strong className="tabular-nums text-slate-900">{formatarNumero(total)}</strong> questões
                </>
              )}
            </span>
            {qtdFiltros > 0 && (
              <button
                type="button"
                onClick={() => {
                  setFiltros(filtrosVazios());
                  setPalavra("");
                }}
                className="hidden whitespace-nowrap text-sm text-slate-500 hover:text-red-600 md:inline"
              >
                Limpar tudo
              </button>
            )}
          </div>
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={aplicar} className="bg-[#5f2ebe] hover:bg-[#4a2394]">
            {qtdFiltros ? `Aplicar ${qtdFiltros} ${qtdFiltros === 1 ? "filtro" : "filtros"}` : "Aplicar sem filtros"}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

/** Valores escolhidos, agrupados por filtro, com botão para tirar cada um. */
const ResumoFiltros: React.FC<{
  filtros: Filtros;
  palavra: string;
  orfaos: Set<string>;
  onTirar: (chave: ChaveFiltro, valor: string) => void;
  onTirarPalavra: () => void;
}> = ({ filtros, palavra, orfaos, onTirar, onTirarPalavra }) => {
  const grupos = FILTROS_VISIVEIS.filter((c) => filtros[c].length > 0);
  if (!grupos.length && !palavra.trim()) return null;
  const temOrfao = orfaos.size > 0;

  return (
    <div className="mt-4 space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Filtros escolhidos</p>
      {grupos.map((c) => (
        <div key={c}>
          <p className="mb-1 text-xs text-slate-500">{ROTULOS[c]}</p>
          <div className="flex flex-wrap gap-1">
            {filtros[c].map((v) => {
              const orfao = orfaos.has(`${c}|${v}`);
              return (
                <span
                  key={v}
                  title={orfao ? "Não aparece nas opções atuais" : v}
                  className={cn(
                    "inline-flex max-w-full items-center gap-1 rounded-md py-0.5 pl-2 pr-1 text-xs",
                    orfao ? "bg-amber-100 text-amber-800" : "bg-[#5f2ebe]/10 text-[#4a2394]"
                  )}
                >
                  <span className="truncate">{v}</span>
                  <button type="button" onClick={() => onTirar(c, v)} aria-label={`Tirar ${v}`} className="rounded p-0.5 hover:bg-black/5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      ))}
      {palavra.trim() && (
        <div>
          <p className="mb-1 text-xs text-slate-500">Palavra-chave</p>
          <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#5f2ebe]/10 py-0.5 pl-2 pr-1 text-xs text-[#4a2394]">
            <span className="truncate">"{palavra.trim()}"</span>
            <button type="button" onClick={onTirarPalavra} aria-label="Tirar palavra-chave" className="rounded p-0.5 hover:bg-black/5">
              <X className="h-3 w-3" />
            </button>
          </span>
        </div>
      )}
      {temOrfao && (
        <p className="flex items-start gap-1.5 text-[11px] text-amber-700">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Em amarelo: valores salvos que não aparecem mais nas opções (talvez renomeados).
        </p>
      )}
    </div>
  );
};
