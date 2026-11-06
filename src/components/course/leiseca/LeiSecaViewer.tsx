import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookOpenText, ChevronDown, ChevronUp, Eye, Minus, PartyPopper, PencilLine, Plus, RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarraProgresso, Painel, Segmentos } from "../ui";

export interface LeiSeca {
  id: string;
  titulo: string;
  conteudo: string;
  palavras_treino: Array<{ palavra: string; posicao: number }>;
}

export type ModoLei = "ler" | "treinar";

interface LeiSecaViewerProps {
  lei: LeiSeca;
  onBack: () => void;
  modoInicial?: ModoLei;
}

type Trecho = { tipo: "texto"; texto: string } | { tipo: "lacuna"; n: number; palavra: string };
type EstadoLacuna = "certa" | "revelada";

const TAMANHOS = ["text-sm", "text-[15px]", "text-base", "text-lg", "text-xl"];

/** Comparação sem acento e sem caixa. */
const simplificar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Divide o texto em trechos e lacunas, a partir das posições salvas no admin. */
const montarTrechos = (lei: LeiSeca): Trecho[] => {
  const marcas = [...(Array.isArray(lei.palavras_treino) ? lei.palavras_treino : [])]
    .filter((m) => m && typeof m.posicao === "number" && m.palavra && lei.conteudo.substr(m.posicao, m.palavra.length) === m.palavra)
    .sort((a, b) => a.posicao - b.posicao);
  const trechos: Trecho[] = [];
  let cursor = 0;
  let n = 0;
  marcas.forEach((m) => {
    if (m.posicao < cursor) return; // marcação sobreposta
    if (m.posicao > cursor) trechos.push({ tipo: "texto", texto: lei.conteudo.slice(cursor, m.posicao) });
    trechos.push({ tipo: "lacuna", n: n++, palavra: m.palavra });
    cursor = m.posicao + m.palavra.length;
  });
  if (cursor < lei.conteudo.length) trechos.push({ tipo: "texto", texto: lei.conteudo.slice(cursor) });
  return trechos;
};

// "Art. 5º", "§ 2º", "Parágrafo único" e "CAPÍTULO/TÍTULO/SEÇÃO" em destaque
const MARCADORES = /(Art\.\s*\d+[ºo°]?(?:-[A-Z])?|§\s*\d+[ºo°]?|Parágrafo único|(?:^|\n)\s*(?:TÍTULO|CAPÍTULO|SEÇÃO|Seção|Subseção)\s+[IVXLCDM]+[^\n]*)/g;

/** Realça as ocorrências da busca (sem acento) dentro de um pedaço de texto. */
const realcar = (texto: string, termo: string, chave: string): React.ReactNode => {
  if (!termo) return texto;
  // Mapa caractere a caractere, para achar a busca no texto sem acento e realçar no original
  let simples = "";
  const mapa: number[] = [];
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i].normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
    for (let k = 0; k < c.length; k++) {
      simples += c[k];
      mapa.push(i);
    }
  }
  const partes: React.ReactNode[] = [];
  let ultimo = 0;
  let idx = simples.indexOf(termo);
  let j = 0;
  while (idx !== -1) {
    const ini = mapa[idx];
    const fim = mapa[idx + termo.length - 1] + 1;
    if (ini > ultimo) partes.push(texto.slice(ultimo, ini));
    partes.push(
      <mark key={`${chave}-${j++}`} data-busca className="rounded bg-amber-200/80 px-0.5 text-inherit">
        {texto.slice(ini, fim)}
      </mark>
    );
    ultimo = fim;
    idx = simples.indexOf(termo, idx + termo.length);
  }
  if (ultimo < texto.length) partes.push(texto.slice(ultimo));
  return partes;
};

const formatar = (texto: string, termo: string, chave: string): React.ReactNode[] =>
  texto.split(MARCADORES).map((parte, i) =>
    i % 2 === 1 ? (
      <strong key={`${chave}-m${i}`} className="font-semibold text-slate-900">
        {realcar(parte, termo, `${chave}-m${i}`)}
      </strong>
    ) : (
      <React.Fragment key={`${chave}-t${i}`}>{realcar(parte, termo, `${chave}-t${i}`)}</React.Fragment>
    )
  );

export const LeiSecaViewer = ({ lei, onBack, modoInicial = "ler" }: LeiSecaViewerProps) => {
  const trechos = useMemo(() => montarTrechos(lei), [lei]);
  const totalLacunas = trechos.filter((t) => t.tipo === "lacuna").length;
  const [modo, setModo] = useState<ModoLei>(totalLacunas > 0 ? modoInicial : "ler");
  const [tamanho, setTamanho] = useState(1);

  // Leitura: busca no texto
  const [busca, setBusca] = useState("");
  const [ocorrencia, setOcorrencia] = useState(0);
  const termo = simplificar(busca).length >= 2 ? simplificar(busca) : "";
  const areaTexto = useRef<HTMLDivElement>(null);
  const [totalOcorrencias, setTotalOcorrencias] = useState(0);

  // Treino
  const [respostas, setRespostas] = useState<Record<number, string>>({});
  const [estados, setEstados] = useState<Record<number, EstadoLacuna>>({});
  const [verificado, setVerificado] = useState(false);
  const campos = useRef<Record<number, HTMLInputElement | null>>({});

  const certas = Object.values(estados).filter((e) => e === "certa").length;
  const reveladas = Object.values(estados).filter((e) => e === "revelada").length;
  const resolvidas = certas + reveladas;
  const terminou = totalLacunas > 0 && resolvidas === totalLacunas;

  const recomecar = () => {
    setRespostas({});
    setEstados({});
    setVerificado(false);
    requestAnimationFrame(() => campos.current[0]?.focus());
  };

  useEffect(() => {
    if (modo === "treinar") recomecar();
  }, [modo]);

  // Conta as ocorrências realçadas e rola até a atual
  useEffect(() => {
    const marks = areaTexto.current?.querySelectorAll("mark[data-busca]") || [];
    setTotalOcorrencias(marks.length);
    marks.forEach((m, i) => m.classList.toggle("ring-2", i === ocorrencia));
    marks.forEach((m, i) => m.classList.toggle("ring-amber-500", i === ocorrencia));
    if (marks[ocorrencia]) (marks[ocorrencia] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
  }, [termo, ocorrencia, modo]);

  useEffect(() => setOcorrencia(0), [termo]);

  const proximaLacunaAberta = (depoisDe: number) => {
    for (let i = depoisDe + 1; i < totalLacunas; i++) if (!estados[i]) return i;
    for (let i = 0; i < depoisDe; i++) if (!estados[i]) return i;
    return -1;
  };

  const responder = (n: number, valor: string, palavra: string) => {
    setRespostas((r) => ({ ...r, [n]: valor }));
    if (simplificar(valor) === simplificar(palavra)) {
      setEstados((e) => ({ ...e, [n]: "certa" }));
      const prox = proximaLacunaAberta(n);
      if (prox !== -1) requestAnimationFrame(() => campos.current[prox]?.focus());
    }
  };

  const revelar = (n: number) => setEstados((e) => ({ ...e, [n]: e[n] || "revelada" }));
  const revelarTodas = () =>
    setEstados((e) => {
      const novo = { ...e };
      for (let i = 0; i < totalLacunas; i++) if (!novo[i]) novo[i] = "revelada";
      return novo;
    });

  const renderTreino = () =>
    trechos.map((t, i) => {
      if (t.tipo === "texto") return <React.Fragment key={i}>{formatar(t.texto, "", `t${i}`)}</React.Fragment>;
      const est = estados[t.n];
      if (est) {
        return (
          <span
            key={i}
            className={cn(
              "rounded px-1 font-semibold",
              est === "certa" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800 underline decoration-dotted"
            )}
            title={est === "revelada" ? "Palavra revelada" : "Você acertou"}
          >
            {t.palavra}
          </span>
        );
      }
      const valor = respostas[t.n] || "";
      const errada = verificado && valor.trim() !== "";
      return (
        <span key={i} className="mx-0.5 inline-flex items-center align-baseline">
          <input
            ref={(el) => {
              campos.current[t.n] = el;
            }}
            value={valor}
            onChange={(e) => responder(t.n, e.target.value, t.palavra)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const prox = proximaLacunaAberta(t.n);
                if (prox !== -1) campos.current[prox]?.focus();
              }
            }}
            aria-label={`Lacuna ${t.n + 1}`}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{ width: `${Math.max(4, Math.min(24, t.palavra.length + 1))}ch` }}
            className={cn(
              "h-[1.7em] rounded-md border-b-2 bg-[#5f2ebe]/[0.06] px-1 text-center font-medium text-slate-900 outline-none transition-colors focus:bg-[#5f2ebe]/10",
              errada ? "border-red-400 bg-red-50" : "border-[#5f2ebe]/50 focus:border-[#5f2ebe]"
            )}
          />
          <button
            type="button"
            onClick={() => revelar(t.n)}
            className="ml-0.5 rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
            title="Mostrar a palavra"
            aria-label={`Mostrar a palavra da lacuna ${t.n + 1}`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </span>
      );
    });

  return (
    <div className="space-y-4 pb-5">
      {/* Barra superior fixa */}
      <div className="sticky top-16 z-20 -mx-[10px] bg-[rgb(242,244,246)]/95 px-[10px] py-2 backdrop-blur md:-mx-1 md:px-1">
        <Painel className="flex flex-wrap items-center gap-2 p-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Todas as leis</span>
          </button>
          {totalLacunas > 0 && (
            <Segmentos<ModoLei>
              valor={modo}
              onChange={setModo}
              opcoes={[
                {
                  valor: "ler",
                  rotulo: (
                    <>
                      <BookOpenText className="h-4 w-4" /> Ler
                    </>
                  ),
                },
                {
                  valor: "treinar",
                  rotulo: (
                    <>
                      <PencilLine className="h-4 w-4" /> Treinar
                    </>
                  ),
                },
              ]}
            />
          )}

          {modo === "ler" && (
            <div className="relative order-last w-full sm:order-none sm:ml-auto sm:w-64">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && totalOcorrencias > 0) {
                    e.preventDefault();
                    setOcorrencia((o) => (e.shiftKey ? (o - 1 + totalOcorrencias) % totalOcorrencias : (o + 1) % totalOcorrencias));
                  }
                }}
                placeholder="Buscar no texto..."
                className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-24 text-sm outline-none focus:border-[#5f2ebe]/50"
              />
              {termo && (
                <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center gap-0.5 text-xs text-slate-500">
                  <span className="px-1 tabular-nums">{totalOcorrencias ? `${ocorrencia + 1}/${totalOcorrencias}` : "0"}</span>
                  <button
                    type="button"
                    disabled={!totalOcorrencias}
                    onClick={() => setOcorrencia((o) => (o - 1 + totalOcorrencias) % totalOcorrencias)}
                    className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Ocorrência anterior"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={!totalOcorrencias}
                    onClick={() => setOcorrencia((o) => (o + 1) % totalOcorrencias)}
                    className="rounded p-0.5 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Próxima ocorrência"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setBusca("")} className="rounded p-0.5 hover:bg-slate-100" aria-label="Limpar busca">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className={cn("flex items-center gap-0.5 rounded-lg border border-slate-200 p-0.5", modo === "treinar" && "ml-auto")}>
            <button
              type="button"
              onClick={() => setTamanho((t) => Math.max(0, t - 1))}
              disabled={tamanho === 0}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Diminuir letra"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-1 text-xs font-semibold text-slate-500">Aa</span>
            <button
              type="button"
              onClick={() => setTamanho((t) => Math.min(TAMANHOS.length - 1, t + 1))}
              disabled={tamanho === TAMANHOS.length - 1}
              className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
              aria-label="Aumentar letra"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </Painel>

        {modo === "treinar" && totalLacunas > 0 && (
          <Painel className="mt-2 flex flex-col gap-2 p-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="mb-1.5 flex justify-between text-xs text-slate-500">
                <span>
                  <b className="font-semibold text-slate-800">{resolvidas}</b> de {totalLacunas} lacunas
                  {certas > 0 && <span className="text-emerald-600"> · {certas} acertadas</span>}
                  {reveladas > 0 && <span className="text-amber-600"> · {reveladas} reveladas</span>}
                </span>
              </div>
              <BarraProgresso valor={(resolvidas / totalLacunas) * 100} corClasse="bg-emerald-500" />
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setVerificado(true)}
                disabled={terminou}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe] disabled:opacity-40"
              >
                Verificar
              </button>
              <button
                type="button"
                onClick={revelarTodas}
                disabled={terminou}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe] disabled:opacity-40"
              >
                Mostrar respostas
              </button>
              <button
                type="button"
                onClick={recomecar}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-[#5f2ebe]/40 hover:text-[#5f2ebe]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Recomeçar
              </button>
            </div>
          </Painel>
        )}
      </div>

      <Painel className="px-5 py-6 sm:px-8 sm:py-8 lg:px-12">
        <h2 className="mb-1 text-xl font-bold tracking-tight text-slate-900 md:text-2xl">{lei.titulo}</h2>
        {modo === "treinar" && (
          <p className="mb-5 text-sm text-slate-500">
            Digite a palavra que falta em cada lacuna. Acento e maiúsculas não importam; ao acertar, o cursor vai para a próxima.
          </p>
        )}
        {modo === "ler" && <div className="mb-5" />}

        {terminou && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
            <PartyPopper className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">
                Treino concluído: {certas} de {totalLacunas} sem ajuda ({Math.round((certas / totalLacunas) * 100)}%).
              </p>
              <p className="text-emerald-700">
                {reveladas > 0 ? "Releia os trechos em amarelo e tente de novo." : "Excelente! Você completou todas as lacunas sem ajuda."}
              </p>
            </div>
            <button type="button" onClick={recomecar} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-emerald-800 hover:bg-emerald-100">
              Treinar de novo
            </button>
          </div>
        )}

        <div
          ref={areaTexto}
          className={cn("whitespace-pre-wrap break-words leading-[1.85] text-slate-700", TAMANHOS[tamanho])}
        >
          {modo === "ler" ? formatar(lei.conteudo, termo, "l") : renderTreino()}
        </div>
      </Painel>
    </div>
  );
};
