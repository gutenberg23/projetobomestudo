import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownUp, ChevronLeft, ChevronRight, ExternalLink, FileQuestion, Layers, List, Square, Target } from "lucide-react";
import { QuestionCard } from "@/components/new/QuestionCard";
import { EstadoVazio, Segmentos } from "@/components/course/ui";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Paginacao } from "@/components/questions/busca/Paginacao";
import { CartaoCarregando } from "@/components/questions/busca/CartaoCarregando";
import { SessaoEstudo } from "@/components/questions/busca/SessaoEstudo";
import { useBuscaQuestoes } from "@/components/questions/busca/useBuscaQuestoes";
import { useTentativas } from "@/components/questions/busca/useTentativas";
import {
  ROTULOS_ORDEM,
  ROTULOS_SITUACAO,
  formatarNumero,
  type EstadoBusca,
  type Ordem,
  type Situacao,
} from "@/components/questions/busca/filtros";
import { lerFiltrosTeoria, linkQuestoesTeoria } from "./filtrosQuestoes";

type Modo = "lista" | "foco";

const lerModo = (): Modo => {
  try {
    return localStorage.getItem("questoes_modo") === "foco" ? "foco" : "lista";
  } catch {
    return "lista";
  }
};

interface Props {
  /** O que está gravado em teorias.questoes_filtros. */
  filtros: unknown;
  /** Avisa o total, para o número na aba. */
  onTotal?: (n: number) => void;
  /** Elemento para onde rolar ao trocar de página. */
  rolarPara?: () => void;
}

/**
 * Questões da aba Questões da teoria, com o mesmo visual e as mesmas
 * ferramentas de /questions: cartão moderno, placar da sessão, situação
 * (para quem está logado), ordem, lista ou uma por vez e paginação numerada.
 */
export const QuestoesTeoria: React.FC<Props> = ({ filtros: gravado, onTotal, rolarPara }) => {
  const { user } = useAuth();
  const tentativas = useTentativas(user?.id);
  const base = useMemo(() => lerFiltrosTeoria(gravado), [gravado]);
  const link = useMemo(() => linkQuestoesTeoria(gravado), [gravado]);

  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(10);
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [situacaoEscolhida, setSituacao] = useState<Situacao>("todas");
  const situacao: Situacao = user ? situacaoEscolhida : "todas";
  const [modo, setModo] = useState<Modo>(lerModo);
  const [atual, setAtual] = useState(0);
  const [riscadas, setRiscadas] = useState<Record<string, string[]>>({});
  const irParaUltima = useRef(false);
  const topo = useRef<HTMLDivElement>(null);

  const estado: EstadoBusca = { q: base.palavra, filtros: base.filtros, pagina, porPagina, ordem, situacao };
  const restricao = useMemo(
    () => tentativas.restricaoPara(situacao),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [situacao, tentativas.carregando]
  );
  const esperando = situacao !== "todas" && tentativas.carregando;
  const { questoes, total, carregando: buscando, foraDoLimite } = useBuscaQuestoes(estado, restricao, esperando);
  const carregando = buscando || esperando;

  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const primeiroNumero = (pagina - 1) * porPagina + 1;
  const fimDaLista = atual >= questoes.length - 1 && pagina >= totalPaginas;

  useEffect(() => {
    if (foraDoLimite) setPagina(1);
  }, [foraDoLimite]);

  // O total sem filtro de situação é o número da aba
  useEffect(() => {
    if (!carregando && situacao === "todas") onTotal?.(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregando, total, situacao]);

  useEffect(() => {
    if (carregando) return;
    setAtual(irParaUltima.current ? Math.max(0, questoes.length - 1) : 0);
    irParaUltima.current = false;
  }, [questoes, carregando]);

  const rolar = () => (rolarPara ? rolarPara() : topo.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  const trocarPagina = (p: number) => {
    setPagina(p);
    rolar();
  };
  const trocarModo = (m: Modo) => {
    setModo(m);
    try {
      localStorage.setItem("questoes_modo", m);
    } catch {
      /* sem armazenamento */
    }
  };
  const proxima = () => {
    if (atual < questoes.length - 1) setAtual(atual + 1);
    else if (pagina < totalPaginas) trocarPagina(pagina + 1);
    else return;
    rolar();
  };
  const anterior = () => {
    if (atual > 0) setAtual(atual - 1);
    else if (pagina > 1) {
      irParaUltima.current = true;
      trocarPagina(pagina - 1);
    } else return;
    rolar();
  };

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

  const riscar = (questaoId: string, opcaoId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setRiscadas((p) => {
      const l = p[questaoId] || [];
      return { ...p, [questaoId]: l.includes(opcaoId) ? l.filter((x) => x !== opcaoId) : [...l, opcaoId] };
    });
  };

  const situacaoDe = (id: string) => {
    const r = tentativas.mapa.get(id);
    return r === undefined ? null : r ? "acertou" : "errou";
  };

  return (
    <div ref={topo} className="scroll-mt-24 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Questões sobre o assunto</h2>
        <Link
          to={link}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-[#5f2ebe] hover:underline"
          title="Abrir no banco de questões"
        >
          <ExternalLink className="h-4 w-4" />
          <span className="hidden sm:inline">Abrir no banco de questões</span>
          <span className="sm:hidden">Banco</span>
        </Link>
      </div>

      {/* Barra de resultados */}
      <div className="flex flex-wrap items-center gap-2">
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
            onChange={(e) => {
              setOrdem(e.target.value as Ordem);
              setPagina(1);
            }}
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

      {user && (
        <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-0.5" role="group" aria-label="Situação">
          {(Object.keys(ROTULOS_SITUACAO) as Situacao[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setSituacao(s);
                setPagina(1);
              }}
              aria-pressed={situacao === s}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                situacao === s ? "border-[#5f2ebe] bg-[#5f2ebe] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              )}
            >
              {ROTULOS_SITUACAO[s]}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <SessaoEstudo />
        {!carregando && totalPaginas > 1 && (
          <span className="text-sm tabular-nums text-slate-500">
            Página {formatarNumero(pagina)} de {formatarNumero(totalPaginas)}
          </span>
        )}
      </div>

      {carregando ? (
        <div className="space-y-4">
          <CartaoCarregando />
          {modo === "lista" && <CartaoCarregando />}
        </div>
      ) : questoes.length === 0 ? (
        <EstadoVazio
          icone={situacao === "erradas" ? Target : situacao === "nao_resolvidas" ? Layers : FileQuestion}
          titulo={
            situacao === "erradas"
              ? "Você não errou nenhuma questão daqui"
              : situacao === "acertadas"
                ? "Você ainda não acertou questões daqui"
                : situacao === "nao_resolvidas"
                  ? "Você já resolveu todas as questões daqui"
                  : "Nenhuma questão por enquanto"
          }
          texto={situacao === "todas" ? "Ainda não há questões cadastradas para este assunto." : undefined}
          acao={
            situacao !== "todas" ? (
              <button
                type="button"
                onClick={() => setSituacao("todas")}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Ver todas
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
              // No modo foco as outras ficam escondidas (e não desmontadas) para não perder a resposta marcada
              <div key={questao.id} className={cn(modo === "foco" && i !== atual && "hidden")}>
                <QuestionCard
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  question={questao as any}
                  disabledOptions={riscadas[questao.id] || []}
                  onToggleDisabled={(opcaoId, e) => riscar(questao.id, opcaoId, e)}
                  aparencia="moderna"
                  numero={primeiroNumero + i}
                  situacaoAnterior={situacaoDe(questao.id)}
                  onAnswered={tentativas.registrar}
                />
              </div>
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
            onPorPagina={(n) => {
              setPorPagina(n);
              setPagina(1);
            }}
            className="rounded-2xl border border-slate-200/80 bg-white/60 px-4 py-3"
          />
        </>
      )}
    </div>
  );
};
