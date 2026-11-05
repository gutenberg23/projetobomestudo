import React, { useEffect, useRef, useState } from "react";
import { ArrowDownUp, Calculator, ChevronDown, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PublicLayout } from "@/components/layout/PublicLayout";
import AdBanner from "@/components/ads/AdBanner";
import QuestionResults from "@/components/questions/QuestionResults";
import { ScoreCounter } from "@/components/questions/ScoreCounter";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ListaOpcoes } from "@/components/questions/busca/ListaOpcoes";
import { Paginacao } from "@/components/questions/busca/Paginacao";
import { FiltrosAplicados } from "@/components/questions/busca/FiltrosAplicados";
import { CampoBusca, SecoesFiltro } from "@/components/questions/busca/SecoesFiltro";
import { useEstadoBusca } from "@/components/questions/busca/useEstadoBusca";
import { useOpcoesFiltro } from "@/components/questions/busca/useOpcoesFiltro";
import { useBuscaQuestoes } from "@/components/questions/busca/useBuscaQuestoes";
import {
  FILTROS_VISIVEIS,
  ROTULOS,
  ROTULOS_ORDEM,
  contarFiltros,
  formatarNumero,
  type ChaveFiltro,
  type Ordem,
} from "@/components/questions/busca/filtros";

const plural = (n: number, um: string, varios: string) => `${formatarNumero(n)} ${n === 1 ? um : varios}`;

/** Botão de um filtro na barra (computador). Abre a lista num Popover, fora de qualquer modal. */
const BotaoFiltro: React.FC<{
  chave: ChaveFiltro;
  selecionados: string[];
  travado: boolean;
  children: React.ReactNode;
}> = ({ chave, selecionados, travado, children }) => {
  const qtd = selecionados.length;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={travado}
          title={travado ? "Escolha uma disciplina primeiro" : undefined}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            qtd > 0
              ? "border-[#5f2ebe] bg-[#5f2ebe]/[0.07] text-[#4b23a0]"
              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 data-[state=open]:border-[#5f2ebe]"
          )}
        >
          {ROTULOS[chave]}
          {qtd > 0 && <span className="rounded-full bg-[#5f2ebe] px-1.5 text-[11px] font-semibold leading-[18px] tabular-nums text-white">{qtd}</span>}
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] rounded-xl border-slate-200 p-3 shadow-lg">
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{ROTULOS[chave]}</p>
        {children}
      </PopoverContent>
    </Popover>
  );
};

const Questions = () => {
  const { estado, definirBusca, alternar, limparChave, limparTudo, irPagina, definirPorPagina, definirOrdem } = useEstadoBusca();
  const opcoes = useOpcoesFiltro();
  const { questoes, total, carregando, foraDoLimite } = useBuscaQuestoes(estado);
  const [mostrarPlacar, setMostrarPlacar] = useState(false);
  const [gavetaAberta, setGavetaAberta] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<Record<string, string[]>>({});
  const topoResultados = useRef<HTMLDivElement>(null);

  const { filtros, q, pagina, porPagina, ordem } = estado;
  const qtdFiltros = contarFiltros(filtros);
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));

  useEffect(() => {
    if (foraDoLimite) irPagina(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foraDoLimite]);

  const trocarPagina = (p: number) => {
    irPagina(p);
    topoResultados.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const riscarAlternativa = (questionId: string, optionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setDisabledOptions((prev) => {
      const atuais = prev[questionId] || [];
      return { ...prev, [questionId]: atuais.includes(optionId) ? atuais.filter((id) => id !== optionId) : [...atuais, optionId] };
    });
  };

  const seletorOrdem = (
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
  );

  return (
    <PublicLayout>
      <div className="flex min-h-screen flex-col bg-[rgb(242,244,246)]">
        <Header />
        <main className="flex-1">
          {/* Topo */}
          <section className="relative overflow-hidden border-b border-slate-200/70 bg-white">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#5f2ebe]/15 to-[#ea2be2]/10 blur-2xl" />
            <div className="container relative mx-auto px-4 py-8 md:py-10">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#5f2ebe]">Banco de questões</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Questões de concursos</h1>
                  <p className="mt-1 max-w-xl text-sm text-slate-500">
                    {opcoes.carregando
                      ? "Resolva questões de provas anteriores com gabarito e comentários."
                      : `${plural(opcoes.totalQuestoes, "questão", "questões")} de ${plural(opcoes.totalBancas, "banca", "bancas")} e ${plural(
                          opcoes.totalDisciplinas,
                          "disciplina",
                          "disciplinas"
                        )}, com gabarito e comentários.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarPlacar((v) => !v)}
                  aria-pressed={mostrarPlacar}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 self-start rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors md:self-auto",
                    mostrarPlacar ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  )}
                >
                  <Calculator className="h-4 w-4" />
                  {mostrarPlacar ? "Contando acertos" : "Contar acertos e tempo"}
                </button>
              </div>

              <CampoBusca valor={q} onBuscar={definirBusca} grande className="mt-5 max-w-3xl" />
            </div>
          </section>

          {mostrarPlacar && <ScoreCounter onClose={() => setMostrarPlacar(false)} />}

          <div className="container mx-auto space-y-4 px-4 py-6">
            {/* Barra de filtros */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-[0_1px_3px_rgba(16,24,40,0.05)] md:p-4">
              <div className="flex items-center justify-between gap-3">
                {/* Celular: um botão que abre a gaveta */}
                <button
                  type="button"
                  onClick={() => setGavetaAberta(true)}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 md:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {qtdFiltros > 0 && <span className="rounded-full bg-[#5f2ebe] px-1.5 text-[11px] leading-[18px] text-white">{qtdFiltros}</span>}
                </button>

                {/* Computador: um botão por filtro */}
                <div className="hidden min-w-0 flex-1 flex-wrap items-center gap-2 md:flex">
                  <span className="mr-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    <SlidersHorizontal className="h-4 w-4 text-[#5f2ebe]" /> Filtrar
                  </span>
                  {FILTROS_VISIVEIS.map((chave) => (
                    <BotaoFiltro
                      key={chave}
                      chave={chave}
                      selecionados={filtros[chave]}
                      travado={(chave === "topics" || chave === "subtopics") && filtros.disciplines.length === 0}
                    >
                      {opcoes.carregando ? (
                        <p className="px-1 py-3 text-sm text-slate-400">Carregando opções...</p>
                      ) : (
                        <ListaOpcoes
                          grupos={opcoes.opcoesDe(chave, filtros)}
                          selecionados={filtros[chave]}
                          onAlternar={(v) => alternar(chave, v)}
                          onLimpar={() => limparChave(chave)}
                          vazio={opcoes.dicaVazio(chave, filtros)}
                          autoFocus
                        />
                      )}
                    </BotaoFiltro>
                  ))}
                </div>

                <div className="shrink-0">{seletorOrdem}</div>
              </div>

              <FiltrosAplicados
                q={q}
                filtros={filtros}
                onRemover={alternar}
                onLimparBusca={() => definirBusca("")}
                onLimparTudo={limparTudo}
                className="mt-3 border-t border-slate-100 pt-3"
              />
            </div>

            <AdBanner position="questions_filters" className="rounded-lg" />

            {/* Resumo dos resultados */}
            <div ref={topoResultados} className="flex scroll-mt-4 flex-wrap items-baseline justify-between gap-2 px-1">
              <p className="text-sm text-slate-500">
                {carregando ? (
                  "Buscando questões..."
                ) : (
                  <>
                    <strong className="text-base font-bold text-slate-900 tabular-nums">{formatarNumero(total)}</strong>{" "}
                    {total === 1 ? "questão encontrada" : "questões encontradas"}
                  </>
                )}
              </p>
              {!carregando && totalPaginas > 1 && (
                <p className="text-sm tabular-nums text-slate-500">
                  Página {formatarNumero(pagina)} de {formatarNumero(totalPaginas)}
                </p>
              )}
            </div>

            <QuestionResults
              questions={questoes}
              loading={carregando}
              disabledOptions={disabledOptions}
              onToggleDisabled={riscarAlternativa}
              currentPage={pagina}
              totalPages={1}
              onPageChange={trocarPagina}
              hasFilters={qtdFiltros > 0 || !!q}
            />

            {!carregando && total > 0 && (
              <Paginacao
                pagina={pagina}
                totalPaginas={totalPaginas}
                total={total}
                porPagina={porPagina}
                onPagina={trocarPagina}
                onPorPagina={definirPorPagina}
                className="rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3"
              />
            )}
          </div>
        </main>
        <Footer />
      </div>

      {/* Gaveta de filtros do celular: listas abertas na própria tela, sem Popover dentro do Sheet */}
      <Sheet open={gavetaAberta} onOpenChange={setGavetaAberta}>
        <SheetContent side="left" className="flex w-full max-w-sm flex-col gap-0 p-0">
          <SheetHeader className="border-b border-slate-100 px-5 py-4 text-left">
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-5">
            <SecoesFiltro
              filtros={filtros}
              opcoesDe={opcoes.opcoesDe}
              dicaVazio={opcoes.dicaVazio}
              onAlternar={alternar}
              onLimparChave={limparChave}
              carregando={opcoes.carregando}
            />
          </div>
          <div className="flex items-center gap-2 border-t border-slate-100 px-5 py-3">
            {qtdFiltros > 0 && (
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
