import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ExternalLink,
  FileQuestion,
  GraduationCap,
  Gauge,
  Info,
  Landmark,
  Layers,
  ListTree,
  Loader2,
  Lock,
  RotateCcw,
  Search,
  Sparkles,
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
import { useOpcoesFiltro, type GrupoOpcoes } from "@/components/questions/busca/useOpcoesFiltro";
import { useBuscaQuestoes } from "@/components/questions/busca/useBuscaQuestoes";
import {
  gravarFiltrosTeoria,
  lerFiltrosTeoria,
  linkQuestoesTeoria,
  type FiltrosQuestoesTeoria,
} from "@/components/teorias/filtrosQuestoes";

type Secao = Exclude<ChaveFiltro, "roles"> | "palavra";

const ICONES: Record<Secao, typeof BookOpen> = {
  palavra: Search,
  disciplines: BookOpen,
  topics: Layers,
  subtopics: ListTree,
  institutions: Landmark,
  organizations: Building2,
  years: CalendarDays,
  educationLevels: GraduationCap,
  difficulty: Gauge,
};

const DICAS: Record<Secao, string> = {
  disciplines: "Comece por aqui. Assunto e tópico dependem da disciplina.",
  topics: "Assuntos das disciplinas marcadas.",
  subtopics: "Tópicos dos assuntos marcados (ou de toda a disciplina, se nenhum assunto for marcado).",
  institutions: "Banca organizadora da prova.",
  organizations: "Órgão ou instituição do concurso.",
  years: "Ano em que a prova foi aplicada.",
  educationLevels: "Nível de escolaridade do cargo.",
  difficulty: "Dificuldade cadastrada na questão.",
  palavra: "Só entram questões que tenham este texto no enunciado.",
};

/** Os filtros em blocos, na mesma ordem de /questions. */
const BLOCOS: { titulo: string; descricao: string; secoes: Secao[] }[] = [
  { titulo: "Conteúdo", descricao: "O que a questão cobra", secoes: ["disciplines", "topics", "subtopics"] },
  { titulo: "Prova", descricao: "Onde e quando a questão caiu", secoes: ["institutions", "organizations", "years", "educationLevels"] },
  { titulo: "Questão", descricao: "Características da própria questão", secoes: ["difficulty", "palavra"] },
];

/** Filtros com poucas opções viram pílulas clicáveis em vez de lista com busca. */
const EM_PILULAS: Secao[] = ["years", "educationLevels", "difficulty"];

const ROTULO = (s: Secao) => (s === "palavra" ? "Palavra-chave" : ROTULOS[s]);

const textoSimples = (html: string) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ROXO = "bg-[#5f2ebe] hover:bg-[#4a2394]";

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
 * Escolha das questões que aparecem na aba Questões de uma teoria.
 *
 * À esquerda, os mesmos filtros de /questions agrupados em Conteúdo, Prova e
 * Questão, cada um num campo que abre e fecha (um por vez). À direita, uma
 * prévia ao vivo com o total e algumas questões. Não usa Popover, que não
 * funciona dentro de Dialog neste projeto.
 */
export const FiltrosQuestoesDialog: React.FC<Props> = ({ aberto, onFechar, inicial, onAplicar, disciplinaTeoria, assuntoTeoria }) => {
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios);
  const [palavra, setPalavra] = useState("");
  const [aberta, setAberta] = useState<Secao | null>("disciplines");
  const [original, setOriginal] = useState("");

  // Recomeça do que está gravado sempre que abre
  useEffect(() => {
    if (!aberto) return;
    const lido = lerFiltrosTeoria(inicial);
    setFiltros(lido.filtros);
    setPalavra(lido.palavra);
    setAberta(lido.filtros.disciplines.length ? null : "disciplines");
    setOriginal(JSON.stringify(gravarFiltrosTeoria(lido.filtros, lido.palavra)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aberto]);

  const { carregando, erro, opcoesDe, dicaVazio, totalQuestoes } = useOpcoesFiltro();

  // Prévia: espera uma pausa nos cliques antes de consultar
  const [estadoPrevia, setEstadoPrevia] = useState<EstadoBusca | null>(null);
  useEffect(() => {
    if (!aberto) return;
    const t = setTimeout(
      () => setEstadoPrevia({ q: palavra.trim(), filtros, pagina: 1, porPagina: 4, ordem: "recentes", situacao: "todas" }),
      350
    );
    return () => clearTimeout(t);
  }, [aberto, filtros, palavra]);
  const previa = useBuscaQuestoes(
    estadoPrevia || { q: "", filtros: filtrosVazios(), pagina: 1, porPagina: 4, ordem: "recentes", situacao: "todas" },
    null,
    !aberto || !estadoPrevia
  );

  const qtdFiltros = contarFiltros(filtros) + (palavra.trim() ? 1 : 0);
  const gravado = useMemo(() => gravarFiltrosTeoria(filtros, palavra), [filtros, palavra]);
  const link = useMemo(() => linkQuestoesTeoria(gravado), [gravado]);
  const alterado = JSON.stringify(gravado) !== original;

  const alternar = (chave: ChaveFiltro, valor: string) => setFiltros((f) => alternarValor(f, chave, valor));
  const limparSecao = (s: Secao) => {
    if (s === "palavra") return setPalavra("");
    setFiltros((f) => {
      const novo = { ...f, [s]: [] };
      if (s === "disciplines") {
        novo.topics = [];
        novo.subtopics = [];
      }
      return novo;
    });
  };
  const tirar = (chave: ChaveFiltro, valor: string) =>
    setFiltros((f) => (f[chave].includes(valor) ? alternarValor(f, chave, valor) : f));
  const limparTudo = () => {
    setFiltros(filtrosVazios());
    setPalavra("");
    setAberta("disciplines");
  };

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
    setAberta(sugestao.assunto ? "subtopics" : "topics");
  };

  const travada = (s: Secao) => (s === "topics" || s === "subtopics") && filtros.disciplines.length === 0;
  const valoresDe = (s: Secao) => (s === "palavra" ? (palavra.trim() ? [palavra.trim()] : []) : filtros[s]);

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
  const vazio = !consultando && qtdFiltros > 0 && total === 0;

  const aplicar = () => onAplicar(gravado, qtdFiltros ? link : "");

  const corpoSecao = (s: Secao) => {
    if (s === "palavra") {
      return (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={palavra}
            onChange={(e) => setPalavra(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAberta(null)}
            placeholder="Ex.: discricionariedade"
            autoFocus
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/10"
          />
          {palavra && (
            <button
              type="button"
              aria-label="Limpar palavra-chave"
              onClick={() => setPalavra("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    }
    if (carregando)
      return (
        <div className="flex items-center gap-2 py-3 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando opções do banco de questões...
        </div>
      );
    if (erro) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">Não foi possível carregar as opções. Feche e abra de novo.</p>;
    const grupos = opcoesDe(s, filtros);
    if (EM_PILULAS.includes(s)) {
      return <Pilulas grupos={grupos} selecionados={filtros[s]} onAlternar={(v) => alternar(s, v)} vazio={dicaVazio(s, filtros)} />;
    }
    return (
      <ListaOpcoes
        key={s}
        grupos={grupos}
        selecionados={filtros[s]}
        onAlternar={(v) => alternar(s, v)}
        onLimpar={() => limparSecao(s)}
        vazio={dicaVazio(s, filtros)}
        alturaMax="max-h-72"
        autoFocus
      />
    );
  };

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="flex h-[100dvh] max-w-none flex-col gap-0 overflow-hidden bg-slate-50 p-0 sm:h-[min(820px,94vh)] sm:max-w-[1060px] sm:rounded-2xl">
        {/* Cabeçalho */}
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-5 py-4 pr-12">
          <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe] sm:flex">
            <FileQuestion className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-base font-semibold text-slate-900">Questões da teoria</DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-slate-500">
              Escolha quais questões do banco aparecem na aba Questões desta teoria.
            </DialogDescription>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 overflow-y-auto md:grid-cols-[minmax(0,1fr)_330px] md:overflow-hidden">
          {/* Filtros */}
          <div className="min-h-0 space-y-5 px-4 py-5 sm:px-6 md:overflow-y-auto">
            {sugestao && filtros.disciplines.length === 0 && (
              <div className="flex flex-col gap-3 rounded-xl border border-[#5f2ebe]/25 bg-gradient-to-r from-[#5f2ebe]/[0.07] to-transparent p-4 sm:flex-row sm:items-center">
                <span className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#5f2ebe] shadow-sm sm:flex">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">Começar pela classificação da teoria</p>
                  <p className="mt-0.5 truncate text-sm text-slate-600">
                    {sugestao.disciplina}
                    {sugestao.assunto && <> › {sugestao.assunto}</>}
                  </p>
                </div>
                <Button type="button" size="sm" onClick={usarSugestao} className={ROXO}>
                  Usar sugestão
                </Button>
              </div>
            )}

            {BLOCOS.map((bloco) => (
              <section key={bloco.titulo}>
                <div className="mb-2 flex items-baseline gap-2 px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{bloco.titulo}</h3>
                  <span className="text-xs text-slate-400">{bloco.descricao}</span>
                </div>
                <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {bloco.secoes.map((s) => (
                    <CampoFiltro
                      key={s}
                      secao={s}
                      aberto={aberta === s}
                      travado={travada(s)}
                      valores={valoresDe(s)}
                      orfaos={orfaos}
                      onAlternarAberto={() => setAberta((a) => (a === s ? null : s))}
                      onTirar={(v) => (s === "palavra" ? setPalavra("") : tirar(s, v))}
                      onLimpar={() => limparSecao(s)}
                    >
                      {corpoSecao(s)}
                    </CampoFiltro>
                  ))}
                </div>
              </section>
            ))}

            <p className="flex items-start gap-2 px-1 text-xs leading-relaxed text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Dentro de um filtro, basta a questão ter um dos valores marcados. Entre filtros diferentes, ela precisa atender a todos.
            </p>
          </div>

          {/* Prévia */}
          <aside className="min-h-0 border-t border-slate-200 bg-white px-4 py-5 sm:px-6 md:overflow-y-auto md:border-l md:border-t-0 md:px-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">O aluno vai ver</p>

            <div
              className={cn(
                "mt-3 rounded-xl border p-4",
                vazio ? "border-amber-200 bg-amber-50" : qtdFiltros ? "border-[#5f2ebe]/20 bg-[#5f2ebe]/[0.04]" : "border-slate-200 bg-slate-50"
              )}
            >
              {qtdFiltros === 0 ? (
                <>
                  <p className="text-sm font-semibold text-slate-800">Nenhum filtro</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Sem filtros, a aba Questões não aparece na teoria.
                    {totalQuestoes > 0 && <> O banco tem {formatarNumero(totalQuestoes)} questões.</>}
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-slate-900">
                      {consultando ? <Loader2 className="h-6 w-6 animate-spin text-slate-300" /> : formatarNumero(total)}
                    </span>
                    {!consultando && <span className="text-sm text-slate-500">{total === 1 ? "questão" : "questões"}</span>}
                  </div>
                  {vazio ? (
                    <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-800">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      Nenhuma questão atende a todos os filtros. A aba aparece vazia para o aluno.
                    </p>
                  ) : (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#5f2ebe] hover:underline"
                    >
                      Ver todas em Questões <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </>
              )}
            </div>

            {qtdFiltros > 0 && !consultando && previa.questoes.length > 0 && (
              <ul className="mt-4 space-y-2">
                {previa.questoes.map((q) => (
                  <li key={q.id} className="rounded-lg border border-slate-200 p-3">
                    <p className="truncate text-[11px] font-medium text-slate-400">
                      {[q.institution, q.year, q.organization].filter(Boolean).join(" · ")}
                    </p>
                    {(q.discipline || q.assuntos[0]) && (
                      <p className="mt-0.5 truncate text-[11px] text-[#5f2ebe]">{[q.discipline, q.assuntos[0]].filter(Boolean).join(" › ")}</p>
                    )}
                    <p className="mt-1 line-clamp-3 text-xs leading-snug text-slate-700">{textoSimples(q.content)}</p>
                  </li>
                ))}
                {total > previa.questoes.length && (
                  <li className="px-1 text-xs text-slate-400">e mais {formatarNumero(total - previa.questoes.length)}...</li>
                )}
              </ul>
            )}

            {orfaos.size > 0 && (
              <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-800">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Os valores em amarelo foram salvos antes e não aparecem mais no banco de questões (talvez tenham sido renomeados).
              </p>
            )}
          </aside>
        </div>

        {/* Rodapé */}
        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:px-5">
          <div className="flex min-w-0 flex-1 items-center gap-3 text-sm text-slate-500">
            {qtdFiltros > 0 ? (
              <>
                <span className="hidden sm:inline">
                  {qtdFiltros} {qtdFiltros === 1 ? "filtro" : "filtros"}
                </span>
                <button type="button" onClick={limparTudo} className="inline-flex items-center gap-1 font-medium hover:text-red-600">
                  <RotateCcw className="h-3.5 w-3.5" /> Limpar tudo
                </button>
              </>
            ) : (
              <span className="hidden sm:inline">Nenhum filtro escolhido</span>
            )}
          </div>
          <Button type="button" variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button type="button" onClick={aplicar} disabled={!alterado} className={ROXO}>
            {!alterado ? "Sem alterações" : qtdFiltros ? "Salvar filtros" : "Remover filtros"}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
};

/** Um filtro: cabeçalho com o que já foi escolhido e, aberto, as opções. */
const CampoFiltro: React.FC<{
  secao: Secao;
  aberto: boolean;
  travado: boolean;
  valores: string[];
  orfaos: Set<string>;
  onAlternarAberto: () => void;
  onTirar: (valor: string) => void;
  onLimpar: () => void;
  children: React.ReactNode;
}> = ({ secao, aberto, travado, valores, orfaos, onAlternarAberto, onTirar, onLimpar, children }) => {
  const Icone = ICONES[secao];
  const MAX_CHIPS = 4;
  const visiveis = valores.slice(0, MAX_CHIPS);
  const resto = valores.length - visiveis.length;

  return (
    <div className={cn(aberto && "bg-slate-50/50")}>
      <div className="flex items-start gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onAlternarAberto}
          disabled={travado}
          aria-expanded={aberto}
          className="flex min-w-0 flex-1 items-start gap-3 text-left disabled:cursor-not-allowed"
        >
          <span
            className={cn(
              "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              travado ? "bg-slate-100 text-slate-300" : valores.length ? "bg-[#5f2ebe] text-white" : "bg-slate-100 text-slate-500"
            )}
          >
            {travado ? <Lock className="h-3.5 w-3.5" /> : <Icone className="h-4 w-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className={cn("block text-sm font-semibold", travado ? "text-slate-400" : "text-slate-800")}>{ROTULO(secao)}</span>
            {travado ? (
              <span className="block text-xs text-slate-400">Escolha uma disciplina primeiro</span>
            ) : valores.length === 0 ? (
              <span className="block text-xs text-slate-400">{aberto ? DICAS[secao] : "Qualquer"}</span>
            ) : null}
          </span>
        </button>
        {!travado && (
          <div className="flex shrink-0 items-center gap-1 pt-1">
            {valores.length > 0 && !aberto && (
              <button type="button" onClick={onLimpar} className="rounded-md px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-red-600">
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={onAlternarAberto}
              aria-label={aberto ? `Fechar ${ROTULO(secao)}` : `Abrir ${ROTULO(secao)}`}
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <ChevronDown className={cn("h-4 w-4 transition-transform", aberto && "rotate-180")} />
            </button>
          </div>
        )}
      </div>

      {valores.length > 0 && (
        <div className="-mt-1 flex flex-wrap gap-1.5 pb-3 pl-[60px] pr-4">
          {(aberto ? valores : visiveis).map((v) => {
            const orfao = orfaos.has(`${secao}|${v}`);
            return (
              <span
                key={v}
                title={orfao ? "Não aparece mais nas opções" : v}
                className={cn(
                  "inline-flex max-w-full items-center gap-1 rounded-full border py-0.5 pl-2.5 pr-1 text-xs font-medium",
                  orfao ? "border-amber-300 bg-amber-50 text-amber-800" : "border-[#5f2ebe]/20 bg-[#5f2ebe]/[0.06] text-[#4b23a0]"
                )}
              >
                <span className="truncate">{secao === "palavra" ? `"${v}"` : v}</span>
                <button type="button" onClick={() => onTirar(v)} aria-label={`Tirar ${v}`} className="rounded-full p-0.5 hover:bg-black/5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}
          {!aberto && resto > 0 && (
            <button type="button" onClick={onAlternarAberto} className="rounded-full px-2 py-0.5 text-xs font-medium text-slate-500 hover:bg-slate-100">
              +{resto}
            </button>
          )}
        </div>
      )}

      {aberto && !travado && <div className="border-t border-slate-100 px-4 py-3 sm:pl-[60px]">{children}</div>}
    </div>
  );
};

/** Opções curtas (ano, escolaridade, dificuldade) como pílulas de marcar. */
const Pilulas: React.FC<{
  grupos: GrupoOpcoes[];
  selecionados: string[];
  onAlternar: (valor: string) => void;
  vazio: string;
}> = ({ grupos, selecionados, onAlternar, vazio }) => {
  const opcoes = grupos.flatMap((g) => g.opcoes);
  if (!opcoes.length) return <p className="py-1 text-sm text-slate-400">{vazio}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {opcoes.map((o) => {
        const marcado = selecionados.includes(o.valor);
        return (
          <button
            key={o.valor}
            type="button"
            role="checkbox"
            aria-checked={marcado}
            onClick={() => onAlternar(o.valor)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors",
              marcado ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-[#5f2ebe]/40 hover:bg-[#5f2ebe]/[0.04]"
            )}
          >
            {marcado && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            {o.valor}
            <span className={cn("text-[11px] tabular-nums", marcado ? "text-white/70" : "text-slate-400")}>{formatarNumero(o.total)}</span>
          </button>
        );
      })}
    </div>
  );
};
