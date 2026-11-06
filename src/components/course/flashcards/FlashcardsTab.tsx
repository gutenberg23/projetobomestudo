import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Layers,
  PartyPopper,
  Play,
  RotateCcw,
  Search,
  Shuffle,
  X,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@/lib/flashcards";
import { textoSimples } from "@/lib/flashcards";
import { ConteudoCartao } from "@/components/flashcards/ConteudoCartao";
import { BarraProgresso, CabecalhoAba, Carregando, EstadoVazio, Metrica, Painel, normalizar } from "../ui";
import type { FlashcardsCurso, Resultado, TeoriaFlashcards } from "./useFlashcardsCurso";

/** Pedido para abrir direto os cartões desta teoria. */
export interface FocoFlashcards {
  teoriaId: string;
  /** Muda a cada clique, para reabrir a mesma teoria */
  chave: number;
}

interface CartaoSessao extends Flashcard {
  contexto: string;
}

interface Sessao {
  titulo: string;
  subtitulo?: string;
  cartoes: CartaoSessao[];
}

const embaralhar = <T,>(lista: T[]) => {
  const l = [...lista];
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [l[i], l[j]] = [l[j], l[i]];
  }
  return l;
};

const cartoesDe = (teorias: TeoriaFlashcards[]): CartaoSessao[] => {
  const vistos = new Set<string>();
  const lista: CartaoSessao[] = [];
  teorias.forEach((t) =>
    t.cartoes.forEach((c) => {
      if (vistos.has(c.id)) return;
      vistos.add(c.id);
      lista.push({ ...c, contexto: `${t.disciplina.titulo} · ${t.teoria.titulo}` });
    })
  );
  return lista;
};

export const FlashcardsTab: React.FC<{ flash: FlashcardsCurso; foco: FocoFlashcards | null }> = ({ flash, foco }) => {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [busca, setBusca] = useState("");
  const [abertas, setAbertas] = useState<Set<string>>(new Set());

  const todasTeorias = useMemo(() => flash.estrutura.flatMap((d) => d.grupos.flatMap((g) => g.teorias)), [flash.estrutura]);

  // Abre direto os cartões da teoria pedida
  useEffect(() => {
    if (!foco || flash.carregando) return;
    const alvo = todasTeorias.find((t) => t.teoria.id === foco.teoriaId);
    if (alvo) {
      setSessao({ titulo: alvo.teoria.titulo, subtitulo: alvo.disciplina.titulo, cartoes: cartoesDe([alvo]) });
      setAbertas((p) => new Set(p).add(alvo.disciplina.id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foco?.chave, flash.carregando]);

  const iniciar = (s: Sessao) => {
    if (s.cartoes.length === 0) return;
    setSessao(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const stats = (cartoes: Flashcard[]) => {
    let lembrei = 0;
    let esqueci = 0;
    cartoes.forEach((c) => {
      const p = flash.progresso[c.id];
      if (p?.ultimo === "lembrei") lembrei++;
      else if (p?.ultimo === "esqueci") esqueci++;
    });
    return { total: cartoes.length, lembrei, esqueci, novos: cartoes.length - lembrei - esqueci };
  };

  const geral = useMemo(() => stats(cartoesDe(todasTeorias)), [todasTeorias, flash.progresso]); // eslint-disable-line react-hooks/exhaustive-deps
  const esquecidos = useMemo(
    () => cartoesDe(todasTeorias).filter((c) => flash.progresso[c.id]?.ultimo === "esqueci"),
    [todasTeorias, flash.progresso]
  );

  const termo = normalizar(busca);
  const visiveis = useMemo(() => {
    if (!termo) return flash.estrutura;
    return flash.estrutura
      .map((d) => {
        if (normalizar(d.disciplina.titulo).includes(termo)) return d;
        const grupos = d.grupos
          .map((a) => {
            if (normalizar(a.titulo).includes(termo)) return a;
            const teorias = a.teorias.filter(
              (t) =>
                normalizar(t.teoria.titulo).includes(termo) ||
                t.cartoes.some((c) => normalizar(textoSimples(c.frente)).includes(termo) || normalizar(textoSimples(c.verso)).includes(termo))
            );
            return teorias.length ? { ...a, teorias } : null;
          })
          .filter(Boolean) as typeof d.grupos;
        return grupos.length ? { ...d, grupos } : null;
      })
      .filter(Boolean) as typeof flash.estrutura;
  }, [flash.estrutura, termo]);

  if (flash.carregando) return <Carregando texto="Carregando flashcards..." />;
  if (!flash.temFlashcards)
    return <EstadoVazio icone={Layers} titulo="Nenhum flashcard por aqui" texto="Quando houver flashcards nas teorias deste curso, eles aparecem nesta aba." />;

  if (sessao) return <ModoEstudo sessao={sessao} flash={flash} onSair={() => setSessao(null)} onRefazer={iniciar} />;

  const tudoAberto = visiveis.length > 0 && visiveis.every((d) => abertas.has(d.disciplina.id));

  return (
    <div className="space-y-5 pb-10">
      <CabecalhoAba
        titulo="Flashcards"
        descricao="Leia a pergunta, tente lembrar, vire o cartão e diga se acertou. Os cartões estão organizados por disciplina, assunto e teoria."
        acoes={
          <>
            {esquecidos.length > 0 && (
              <button
                type="button"
                onClick={() => iniciar({ titulo: "Cartões que você esqueceu", subtitulo: "Todo o curso", cartoes: esquecidos.map((c) => ({ ...c, contexto: contextoDe(todasTeorias, c) })) })}
                className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                <RotateCcw className="h-4 w-4" />
                Revisar os que esqueci ({esquecidos.length})
              </button>
            )}
            <button
              type="button"
              onClick={() => iniciar({ titulo: "Todos os flashcards", subtitulo: "Em ordem aleatória", cartoes: embaralhar(cartoesDe(todasTeorias)) })}
              className="inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
            >
              <Shuffle className="h-4 w-4" />
              Estudar todos
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metrica rotulo="Cartões" valor={geral.total} icone={Layers} detalhe={`${todasTeorias.length} ${todasTeorias.length === 1 ? "teoria" : "teorias"}`} />
        <Metrica rotulo="Lembrei" valor={geral.lembrei} icone={CheckCircle2} tom="verde" detalhe="na última revisão" />
        <Metrica rotulo="Esqueci" valor={geral.esqueci} icone={XCircle} tom="laranja" detalhe="para revisar de novo" />
        <Metrica rotulo="Não revisados" valor={geral.novos} icone={Play} tom="cinza" detalhe={flash.logado ? "ainda não vistos" : <Link to="/login" className="text-[#5f2ebe] hover:underline">Entre para salvar o progresso</Link>} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar disciplina, tópico ou cartão"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#5f2ebe] focus:ring-2 focus:ring-[#5f2ebe]/15"
          />
          {busca && (
            <button type="button" aria-label="Limpar busca" onClick={() => setBusca("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setAbertas(tudoAberto ? new Set() : new Set(visiveis.map((d) => d.disciplina.id)))}
          className="hidden rounded-xl px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-white hover:text-[#5f2ebe] sm:block"
        >
          {tudoAberto ? "Recolher todas" : "Expandir todas"}
        </button>
      </div>

      {visiveis.length === 0 ? (
        <EstadoVazio icone={Search} titulo="Nada encontrado" texto={`Nenhuma disciplina, teoria ou cartão com “${busca}”.`} />
      ) : (
        <div className="space-y-3">
          {visiveis.map((d) => {
            const teoriasD = d.grupos.flatMap((g) => g.teorias);
            const s = stats(cartoesDe(teoriasD));
            const aberta = abertas.has(d.disciplina.id) || !!termo;
            return (
              <Painel key={d.disciplina.id} className="overflow-hidden">
                <button
                  type="button"
                  aria-expanded={aberta}
                  onClick={() =>
                    setAbertas((p) => {
                      const n = new Set(p);
                      if (n.has(d.disciplina.id)) n.delete(d.disciplina.id);
                      else n.add(d.disciplina.id);
                      return n;
                    })
                  }
                  className="flex w-full items-center gap-3 p-3 text-left sm:gap-4 sm:p-4"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5f2ebe]/10 text-[#5f2ebe]">
                    <Layers className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold leading-snug text-slate-900 sm:text-lg">{d.disciplina.titulo}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {s.total} {s.total === 1 ? "cartão" : "cartões"} · {teoriasD.length} {teoriasD.length === 1 ? "teoria" : "teorias"}
                      {s.lembrei > 0 && <> · <span className="text-emerald-600">{s.lembrei} lembrados</span></>}
                    </p>
                    <BarraProgresso valor={s.total ? (s.lembrei / s.total) * 100 : 0} className="mt-2 h-1.5 max-w-xs" corClasse="bg-emerald-500" />
                  </div>
                  <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition-transform", aberta && "rotate-180")} />
                </button>

                {aberta && (
                  <div className="space-y-4 border-t border-slate-100 bg-slate-50/60 p-3 sm:p-4">
                    {d.grupos.map((a) => (
                      <div key={a.id}>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <p className="min-w-0 text-sm font-semibold text-slate-700">{a.titulo || "Outras teorias"}</p>
                          {a.teorias.length > 1 && (
                            <button
                              type="button"
                              onClick={() => iniciar({ titulo: a.titulo || d.disciplina.titulo, subtitulo: d.disciplina.titulo, cartoes: cartoesDe(a.teorias) })}
                              className="shrink-0 text-xs font-semibold text-[#5f2ebe] hover:underline"
                            >
                              Estudar o assunto inteiro
                            </button>
                          )}
                        </div>
                        <ul className="space-y-1.5">
                          {a.teorias.map((t) => {
                            const st = stats(t.cartoes);
                            return (
                              <li key={t.teoria.id} className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                  <p className="line-clamp-2 text-sm font-medium leading-snug text-slate-800">{t.teoria.titulo}</p>
                                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
                                    <span>
                                      {st.total} {st.total === 1 ? "cartão" : "cartões"}
                                    </span>
                                    {st.lembrei > 0 && <span className="text-emerald-600">{st.lembrei} lembrei</span>}
                                    {st.esqueci > 0 && <span className="text-amber-600">{st.esqueci} esqueci</span>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => iniciar({ titulo: t.teoria.titulo, subtitulo: a.titulo ? `${d.disciplina.titulo} · ${a.titulo}` : d.disciplina.titulo, cartoes: cartoesDe([t]) })}
                                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-[#5f2ebe]/10 px-3 py-1.5 text-sm font-semibold text-[#5f2ebe] hover:bg-[#5f2ebe]/15"
                                >
                                  <Play className="h-3.5 w-3.5" />
                                  Estudar
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </Painel>
            );
          })}
        </div>
      )}
    </div>
  );
};

const contextoDe = (teorias: TeoriaFlashcards[], c: Flashcard) => {
  const t = teorias.find((x) => x.teoria.id === c.teoriaId);
  return t ? `${t.disciplina.titulo} · ${t.teoria.titulo}` : "";
};

/* ------------------------------------------------------------------ */

const ModoEstudo: React.FC<{
  sessao: Sessao;
  flash: FlashcardsCurso;
  onSair: () => void;
  onRefazer: (s: Sessao) => void;
}> = ({ sessao, flash, onSair, onRefazer }) => {
  const [ordem, setOrdem] = useState<CartaoSessao[]>(sessao.cartoes);
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [respostas, setRespostas] = useState<Record<string, Resultado>>({});
  const [fim, setFim] = useState(false);

  useEffect(() => {
    setOrdem(sessao.cartoes);
    setIndice(0);
    setVirado(false);
    setRespostas({});
    setFim(false);
  }, [sessao]);

  const atual = ordem[indice];
  const respondidos = Object.keys(respostas).length;

  const ir = useCallback(
    (i: number) => {
      if (i < 0) return;
      if (i >= ordem.length) {
        setFim(true);
        return;
      }
      setIndice(i);
      setVirado(false);
    },
    [ordem.length]
  );

  const responder = useCallback(
    (r: Resultado) => {
      if (!atual) return;
      setRespostas((p) => ({ ...p, [atual.id]: r }));
      flash.registrar(atual.id, r);
      ir(indice + 1);
    },
    [atual, flash, indice, ir]
  );

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      const alvo = e.target as HTMLElement;
      if (fim || ["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName) || alvo.isContentEditable) return;
      if (e.key === " " || e.key === "Enter") {
        if (alvo.tagName === "BUTTON") return;
        e.preventDefault();
        setVirado((v) => !v);
      } else if (e.key === "ArrowRight") ir(indice + 1);
      else if (e.key === "ArrowLeft") ir(indice - 1);
      else if (virado && e.key === "1") responder("esqueci");
      else if (virado && e.key === "2") responder("lembrei");
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [fim, indice, ir, responder, virado]);

  const lembrei = Object.values(respostas).filter((r) => r === "lembrei").length;
  const esqueci = respondidos - lembrei;

  const cabecalho = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <button type="button" onClick={onSair} className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-[#5f2ebe]">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos flashcards
      </button>
      {!fim && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setOrdem((o) => [...o.slice(0, indice), ...embaralhar(o.slice(indice))]);
              setVirado(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-[#5f2ebe]"
            title="Embaralhar os cartões que faltam"
          >
            <Shuffle className="h-4 w-4" />
            <span className="hidden sm:inline">Embaralhar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setOrdem(sessao.cartoes);
              setIndice(0);
              setVirado(false);
              setRespostas({});
            }}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white hover:text-[#5f2ebe]"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Recomeçar</span>
          </button>
        </div>
      )}
    </div>
  );

  if (fim) {
    const errados = ordem.filter((c) => respostas[c.id] === "esqueci");
    return (
      <div className="mx-auto max-w-3xl space-y-4 pb-10">
        {cabecalho}
        <Painel className="flex flex-col items-center px-6 py-10 text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <PartyPopper className="h-7 w-7" />
          </span>
          <h3 className="text-xl font-bold text-slate-900">Revisão concluída</h3>
          <p className="mt-1 text-sm text-slate-500">{sessao.titulo}</p>
          <div className="mt-6 grid w-full max-w-sm grid-cols-3 gap-3">
            <div className="rounded-xl bg-emerald-50 p-3">
              <p className="text-2xl font-bold tabular-nums text-emerald-700">{lembrei}</p>
              <p className="text-xs text-emerald-700">lembrei</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3">
              <p className="text-2xl font-bold tabular-nums text-amber-700">{esqueci}</p>
              <p className="text-xs text-amber-700">esqueci</p>
            </div>
            <div className="rounded-xl bg-slate-100 p-3">
              <p className="text-2xl font-bold tabular-nums text-slate-600">{ordem.length - respondidos}</p>
              <p className="text-xs text-slate-500">pulados</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {errados.length > 0 && (
              <button
                type="button"
                onClick={() => onRefazer({ ...sessao, titulo: `${sessao.titulo} (revisão)`, cartoes: errados })}
                className="inline-flex items-center gap-2 rounded-xl bg-[#5f2ebe] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4f25a0]"
              >
                <RotateCcw className="h-4 w-4" />
                Revisar os {errados.length} que esqueci
              </button>
            )}
            <button
              type="button"
              onClick={() => onRefazer({ ...sessao, cartoes: [...sessao.cartoes] })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
            >
              Estudar de novo
            </button>
            <button type="button" onClick={onSair} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 hover:text-[#5f2ebe]">
              Voltar
            </button>
          </div>
          {!flash.logado && (
            <p className="mt-6 text-xs text-slate-500">
              <Link to="/login" className="font-medium text-[#5f2ebe] hover:underline">
                Entre na sua conta
              </Link>{" "}
              para guardar quais cartões você já domina.
            </p>
          )}
        </Painel>
      </div>
    );
  }

  if (!atual) return null;
  const anterior = flash.progresso[atual.id];

  return (
    <div className="mx-auto max-w-3xl space-y-4 pb-10">
      {cabecalho}

      <div>
        <p className="truncate text-xs text-slate-500">{sessao.subtitulo}</p>
        <h3 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{sessao.titulo}</h3>
        <div className="mt-3 flex items-center gap-3">
          <BarraProgresso valor={((indice + (virado ? 0.5 : 0)) / ordem.length) * 100} className="h-2" />
          <span className="shrink-0 text-sm tabular-nums text-slate-500">
            {indice + 1}/{ordem.length}
          </span>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={virado ? "Esconder resposta" : "Mostrar resposta"}
        onClick={() => setVirado((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            setVirado((v) => !v);
          }
        }}
        className={cn(
          "relative flex min-h-[300px] cursor-pointer select-text flex-col rounded-3xl border bg-white p-5 shadow-[0_6px_24px_rgba(16,24,40,0.07)] outline-none transition-colors sm:p-8",
          virado ? "border-[#5f2ebe]/30" : "border-slate-200 hover:border-[#5f2ebe]/30",
          "focus-visible:ring-2 focus-visible:ring-[#5f2ebe]/30"
        )}
      >
        <div className="mb-4 flex items-center justify-between gap-3 text-[11px] font-semibold uppercase tracking-wide">
          <span className="text-[#5f2ebe]">Pergunta</span>
          {anterior && (
            <span className={cn("rounded-full px-2 py-0.5 normal-case tracking-normal", anterior.ultimo === "lembrei" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700")}>
              Última vez: {anterior.ultimo === "lembrei" ? "lembrei" : "esqueci"}
            </span>
          )}
        </div>
        <ConteudoCartao texto={atual.frente} className="text-center text-lg font-medium leading-relaxed text-slate-900 sm:text-xl" />

        {virado ? (
          <>
            <div className="my-5 border-t border-dashed border-slate-200" />
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Resposta</p>
            <ConteudoCartao texto={atual.verso} className="text-center text-base leading-relaxed text-slate-700 sm:text-lg" />
          </>
        ) : (
          <p className="mt-auto pt-8 text-center text-xs text-slate-400">Toque no cartão ou aperte Espaço para ver a resposta</p>
        )}
        {atual.contexto && sessao.cartoes.some((c) => c.teoriaId !== atual.teoriaId) && (
          <p className="mt-6 truncate text-center text-[11px] text-slate-400">{atual.contexto}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => ir(indice - 1)}
          disabled={indice === 0}
          aria-label="Cartão anterior"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#5f2ebe] disabled:opacity-40"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {virado ? (
          <div className="grid flex-1 grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => responder("esqueci")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-sm font-semibold text-amber-800 hover:bg-amber-100"
            >
              <XCircle className="h-4 w-4" />
              Não lembrei
              <kbd className="hidden rounded bg-white/70 px-1.5 text-[10px] font-medium text-amber-700 sm:inline">1</kbd>
            </button>
            <button
              type="button"
              onClick={() => responder("lembrei")}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              Lembrei
              <kbd className="hidden rounded bg-white/20 px-1.5 text-[10px] font-medium sm:inline">2</kbd>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setVirado(true)}
            className="h-11 flex-1 rounded-xl bg-[#5f2ebe] text-sm font-semibold text-white shadow-sm hover:bg-[#4f25a0]"
          >
            Mostrar resposta
          </button>
        )}

        <button
          type="button"
          onClick={() => ir(indice + 1)}
          aria-label={indice + 1 >= ordem.length ? "Terminar" : "Próximo cartão"}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#5f2ebe]"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <p className="text-center text-xs text-slate-400">
        {respondidos > 0 && (
          <>
            <span className="text-emerald-600">{lembrei} lembrei</span> · <span className="text-amber-600">{esqueci} esqueci</span> ·{" "}
          </>
        )}
        <span className="hidden sm:inline">Atalhos: Espaço vira · 1 não lembrei · 2 lembrei · setas navegam</span>
      </p>
    </div>
  );
};
