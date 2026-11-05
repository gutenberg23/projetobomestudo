import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, ChevronDown, ChevronRight, ExternalLink, FileQuestion, Layers, Loader2, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CabecalhoAba, Carregando, EstadoVazio, Metrica, Painel, Segmentos } from "../ui";
import { Sunburst, type FatiaSunburst } from "./Sunburst";
import { FiltroMultiplo } from "./FiltroMultiplo";
import {
  abrirFonte,
  descobrirDisciplinasDasQuestoes,
  filtrosVazios,
  linkQuestoes,
  montarEstatisticas,
  type AssuntoContado,
  type Estatisticas,
  type Filtros,
  type FonteEstatisticas,
} from "./dadosEstatisticas";

/**
 * Aba Estatísticas (só para disciplina avulsa em /course/...): mostra quais
 * assuntos e tópicos mais caem nas questões da disciplina, com filtros de
 * banca, instituição e ano.
 */

// Paleta categórica validada (8 cores, ordem fixa). Cada assunto mantém a
// mesma cor quando os filtros mudam: a cor vem da posição do assunto no
// ranking sem filtros, e não da posição atual.
const CORES = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#6250d6", "#e34948"];
const COR_OUTROS = "#94a3b8";
const COR_SEM = "#e2e8f0";
const MAX_CORES = CORES.length;
const RANKING_INICIAL = 12;

/** Mistura a cor com branco (0 = cor pura, 1 = branco). */
function clarear(hex: string, quanto: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * quanto);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const pct = (parte: number, total: number) => (total > 0 ? (parte / total) * 100 : 0);
const fmtPct = (v: number) => `${v.toLocaleString("pt-BR", { maximumFractionDigits: v < 10 ? 1 : 0 })}%`;
const fmt = (n: number) => n.toLocaleString("pt-BR");

const idAssunto = (nome: string) => `a:${nome}`;
const idTopico = (assunto: string, nome: string) => `t:${assunto}\u0000${nome}`;

interface Props {
  courseId: string;
}

export const EstatisticasTab: React.FC<Props> = ({ courseId }) => {
  // Qual disciplina das questões corresponde a esta disciplina do site
  const [nomes, setNomes] = useState<string[] | null>(null);
  const [disciplina, setDisciplina] = useState<string | null>(null);
  const [erroInicial, setErroInicial] = useState(false);

  const [fonte, setFonte] = useState<FonteEstatisticas | null>(null);
  const [carregandoFonte, setCarregandoFonte] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>(filtrosVazios);
  const [estat, setEstat] = useState<Estatisticas | null>(null);
  const [carregandoNumeros, setCarregandoNumeros] = useState(false);
  const [erroNumeros, setErroNumeros] = useState(false);
  /** Ranking sem filtros: define a cor de cada assunto */
  const [ordemBase, setOrdemBase] = useState<string[]>([]);

  const [zoom, setZoom] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [fixo, setFixo] = useState<string | null>(null);
  const [abertos, setAbertos] = useState<Set<string>>(new Set());
  const [verTodos, setVerTodos] = useState(false);
  const pedido = useRef(0);

  // 1. Descobre a disciplina das questões
  useEffect(() => {
    let cancelado = false;
    setNomes(null);
    setErroInicial(false);
    descobrirDisciplinasDasQuestoes(courseId)
      .then((lista) => {
        if (cancelado) return;
        setNomes(lista);
        setDisciplina(lista[0] || null);
      })
      .catch((e) => {
        console.error("Erro ao descobrir a disciplina das questões:", e);
        if (!cancelado) setErroInicial(true);
      });
    return () => {
      cancelado = true;
    };
  }, [courseId]);

  // 2. Abre a fonte dos números (funções do banco ou contagem no navegador)
  useEffect(() => {
    if (!disciplina) return;
    let cancelado = false;
    setFonte(null);
    setEstat(null);
    setOrdemBase([]);
    setFiltros(filtrosVazios());
    setZoom(null);
    setFixo(null);
    setCarregandoFonte(true);
    abrirFonte(disciplina)
      .then((f) => !cancelado && setFonte(f))
      .catch((e) => {
        console.error("Erro ao carregar estatísticas:", e);
        if (!cancelado) setErroNumeros(true);
      })
      .finally(() => !cancelado && setCarregandoFonte(false));
    return () => {
      cancelado = true;
    };
  }, [disciplina]);

  // 3. Conta as questões com os filtros (com uma pequena espera entre cliques)
  useEffect(() => {
    if (!fonte) return;
    const meu = ++pedido.current;
    setCarregandoNumeros(true);
    setErroNumeros(false);
    const semFiltro = !filtros.bancas.length && !filtros.instituicoes.length && !filtros.anos.length;
    const t = setTimeout(() => {
      fonte
        .linhas(filtros)
        .then((linhas) => {
          if (meu !== pedido.current) return;
          const e = montarEstatisticas(linhas);
          setEstat(e);
          if (semFiltro) setOrdemBase(e.assuntos.map((a) => a.nome));
        })
        .catch((err) => {
          console.error("Erro ao contar questões:", err);
          if (meu === pedido.current) setErroNumeros(true);
        })
        .finally(() => meu === pedido.current && setCarregandoNumeros(false));
    }, 250);
    return () => clearTimeout(t);
  }, [fonte, filtros]);

  // Zoom num assunto que sumiu com o filtro: volta para a visão geral
  useEffect(() => {
    if (zoom && estat && !estat.assuntos.some((a) => a.nome === zoom)) setZoom(null);
  }, [estat, zoom]);

  const corDoAssunto = useMemo(() => {
    const mapa = new Map<string, string>();
    ordemBase.slice(0, MAX_CORES).forEach((nome, i) => mapa.set(nome, CORES[i]));
    return mapa;
  }, [ordemBase]);

  const porId = useMemo(() => {
    const mapa = new Map<string, { assunto: AssuntoContado; topico?: { nome: string; total: number } }>();
    estat?.assuntos.forEach((a) => {
      mapa.set(idAssunto(a.nome), { assunto: a });
      a.topicos.forEach((t) => mapa.set(idTopico(a.nome, t.nome), { assunto: a, topico: t }));
    });
    return mapa;
  }, [estat]);

  // Fatias do gráfico
  const fatias = useMemo<FatiaSunburst[]>(() => {
    if (!estat) return [];
    if (zoom) {
      const a = estat.assuntos.find((x) => x.nome === zoom);
      if (!a) return [];
      const cor = corDoAssunto.get(a.nome) || "#64748b";
      const lista: FatiaSunburst[] = a.topicos.map((t, i) => ({
        id: idTopico(a.nome, t.nome),
        nome: t.nome,
        valor: t.total,
        cor: clarear(cor, i % 2 === 0 ? 0 : 0.3),
      }));
      const somaTopicos = a.topicos.reduce((s, t) => s + t.total, 0);
      if (a.total > somaTopicos) lista.push({ id: "sem-topico", nome: "Sem tópico cadastrado", valor: a.total - somaTopicos, cor: COR_SEM, inerte: true });
      return lista;
    }

    const coloridos: FatiaSunburst[] = [];
    let outros = 0;
    estat.assuntos.forEach((a) => {
      const cor = corDoAssunto.get(a.nome);
      if (!cor) {
        outros += a.total;
        return;
      }
      coloridos.push({
        id: idAssunto(a.nome),
        nome: a.nome,
        valor: a.total,
        cor,
        filhos: a.topicos.map((t, i) => ({
          id: idTopico(a.nome, t.nome),
          nome: t.nome,
          valor: t.total,
          cor: clarear(cor, i % 2 === 0 ? 0.35 : 0.55),
        })),
      });
    });
    if (outros > 0) coloridos.push({ id: "outros", nome: "Outros assuntos", valor: outros, cor: COR_OUTROS, inerte: true });
    if (estat.semAssunto > 0) coloridos.push({ id: "sem", nome: "Sem assunto cadastrado", valor: estat.semAssunto, cor: COR_SEM, inerte: true });
    return coloridos;
  }, [estat, zoom, corDoAssunto]);

  if (erroInicial) {
    return <EstadoVazio icone={BarChart3} titulo="Não foi possível carregar as estatísticas" texto="Verifique sua conexão e recarregue a página." />;
  }
  if (nomes === null) return <Carregando texto="Procurando as questões da disciplina..." />;
  if (!disciplina) {
    return (
      <EstadoVazio
        icone={FileQuestion}
        titulo="Ainda não há questões ligadas a esta disciplina"
        texto="Quando os tópicos das aulas tiverem questões, os assuntos mais cobrados aparecem aqui."
      />
    );
  }

  const total = estat?.total ?? 0;
  const ativo = hover || fixo;
  const info = ativo ? porId.get(ativo) : undefined;
  const fatiaAtiva = ativo ? fatias.find((f) => f.id === ativo) : undefined;
  const assuntoZoom = zoom ? estat?.assuntos.find((a) => a.nome === zoom) : undefined;
  const temFiltro = filtros.bancas.length + filtros.instituicoes.length + filtros.anos.length > 0;
  const maior = estat?.assuntos[0];
  const maxAssunto = maior?.total || 1;
  const ranking = estat ? (verTodos ? estat.assuntos : estat.assuntos.slice(0, RANKING_INICIAL)) : [];

  // Miolo do gráfico
  let centro: React.ReactNode;
  if (info || fatiaAtiva) {
    const valor = info?.topico?.total ?? info?.assunto.total ?? fatiaAtiva?.valor ?? 0;
    const nome = info?.topico?.nome ?? info?.assunto.nome ?? fatiaAtiva?.nome ?? "";
    centro = (
      <>
        <span className="text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">{fmtPct(pct(valor, total))}</span>
        <span className="mt-1 text-xs text-slate-500 sm:text-sm">
          {fmt(valor)} de {fmt(total)} questões
        </span>
        <span className="mt-1 line-clamp-2 text-xs font-medium text-slate-700">{nome}</span>
      </>
    );
  } else if (assuntoZoom) {
    centro = (
      <>
        <span className="text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">{fmtPct(pct(assuntoZoom.total, total))}</span>
        <span className="mt-1 line-clamp-2 text-xs font-medium text-slate-700 sm:text-sm">{assuntoZoom.nome}</span>
        <span className="mt-1 text-[11px] text-[#5f2ebe]">Toque aqui para voltar</span>
      </>
    );
  } else {
    centro = (
      <>
        <span className="text-3xl font-bold tabular-nums text-slate-900 sm:text-4xl">{fmt(total)}</span>
        <span className="mt-1 text-xs text-slate-500 sm:text-sm">questões analisadas</span>
        <span className="mt-1 text-[11px] text-slate-400">Toque num assunto para ver os tópicos</span>
      </>
    );
  }

  const alternarAberto = (nome: string) =>
    setAbertos((atual) => {
      const novo = new Set(atual);
      if (novo.has(nome)) novo.delete(nome);
      else novo.add(nome);
      return novo;
    });

  const cliqueFatia = (id: string) => {
    const alvo = porId.get(id);
    if (!alvo) return;
    if (!alvo.topico) {
      // Assunto: abre o zoom com os tópicos dele
      setZoom(alvo.assunto.nome);
      setFixo(null);
      setAbertos((atual) => new Set(atual).add(alvo.assunto.nome));
    } else {
      setFixo((atual) => (atual === id ? null : id));
    }
  };

  const atualizarFiltro = (campo: keyof Filtros, valores: string[]) => setFiltros((f) => ({ ...f, [campo]: valores }));

  return (
    <div className="space-y-5 pb-10">
      <CabecalhoAba
        titulo="Estatísticas"
        descricao={
          <>
            Os assuntos e tópicos que mais caem nas questões de <strong className="font-semibold text-slate-700">{disciplina}</strong>.
            Use os filtros para ver o que a sua banca cobra.
          </>
        }
        acoes={
          nomes.length > 1 ? (
            <Segmentos valor={disciplina} opcoes={nomes.map((n) => ({ valor: n, rotulo: n }))} onChange={setDisciplina} />
          ) : undefined
        }
      />

      {/* Filtros */}
      <Painel className="p-3 sm:p-4">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto]">
          <FiltroMultiplo
            rotulo="Banca"
            plural="bancas"
            todos="Todas as bancas"
            opcoes={fonte?.opcoes.bancas || []}
            selecionados={filtros.bancas}
            onChange={(v) => atualizarFiltro("bancas", v)}
          />
          <FiltroMultiplo
            rotulo="Instituição"
            plural="instituições"
            todos="Todas as instituições"
            opcoes={fonte?.opcoes.instituicoes || []}
            selecionados={filtros.instituicoes}
            onChange={(v) => atualizarFiltro("instituicoes", v)}
          />
          <FiltroMultiplo
            rotulo="Ano"
            plural="anos"
            todos="Todos os anos"
            opcoes={fonte?.opcoes.anos || []}
            selecionados={filtros.anos}
            onChange={(v) => atualizarFiltro("anos", v)}
          />
          {temFiltro && (
            <button
              type="button"
              onClick={() => setFiltros(filtrosVazios())}
              className="flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 sm:col-span-3 lg:col-span-1"
            >
              <X className="h-4 w-4" /> Limpar filtros
            </button>
          )}
        </div>
      </Painel>

      {(carregandoFonte || (!estat && !erroNumeros)) && <Carregando texto="Contando as questões..." />}

      {erroNumeros && !estat && (
        <EstadoVazio icone={BarChart3} titulo="Não foi possível contar as questões" texto="Tente de novo em instantes." />
      )}

      {estat && (
        <div className={cn("space-y-5 transition-opacity", carregandoNumeros && "opacity-60")}>
          {/* Números principais */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            <Metrica rotulo="Questões" valor={fmt(estat.total)} detalhe={temFiltro ? "com os filtros escolhidos" : "da disciplina no site"} icone={FileQuestion} />
            <Metrica rotulo="Assuntos cobrados" valor={fmt(estat.assuntos.length)} detalhe="com ao menos uma questão" icone={Layers} tom="azul" />
            <Metrica
              rotulo="Mais cobrado"
              valor={maior ? fmtPct(pct(maior.total, estat.total)) : "—"}
              detalhe={maior ? <span className="line-clamp-1">{maior.nome}</span> : "sem assuntos"}
              icone={Trophy}
              tom="laranja"
              className="col-span-2 lg:col-span-1"
            />
          </div>

          {estat.total === 0 ? (
            <EstadoVazio
              icone={FileQuestion}
              titulo="Nenhuma questão com esses filtros"
              texto="Tire um dos filtros para ver mais questões."
              acao={
                <button type="button" onClick={() => setFiltros(filtrosVazios())} className="text-sm font-medium text-[#5f2ebe] hover:underline">
                  Limpar filtros
                </button>
              }
            />
          ) : (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              {/* Gráfico */}
              <Painel className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">Veja o que é mais cobrado</h3>
                    {/* Trilha: Todos › Assunto › Tópico */}
                    <nav className="mt-1 flex min-w-0 flex-wrap items-center gap-1 text-xs text-slate-500" aria-label="Caminho no gráfico">
                      <button type="button" onClick={() => { setZoom(null); setFixo(null); }} className={cn("hover:text-[#5f2ebe]", !zoom && "font-medium text-slate-700")}>
                        Todos os assuntos
                      </button>
                      {(zoom || info) && (
                        <>
                          <ChevronRight className="h-3 w-3 shrink-0" />
                          <button type="button" onClick={() => { const n = zoom || info?.assunto.nome; if (n) setZoom(n); setFixo(null); }} className="max-w-[220px] truncate font-medium text-slate-700 hover:text-[#5f2ebe]">
                            {zoom || info?.assunto.nome}
                          </button>
                        </>
                      )}
                      {info?.topico && (
                        <>
                          <ChevronRight className="h-3 w-3 shrink-0" />
                          <span className="max-w-[220px] truncate">{info.topico.nome}</span>
                        </>
                      )}
                    </nav>
                  </div>
                  {carregandoNumeros && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#5f2ebe]" />}
                </div>

                <Sunburst
                  className="mt-4"
                  fatias={fatias}
                  destaque={ativo}
                  onHover={setHover}
                  onClick={cliqueFatia}
                  centro={centro}
                  onClickCentro={zoom ? () => { setZoom(null); setFixo(null); } : undefined}
                  rotulo={`Assuntos mais cobrados em ${disciplina}`}
                />

                {/* Legenda */}
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
                  {(zoom ? [] : fatias).map((f) => (
                    <li key={f.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setHover(f.id)}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => !f.inerte && cliqueFatia(f.id)}
                        className={cn("flex max-w-[220px] items-center gap-1.5", f.inerte && "cursor-default")}
                      >
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: f.cor }} />
                        <span className="truncate">{f.nome}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-slate-400">
                  {zoom
                    ? "Cada fatia é um tópico deste assunto. Toque no miolo para voltar."
                    : "Anel de dentro: assuntos. Anel de fora: tópicos de cada assunto. Toque num assunto para abrir os tópicos."}
                </p>
              </Painel>

              {/* Ranking */}
              <Painel className="p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base font-semibold text-slate-900">Ranking dos assuntos</h3>
                  <span className="text-xs text-slate-400">% das {fmt(estat.total)} questões</span>
                </div>
                <ol className="mt-3 divide-y divide-slate-100">
                  {ranking.map((a, i) => {
                    const aberto = abertos.has(a.nome);
                    const cor = corDoAssunto.get(a.nome) || COR_OUTROS;
                    const maxTopico = a.topicos[0]?.total || 1;
                    return (
                      <li key={a.nome} className="py-2">
                        <button
                          type="button"
                          onClick={() => {
                            alternarAberto(a.nome);
                            setZoom(aberto ? null : a.nome);
                            setFixo(null);
                          }}
                          onMouseEnter={() => !zoom && setHover(idAssunto(a.nome))}
                          onMouseLeave={() => setHover(null)}
                          className="group flex w-full items-center gap-3 rounded-lg text-left"
                          aria-expanded={aberto}
                        >
                          <span className="w-5 shrink-0 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: cor }} />
                              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 group-hover:text-[#5f2ebe]">{a.nome}</span>
                              <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900">{fmtPct(pct(a.total, estat.total))}</span>
                            </span>
                            <span className="mt-1.5 flex items-center gap-2">
                              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <span className="block h-full rounded-full" style={{ width: `${(a.total / maxAssunto) * 100}%`, background: cor }} />
                              </span>
                              <span className="shrink-0 whitespace-nowrap text-right text-[11px] tabular-nums text-slate-400">{fmt(a.total)} questões</span>
                            </span>
                          </span>
                          <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", aberto && "rotate-180")} />
                        </button>

                        {aberto && (
                          <div className="ml-8 mt-2 space-y-1.5 border-l border-slate-100 pl-3">
                            {a.topicos.length === 0 && <p className="text-xs text-slate-400">Nenhum tópico cadastrado nas questões deste assunto.</p>}
                            {a.topicos.map((t) => (
                              <div
                                key={t.nome}
                                className="group/t flex items-center gap-2"
                                onMouseEnter={() => setHover(idTopico(a.nome, t.nome))}
                                onMouseLeave={() => setHover(null)}
                              >
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2 text-xs">
                                    <span className="min-w-0 flex-1 truncate text-slate-700">{t.nome}</span>
                                    <span className="shrink-0 tabular-nums text-slate-500">
                                      {fmt(t.total)} · {fmtPct(pct(t.total, estat.total))}
                                    </span>
                                  </span>
                                  <span className="mt-1 block h-1 overflow-hidden rounded-full bg-slate-100">
                                    <span className="block h-full rounded-full" style={{ width: `${(t.total / maxTopico) * 100}%`, background: clarear(cor, 0.35) }} />
                                  </span>
                                </span>
                                <Link
                                  to={linkQuestoes(disciplina, filtros, a.nome, t.nome)}
                                  title="Resolver questões deste tópico"
                                  className="shrink-0 rounded p-1 text-slate-300 hover:bg-[#5f2ebe]/10 hover:text-[#5f2ebe]"
                                >
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Link>
                              </div>
                            ))}
                            <Link
                              to={linkQuestoes(disciplina, filtros, a.nome)}
                              className="inline-flex items-center gap-1 pt-1 text-xs font-medium text-[#5f2ebe] hover:underline"
                            >
                              Resolver as {fmt(a.total)} questões deste assunto <ChevronRight className="h-3 w-3" />
                            </Link>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ol>
                {estat.assuntos.length > RANKING_INICIAL && (
                  <button
                    type="button"
                    onClick={() => setVerTodos((v) => !v)}
                    className="mt-2 w-full rounded-lg py-2 text-sm font-medium text-[#5f2ebe] hover:bg-[#5f2ebe]/5"
                  >
                    {verTodos ? "Mostrar menos" : `Ver todos os ${estat.assuntos.length} assuntos`}
                  </button>
                )}
                {estat.semAssunto > 0 && (
                  <p className="mt-3 text-xs text-slate-400">
                    {fmt(estat.semAssunto)} {estat.semAssunto === 1 ? "questão ainda não tem" : "questões ainda não têm"} assunto cadastrado e
                    {estat.semAssunto === 1 ? " fica" : " ficam"} de fora do ranking.
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-400">
                  Uma questão pode ter mais de um assunto, por isso as porcentagens podem somar mais de 100%.
                </p>
              </Painel>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
