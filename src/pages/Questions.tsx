import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAbrirLogin } from "@/components/auth/LoginObrigatorio";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Layers,
  List,
  LogIn,
  SearchX,
  SlidersHorizontal,
  Square,
  Target,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import AdBanner from "@/components/ads/AdBanner";
import AdBannerList from "@/components/ads/AdBannerList";
import { QuestionCard } from "@/components/new/QuestionCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { EstadoVazio, Segmentos, BarraProgresso } from "@/components/course/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Paginacao } from "@/components/questions/busca/Paginacao";
import { FiltrosAplicados } from "@/components/questions/busca/FiltrosAplicados";
import { CampoBusca, SecoesFiltro } from "@/components/questions/busca/SecoesFiltro";
import { SessaoEstudo } from "@/components/questions/busca/SessaoEstudo";
import { useEstadoBusca } from "@/components/questions/busca/useEstadoBusca";
import { useOpcoesFiltro } from "@/components/questions/busca/useOpcoesFiltro";
import { useBuscaQuestoes } from "@/components/questions/busca/useBuscaQuestoes";
import { useTentativas } from "@/components/questions/busca/useTentativas";
import {
  ROTULOS_ORDEM,
  ROTULOS_SITUACAO,
  contarFiltros,
  formatarNumero,
  type Ordem,
  type Situacao,
} from "@/components/questions/busca/filtros";

type Modo = "lista" | "foco";

const plural = (n: number, um: string, varios: string) => `${formatarNumero(n)} ${n === 1 ? um : varios}`;

const lerModo = (): Modo => {
  try {
    return localStorage.getItem("questoes_modo") === "foco" ? "foco" : "lista";
  } catch {
    return "lista";
  }
};

/** Escolha de situação (só para quem está logado). */
const EscolhaSituacao: React.FC<{ valor: Situacao; onChange: (s: Situacao) => void }> = ({ valor, onChange }) => (
  <div className="grid grid-cols-2 gap-1.5">
    {(Object.keys(ROTULOS_SITUACAO) as Situacao[]).map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => onChange(s)}
        aria-pressed={valor === s}
        className={cn(
          "rounded-lg border px-2 py-1.5 text-xs font-semibold transition-colors",
          valor === s ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
        )}
      >
        {ROTULOS_SITUACAO[s]}
      </button>
    ))}
  </div>
);

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

const Questions = () => {
  const { user } = useAuth();
  const abrirLogin = useAbrirLogin();
  const { estado, definirBusca, alternar, limparChave, limparTudo, irPagina, definirPorPagina, definirOrdem, definirSituacao } =
    useEstadoBusca();
  const opcoes = useOpcoesFiltro();
  const tentativas = useTentativas(user?.id);
  const { filtros, q, pagina, porPagina, ordem } = estado;
  const situacao: Situacao = user ? estado.situacao : "todas";

  // A lista de ids da situação é tirada uma vez por escolha; responder uma questão não a faz sumir da tela.
  const restricao = useMemo(
    () => tentativas.restricaoPara(situacao),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [situacao, tentativas.carregando]
  );
  const esperandoTentativas = situacao !== "todas" && tentativas.carregando;
  const { questoes, total, carregando: buscando, foraDoLimite } = useBuscaQuestoes(estado, restricao, esperandoTentativas);
  const carregando = buscando || esperandoTentativas;

  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<Record<string, string[]>>({});
  const [modo, setModo] = useState<Modo>(lerModo);
  const [atual, setAtual] = useState(0);
  const irParaUltima = useRef(false);
  const topoResultados = useRef<HTMLDivElement>(null);

  const qtdFiltros = contarFiltros(filtros) + (situacao !== "todas" ? 1 : 0);
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const primeiroNumero = (pagina - 1) * porPagina + 1;

  useEffect(() => {
    if (foraDoLimite) irPagina(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foraDoLimite]);

  // Ao chegar numa página nova, o modo foco começa na primeira questão (ou na última, se voltou).
  useEffect(() => {
    if (carregando) return;
    setAtual(irParaUltima.current ? Math.max(0, questoes.length - 1) : 0);
    irParaUltima.current = false;
  }, [questoes, carregando]);

  const trocarModo = (m: Modo) => {
    setModo(m);
    try {
      localStorage.setItem("questoes_modo", m);
    } catch {
      /* sem armazenamento: só não lembra a escolha */
    }
  };

  const rolarParaResultados = () => topoResultados.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const trocarPagina = (p: number) => {
    irPagina(p);
    rolarParaResultados();
  };

  const proxima = () => {
    if (atual < questoes.length - 1) setAtual(atual + 1);
    else if (pagina < totalPaginas) trocarPagina(pagina + 1);
    else return;
    rolarParaResultados();
  };
  const anterior = () => {
    if (atual > 0) setAtual(atual - 1);
    else if (pagina > 1) {
      irParaUltima.current = true;
      trocarPagina(pagina - 1);
    } else return;
    rolarParaResultados();
  };

  // Setas do teclado no modo foco
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

  const riscarAlternativa = (questionId: string, optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions((prev) => {
      const atuais = prev[questionId] || [];
      return { ...prev, [questionId]: atuais.includes(optionId) ? atuais.filter((id) => id !== optionId) : [...atuais, optionId] };
    });
  };

  const situacaoDe = (id: string) => {
    const r = tentativas.mapa.get(id);
    return r === undefined ? null : r ? "acertou" : "errou";
  };

  const filtrosLaterais = (
    <>
      {user && (
        <div className="border-b border-slate-100 pb-4">
          <p className="mb-2 text-sm font-semibold text-slate-800">Situação</p>
          <EscolhaSituacao valor={situacao} onChange={definirSituacao} />
        </div>
      )}
      <SecoesFiltro
        filtros={filtros}
        opcoesDe={opcoes.opcoesDe}
        dicaVazio={opcoes.dicaVazio}
        onAlternar={alternar}
        onLimparChave={limparChave}
        carregando={opcoes.carregando}
      />
    </>
  );

  const temBusca = qtdFiltros > 0 || !!q;
  const fimDaLista = modo === "foco" && atual === questoes.length - 1 && pagina === totalPaginas;

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className="container relative mx-auto grid gap-6 px-4 py-8 md:py-10 lg:grid-cols-[1fr_320px] lg:items-end">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Banco de questões</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Treine com questões de provas</h1>
                <p className="mt-1 max-w-xl text-sm text-slate-500">
                  {opcoes.carregando
                    ? "Questões de concursos anteriores com gabarito e comentários."
                    : `${plural(opcoes.totalQuestoes, "questão", "questões")} de ${plural(opcoes.totalBancas, "banca", "bancas")} e ${plural(
                        opcoes.totalDisciplinas,
                        "disciplina",
                        "disciplinas"
                      )}, com gabarito e comentários.`}
                </p>
                <CampoBusca valor={q} onBuscar={definirBusca} grande className="mt-5 max-w-2xl" />
              </div>

              {/* Desempenho do aluno */}
              {user ? (
                <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur lg:p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Seu desempenho</span>
                    <Target className="h-4 w-4 text-[#5f2ebe]" />
                  </div>
                  <div className="mt-2 flex items-end gap-6">
                    <div>
                      <div className="text-xl font-bold tabular-nums text-slate-900 lg:text-2xl">{formatarNumero(tentativas.resumo.resolvidas)}</div>
                      <div className="text-xs text-slate-500">resolvidas</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold tabular-nums text-emerald-600 lg:text-2xl">{tentativas.resumo.aproveitamento}%</div>
                      <div className="text-xs text-slate-500">de acerto</div>
                    </div>
                  </div>
                  <BarraProgresso valor={tentativas.resumo.aproveitamento} corClasse="bg-emerald-500" className="mt-3 hidden lg:block" />
                  {tentativas.resumo.resolvidas > tentativas.resumo.acertos && (
                    <button
                      type="button"
                      onClick={() => definirSituacao("erradas")}
                      className="mt-3 text-xs font-semibold text-[#5f2ebe] hover:underline"
                    >
                      Refazer as {formatarNumero(tentativas.resumo.resolvidas - tentativas.resumo.acertos)} que errei →
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4">
                  <p className="text-sm font-semibold text-slate-800">Acompanhe sua evolução</p>
                  <p className="mt-1 text-xs text-slate-500">Entre para guardar suas respostas, ver só as que errou e esconder as que já resolveu.</p>
                  <button
                    type="button"
                    onClick={() => abrirLogin({ motivo: "acompanhar sua evolução" })}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#5f2ebe] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4f25a0]"
                  >
                    <LogIn className="h-3.5 w-3.5" /> Entrar
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            {/* Filtros (computador) */}
            <aside className="hidden lg:block">
              <div className="sticky top-20 flex max-h-[calc(100vh-6rem)] flex-col rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <SlidersHorizontal className="h-4 w-4 text-[#5f2ebe]" /> Filtros
                  </span>
                  {temBusca && (
                    <button type="button" onClick={limparTudo} className="text-xs font-semibold text-[#5f2ebe] hover:underline">
                      Limpar tudo
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto px-4 pt-3">{filtrosLaterais}</div>
              </div>
            </aside>

            <div className="min-w-0 space-y-4">
              {/* Barra de resultados */}
              <div ref={topoResultados} className="flex scroll-mt-4 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setGavetaAberta(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {qtdFiltros > 0 && <span className="rounded-full bg-[#5f2ebe] px-1.5 text-[11px] leading-[18px] text-white">{qtdFiltros}</span>}
                </button>
                <p className="mr-auto text-sm text-slate-500">
                  {carregando ? (
                    "Buscando..."
                  ) : (
                    <>
                      <strong className="text-base font-bold tabular-nums text-slate-900">{formatarNumero(total)}</strong>{" "}
                      {total === 1 ? "questão" : "questões"}
                    </>
                  )}
                </p>
                <label className="flex items-center gap-1.5 text-sm text-slate-500">
                  <ArrowDownUp className="h-4 w-4" />
                  <span className="sr-only">Ordenar por</span>
                  <select
                    value={ordem}
                    onChange={(e) => definirOrdem(e.target.value as Ordem)}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm text-slate-700 outline-none focus:border-[#5f2ebe]"
                  >
                    {(Object.keys(ROTULOS_ORDEM) as Ordem[]).map((o) => (
                      <option key={o} value={o}>
                        {ROTULOS_ORDEM[o]}
                      </option>
                    ))}
                  </select>
                </label>
                <Segmentos<Modo>
                  valor={modo}
                  onChange={trocarModo}
                  className="bg-slate-200/60"
                  opcoes={[
                    {
                      valor: "lista",
                      rotulo: (
                        <>
                          <List className="h-4 w-4" /> <span className="hidden sm:inline">Lista</span>
                        </>
                      ),
                    },
                    {
                      valor: "foco",
                      rotulo: (
                        <>
                          <Square className="h-4 w-4" /> <span className="hidden sm:inline">Uma por vez</span>
                        </>
                      ),
                    },
                  ]}
                />
              </div>

              <FiltrosAplicados
                q={q}
                filtros={filtros}
                onRemover={alternar}
                onLimparBusca={() => definirBusca("")}
                onLimparTudo={limparTudo}
                extra={
                  situacao !== "todas" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#5f2ebe]/20 bg-[#5f2ebe]/[0.06] py-1 pl-3 pr-1 text-xs font-medium text-[#4b23a0]">
                      <span className="text-[#5f2ebe]/70">Situação:</span> {ROTULOS_SITUACAO[situacao]}
                      <button
                        type="button"
                        onClick={() => definirSituacao("todas")}
                        aria-label="Remover situação"
                        className="rounded-full p-0.5 hover:bg-[#5f2ebe]/15"
                      >
                        ×
                      </button>
                    </span>
                  ) : undefined
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-2">
                <SessaoEstudo />
                {!carregando && totalPaginas > 1 && (
                  <span className="text-sm tabular-nums text-slate-500">
                    Página {formatarNumero(pagina)} de {formatarNumero(totalPaginas)}
                  </span>
                )}
              </div>

              <AdBanner position="questions_filters" className="rounded-lg" />

              {/* Questões */}
              {carregando ? (
                <div className="space-y-4">
                  <CartaoCarregando />
                  {modo === "lista" && <CartaoCarregando />}
                </div>
              ) : questoes.length === 0 ? (
                <EstadoVazio
                  icone={situacao === "erradas" ? Target : situacao === "nao_resolvidas" ? Layers : SearchX}
                  titulo={
                    situacao === "erradas" && !temBusca
                      ? "Você ainda não errou nenhuma questão"
                      : situacao === "nao_resolvidas" && !contarFiltros(filtros) && !q
                        ? "Você já resolveu todas as questões"
                        : temBusca
                          ? "Nenhuma questão com esses filtros"
                          : "Nenhuma questão disponível"
                  }
                  texto={temBusca ? "Tire um filtro ou procure por outra palavra." : undefined}
                  acao={
                    temBusca ? (
                      <button
                        type="button"
                        onClick={limparTudo}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Limpar filtros
                      </button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  {modo === "foco" && (
                    <div className="flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2 shadow-[0_1px_3px_rgba(16,24,40,0.05)]">
                      <button
                        type="button"
                        onClick={anterior}
                        disabled={atual === 0 && pagina === 1}
                        aria-label="Questão anterior"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <div className="min-w-0 flex-1 text-center">
                        <p className="text-sm font-semibold tabular-nums text-slate-900">
                          Questão {formatarNumero(primeiroNumero + atual)} de {formatarNumero(total)}
                        </p>
                        <div className="mt-1 hidden justify-center gap-1 sm:flex">
                          {questoes.map((qq, i) => {
                            const s = situacaoDe(qq.id);
                            return (
                              <button
                                key={qq.id}
                                type="button"
                                onClick={() => setAtual(i)}
                                aria-label={`Ir para a questão ${primeiroNumero + i}`}
                                className={cn(
                                  "h-1.5 rounded-full transition-all",
                                  i === atual ? "w-6 bg-[#5f2ebe]" : "w-3",
                                  i !== atual && (s === "acertou" ? "bg-emerald-400" : s === "errou" ? "bg-red-400" : "bg-slate-200 hover:bg-slate-300")
                                )}
                              />
                            );
                          })}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={proxima}
                        disabled={fimDaLista}
                        className="inline-flex h-9 items-center gap-1 rounded-lg bg-[#5f2ebe] px-3 text-sm font-semibold text-white hover:bg-[#4f25a0] disabled:opacity-40"
                      >
                        <span className="hidden sm:inline">Próxima</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="space-y-4">
                    {questoes.map((questao, i) => (
                      <React.Fragment key={questao.id}>
                        {/* No modo foco as outras ficam escondidas (e não desmontadas) para não perder a resposta marcada */}
                        <div className={cn(modo === "foco" && i !== atual && "hidden")}>
                          <QuestionCard
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            question={questao as any}
                            disabledOptions={disabledOptions[questao.id] || []}
                            onToggleDisabled={(optionId, event) => riscarAlternativa(questao.id, optionId, event)}
                            aparencia="moderna"
                            numero={primeiroNumero + i}
                            situacaoAnterior={situacaoDe(questao.id)}
                            onAnswered={tentativas.registrar}
                          />
                        </div>
                        {modo === "lista" && (i + 1) % 5 === 0 && i < questoes.length - 1 && (
                          <AdBannerList position="questions_list" indice={(i + 1) / 5 - 1} />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {modo === "foco" && !fimDaLista && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={proxima}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#5f2ebe] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
                      >
                        Próxima questão <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <Paginacao
                    pagina={pagina}
                    totalPaginas={totalPaginas}
                    total={total}
                    porPagina={porPagina}
                    onPagina={trocarPagina}
                    onPorPagina={definirPorPagina}
                    className="rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3"
                  />
                </>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Filtros no celular: as listas ficam abertas na gaveta, sem Popover dentro do Sheet */}
      <Sheet open={gavetaAberta} onOpenChange={setGavetaAberta}>
        <SheetContent side="left" className="flex w-full max-w-sm flex-col gap-0 p-0">
          <SheetHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5 pt-4">{filtrosLaterais}</div>
          <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
            {temBusca && (
              <button type="button" onClick={limparTudo} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Limpar
              </button>
            )}
            <button
              type="button"
              onClick={() => setGavetaAberta(false)}
              className="flex-1 rounded-xl bg-[#5f2ebe] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#4f25a0]"
            >
              {carregando ? "Ver questões" : `Ver ${plural(total, "questão", "questões")}`}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </PublicLayout>
  );
};

export default Questions;
