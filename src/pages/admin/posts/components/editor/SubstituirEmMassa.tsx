import React, { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { ArrowRight, ClipboardList, Plus, ReplaceAll, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* --------------------------------------------------------------------------
 * Substituir em massa: vários pares "procurar → substituir por" aplicados de
 * uma vez no texto do editor, numa única ação (Ctrl+Z desfaz tudo).
 * No modo HTML, a troca é feita direto no código (inclusive tags e atributos).
 * É um painel embutido na barra do editor (e não um Popover/Dialog) para
 * funcionar também quando o editor estiver dentro de um modal.
 * ------------------------------------------------------------------------ */

export interface ParSubstituicao {
  id: string;
  procurar: string;
  substituir: string;
}

export interface OpcoesSubstituicao {
  diferenciarMaiusculas: boolean;
  palavraInteira: boolean;
}

interface Ocorrencia {
  from: number;
  to: number;
  par: ParSubstituicao;
}

const CHAVE_STORAGE = "bomestudo:substituir-em-massa";
/** Representa imagens, quebras de linha e questões: nunca casa com o texto procurado. */
const MARCADOR_NAO_TEXTO = "￼";

const novoId = () => Math.random().toString(36).slice(2, 10);
const parVazio = (): ParSubstituicao => ({ id: novoId(), procurar: "", substituir: "" });
const escaparRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Monta uma única expressão com todos os pares, para substituir tudo "ao mesmo tempo"
 * (trocar A→B e B→A funciona, e um par não reprocessa o resultado de outro). */
function montarRegex(pares: ParSubstituicao[], opcoes: OpcoesSubstituicao) {
  const vistos = new Set<string>();
  const ativos = pares.filter((p) => {
    if (!p.procurar) return false;
    const chave = opcoes.diferenciarMaiusculas ? p.procurar : p.procurar.toLocaleLowerCase("pt-BR");
    if (vistos.has(chave)) return false; // repetido: vale o primeiro da lista
    vistos.add(chave);
    return true;
  });
  if (!ativos.length) return null;
  // Os mais longos primeiro: "direito penal" ganha de "direito"
  const ordem = [...ativos].sort((a, b) => b.procurar.length - a.procurar.length);
  let fonte = ordem.map((p) => `(${escaparRegex(p.procurar)})`).join("|");
  if (opcoes.palavraInteira) fonte = `(?<![\\p{L}\\p{N}_])(?:${fonte})(?![\\p{L}\\p{N}_])`;
  return { regex: new RegExp(fonte, opcoes.diferenciarMaiusculas ? "gu" : "giu"), ordem };
}

/** Procura em cada parágrafo/título/célula, inclusive em trechos com formatação mista
 * (ex.: "con<b>curso</b>" casa com "concurso"). */
function encontrarOcorrencias(doc: PMNode, pares: ParSubstituicao[], opcoes: OpcoesSubstituicao): Ocorrencia[] {
  const montado = montarRegex(pares, opcoes);
  if (!montado) return [];
  const { regex, ordem } = montado;
  const ocorrencias: Ocorrencia[] = [];

  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    let texto = "";
    const mapa: number[] = []; // posição no documento de cada caractere de `texto`
    node.forEach((filho, offset) => {
      const base = pos + 1 + offset;
      if (filho.isText && filho.text) {
        texto += filho.text;
        for (let i = 0; i < filho.text.length; i++) mapa.push(base + i);
      } else {
        texto += MARCADOR_NAO_TEXTO;
        mapa.push(base);
      }
    });
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(texto))) {
      if (!m[0]) {
        regex.lastIndex++;
        continue;
      }
      const grupo = m.slice(1).findIndex((g) => g !== undefined);
      if (grupo < 0) continue;
      ocorrencias.push({
        from: mapa[m.index],
        to: mapa[m.index + m[0].length - 1] + 1,
        par: ordem[grupo],
      });
    }
    return false;
  });
  return ocorrencias;
}

/** Ocorrências num texto simples (o código HTML do modo HTML). */
function encontrarNoTexto(texto: string, pares: ParSubstituicao[], opcoes: OpcoesSubstituicao) {
  const montado = montarRegex(pares, opcoes);
  if (!montado) return { ocorrencias: [] as { par: ParSubstituicao }[], resultado: texto };
  const { regex, ordem } = montado;
  const ocorrencias: { par: ParSubstituicao }[] = [];
  const resultado = texto.replace(regex, (trecho: string, ...grupos: unknown[]) => {
    const indice = grupos.slice(0, ordem.length).findIndex((g) => g !== undefined);
    if (indice < 0) return trecho;
    ocorrencias.push({ par: ordem[indice] });
    return ordem[indice].substituir;
  });
  return { ocorrencias, resultado };
}

/** Aplica todas as substituições numa transação só. Devolve quantas foram feitas. */
function substituirTudo(editor: Editor, pares: ParSubstituicao[], opcoes: OpcoesSubstituicao): number {
  const ocorrencias = encontrarOcorrencias(editor.state.doc, pares, opcoes);
  if (!ocorrencias.length) return 0;
  const { tr, schema } = editor.state;
  // De trás para frente, para as posições anteriores continuarem válidas
  for (let i = ocorrencias.length - 1; i >= 0; i--) {
    const { from, to, par } = ocorrencias[i];
    if (!par.substituir) {
      tr.delete(from, to);
      continue;
    }
    // Mantém a formatação do trecho original (negrito, cor, link...)
    const marks = tr.doc.resolve(from).marksAcross(tr.doc.resolve(to)) ?? [];
    tr.replaceWith(from, to, schema.text(par.substituir, marks));
  }
  editor.view.dispatch(tr.scrollIntoView());
  return ocorrencias.length;
}

/** Lê uma lista colada: uma troca por linha, separada por "=>", "->", "→", tabulação ou ";". */
function lerLista(texto: string): ParSubstituicao[] {
  return texto
    .split(/\r?\n/)
    .map((linha) => {
      const partes = linha.split(/\s*(?:=>|->|→|\t|;)\s*/);
      if (partes.length < 2) return null;
      const procurar = partes[0].trim();
      if (!procurar) return null;
      return { id: novoId(), procurar, substituir: partes.slice(1).join(" ").trim() };
    })
    .filter((p): p is ParSubstituicao => p !== null);
}

function carregarSalvo(): { pares: ParSubstituicao[]; opcoes: OpcoesSubstituicao } {
  const padrao = { pares: [parVazio(), parVazio()], opcoes: { diferenciarMaiusculas: false, palavraInteira: true } };
  try {
    const bruto = localStorage.getItem(CHAVE_STORAGE);
    if (!bruto) return padrao;
    const salvo = JSON.parse(bruto);
    const pares = Array.isArray(salvo?.pares)
      ? salvo.pares
          .filter((p: unknown): p is { procurar: string; substituir: string } =>
            typeof (p as ParSubstituicao)?.procurar === "string" && typeof (p as ParSubstituicao)?.substituir === "string")
          .map((p: { procurar: string; substituir: string }) => ({ id: novoId(), procurar: p.procurar, substituir: p.substituir }))
      : [];
    return {
      pares: pares.length ? pares : padrao.pares,
      opcoes: { ...padrao.opcoes, ...(salvo?.opcoes || {}) },
    };
  } catch {
    return padrao;
  }
}

/* --------------------------------------------------------------------------
 * Painel
 * ------------------------------------------------------------------------ */

/** Onde as trocas são feitas: no editor visual ou no código HTML. */
export type AlvoSubstituicao =
  | { tipo: "editor"; editor: Editor }
  | { tipo: "html"; html: string; onTrocar: (novo: string) => void };

export const PainelSubstituirEmMassa: React.FC<{ alvo: AlvoSubstituicao; onFechar: () => void }> = ({ alvo, onFechar }) => {
  const editor = alvo.tipo === "editor" ? alvo.editor : null;
  const htmlAtual = alvo.tipo === "html" ? alvo.html : null;
  // Modo HTML: guarda o código anterior para o botão "Desfazer"
  const [anterior, setAnterior] = useState<string | null>(null);
  useEffect(() => setAnterior(null), [alvo.tipo]);
  const [inicial] = useState(carregarSalvo);
  const [pares, setPares] = useState<ParSubstituicao[]>(inicial.pares);
  const [opcoes, setOpcoes] = useState<OpcoesSubstituicao>(inicial.opcoes);
  const [colando, setColando] = useState(false);
  const [lista, setLista] = useState("");
  const [versao, setVersao] = useState(0);

  // Recontar quando o texto do editor mudar
  useEffect(() => {
    if (!editor) return;
    const aoMudar = () => setVersao((v) => v + 1);
    editor.on("update", aoMudar);
    return () => {
      editor.off("update", aoMudar);
    };
  }, [editor]);

  // Lembra a última lista neste navegador (útil para trocas que se repetem)
  useEffect(() => {
    try {
      const paraSalvar = pares.filter((p) => p.procurar || p.substituir).map(({ procurar, substituir }) => ({ procurar, substituir }));
      localStorage.setItem(CHAVE_STORAGE, JSON.stringify({ pares: paraSalvar, opcoes }));
    } catch {
      /* armazenamento indisponível: segue sem lembrar */
    }
  }, [pares, opcoes]);

  const contagem = useMemo(() => {
    const porPar = new Map<string, number>();
    const ocorrencias: { par: ParSubstituicao }[] = editor
      ? encontrarOcorrencias(editor.state.doc, pares, opcoes)
      : encontrarNoTexto(htmlAtual ?? "", pares, opcoes).ocorrencias;
    ocorrencias.forEach((o) => porPar.set(o.par.id, (porPar.get(o.par.id) || 0) + 1));
    return { porPar, total: ocorrencias.length };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, htmlAtual, pares, opcoes, versao]);

  const repetidos = useMemo(() => {
    const vistos = new Set<string>();
    const ids = new Set<string>();
    pares.forEach((p) => {
      if (!p.procurar) return;
      const chave = opcoes.diferenciarMaiusculas ? p.procurar : p.procurar.toLocaleLowerCase("pt-BR");
      if (vistos.has(chave)) ids.add(p.id);
      vistos.add(chave);
    });
    return ids;
  }, [pares, opcoes.diferenciarMaiusculas]);

  const atualizar = (id: string, campo: "procurar" | "substituir", valor: string) =>
    setPares((atual) => atual.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)));

  const remover = (id: string) =>
    setPares((atual) => {
      const resto = atual.filter((p) => p.id !== id);
      return resto.length ? resto : [parVazio()];
    });

  const usarLista = () => {
    const lidos = lerLista(lista);
    if (!lidos.length) {
      toast.error('Nenhuma troca encontrada. Use uma por linha, como "antigo => novo".');
      return;
    }
    setPares((atual) => [...atual.filter((p) => p.procurar || p.substituir), ...lidos]);
    setLista("");
    setColando(false);
    toast.success(`${lidos.length} ${lidos.length === 1 ? "troca adicionada" : "trocas adicionadas"}.`);
  };

  const aplicar = () => {
    let feitas = 0;
    if (alvo.tipo === "editor") {
      feitas = substituirTudo(alvo.editor, pares, opcoes);
    } else {
      const { ocorrencias, resultado } = encontrarNoTexto(alvo.html, pares, opcoes);
      feitas = ocorrencias.length;
      if (feitas) {
        setAnterior(alvo.html);
        alvo.onTrocar(resultado);
      }
    }
    if (!feitas) {
      toast.info(alvo.tipo === "html" ? "Nenhuma ocorrência encontrada no código." : "Nenhuma ocorrência encontrada no texto.");
      return;
    }
    const plural = feitas === 1 ? "substituição feita" : "substituições feitas";
    toast.success(`${feitas} ${plural}. ${alvo.tipo === "html" ? 'Use "Desfazer" no painel para voltar.' : "Ctrl+Z desfaz."}`);
  };

  const desfazerHtml = () => {
    if (alvo.tipo !== "html" || anterior === null) return;
    alvo.onTrocar(anterior);
    setAnterior(null);
    toast.success("Substituições desfeitas.");
  };

  // Enter num campo não pode enviar o formulário do post/teoria
  const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>, indice: number) => {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      onFechar();
      return;
    }
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      aplicar();
      return;
    }
    if (indice === pares.length - 1) setPares((atual) => [...atual, parVazio()]);
  };

  const preenchidos = pares.filter((p) => p.procurar).length;

  return (
    <div className="border-t border-slate-100 bg-[#faf8ff] px-3 py-2.5 text-sm" role="region" aria-label="Substituir em massa">
      <div className="mb-2 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <span className="flex items-center gap-1.5 font-medium text-[#5f2ebe]">
          <ReplaceAll className="h-4 w-4" /> Substituir em massa
          {alvo.tipo === "html" && (
            <span className="rounded bg-[#5f2ebe]/10 px-1.5 py-0.5 text-[11px] font-medium" title="As trocas valem para todo o código, inclusive tags e atributos">
              no código HTML
            </span>
          )}
        </span>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-[#5f2ebe]"
            checked={opcoes.palavraInteira}
            onChange={(e) => setOpcoes((o) => ({ ...o, palavraInteira: e.target.checked }))}
          />
          Só palavra inteira
        </label>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            className="h-3.5 w-3.5 accent-[#5f2ebe]"
            checked={opcoes.diferenciarMaiusculas}
            onChange={(e) => setOpcoes((o) => ({ ...o, diferenciarMaiusculas: e.target.checked }))}
          />
          Diferenciar maiúsculas
        </label>
        <span className="flex-1" />
        <button
          type="button"
          onClick={onFechar}
          title="Fechar"
          aria-label="Fechar substituir em massa"
          className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[45vh] space-y-1.5 overflow-y-auto pr-0.5">
        <div className="hidden grid-cols-[1fr_1rem_1fr_4.5rem_2rem] gap-2 px-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400 sm:grid">
          <span>Procurar</span>
          <span />
          <span>Substituir por</span>
          <span className="text-center">{alvo.tipo === "html" ? "No código" : "No texto"}</span>
          <span />
        </div>
        {pares.map((par, indice) => {
          const n = contagem.porPar.get(par.id) || 0;
          const repetido = repetidos.has(par.id);
          return (
            <div
              key={par.id}
              className="grid grid-cols-[1fr_2rem] gap-x-2 gap-y-1 rounded-md border border-slate-200 bg-white p-1.5 sm:grid-cols-[1fr_1rem_1fr_4.5rem_2rem] sm:items-center sm:border-0 sm:bg-transparent sm:p-0"
            >
              <Input
                value={par.procurar}
                onChange={(e) => atualizar(par.id, "procurar", e.target.value)}
                onKeyDown={(e) => aoTeclar(e, indice)}
                placeholder="Texto atual"
                aria-label={`Procurar (troca ${indice + 1})`}
                className="h-8 bg-white text-sm"
                autoFocus={indice === 0 && !par.procurar}
              />
              <button
                type="button"
                onClick={() => remover(par.id)}
                title="Remover esta troca"
                aria-label={`Remover troca ${indice + 1}`}
                className="row-span-2 flex h-8 w-8 items-center justify-center self-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 sm:hidden"
              >
                <X className="h-4 w-4" />
              </button>
              <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" aria-hidden />
              <Input
                value={par.substituir}
                onChange={(e) => atualizar(par.id, "substituir", e.target.value)}
                onKeyDown={(e) => aoTeclar(e, indice)}
                placeholder="Novo texto (vazio apaga)"
                aria-label={`Substituir por (troca ${indice + 1})`}
                className="h-8 bg-white text-sm"
              />
              <span
                className={cn(
                  "col-span-2 text-xs sm:col-span-1 sm:text-center",
                  repetido ? "text-amber-600" : n ? "font-medium text-[#5f2ebe]" : "text-slate-400"
                )}
                title={repetido ? "Esse texto já está em outra troca acima; vale a primeira." : undefined}
              >
                {!par.procurar ? "" : repetido ? "repetido" : `${n} ${n === 1 ? "vez" : "vezes"}`}
              </span>
              <button
                type="button"
                onClick={() => remover(par.id)}
                title="Remover esta troca"
                aria-label={`Remover troca ${indice + 1}`}
                className="hidden h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-red-50 hover:text-red-600 sm:flex"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      {colando && (
        <div className="mt-2 space-y-1.5">
          <textarea
            value={lista}
            onChange={(e) => setLista(e.target.value)}
            rows={4}
            autoFocus
            placeholder={"Uma troca por linha, por exemplo:\nCF/88 => Constituição Federal\nSTF; Supremo Tribunal Federal\n(também aceita colar duas colunas de uma planilha)"}
            aria-label="Lista de trocas"
            className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#5f2ebe]/30"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setColando(false)}>
              Cancelar
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={usarLista} disabled={!lista.trim()}>
              Adicionar trocas
            </Button>
          </div>
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-slate-600" onClick={() => setPares((a) => [...a, parVazio()])}>
          <Plus className="mr-1 h-4 w-4" /> Adicionar troca
        </Button>
        {!colando && (
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-slate-600" onClick={() => setColando(true)}>
            <ClipboardList className="mr-1 h-4 w-4" /> Colar lista
          </Button>
        )}
        {pares.some((p) => p.procurar || p.substituir) && (
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2 text-slate-400 hover:text-red-600" onClick={() => setPares([parVazio(), parVazio()])}>
            Limpar
          </Button>
        )}
        <span className="flex-1" />
        <span className="text-xs text-slate-500">
          {preenchidos
            ? `${contagem.total} ${contagem.total === 1 ? "ocorrência" : "ocorrências"} ${alvo.tipo === "html" ? "no código" : "no texto"}`
            : "Preencha o que procurar"}
        </span>
        {alvo.tipo === "html" && anterior !== null && (
          <Button type="button" variant="outline" size="sm" className="h-8" onClick={desfazerHtml} title="Voltar o código para antes da última substituição">
            <Undo2 className="mr-1.5 h-4 w-4" /> Desfazer
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          className="h-8 bg-[#5f2ebe] hover:bg-[#4f25a0]"
          disabled={!contagem.total}
          onClick={aplicar}
          title="Substituir tudo (Ctrl+Enter)"
        >
          <ReplaceAll className="mr-1.5 h-4 w-4" /> Substituir tudo
        </Button>
      </div>
    </div>
  );
};
