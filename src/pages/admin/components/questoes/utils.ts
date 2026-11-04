import { QuestionOption } from "@/components/admin/questions/types";

export const TIPO_MULTIPLA = "Múltipla Escolha";
export const TIPO_CERTO_ERRADO = "Certo ou Errado";
export const TIPOS_PADRAO = [TIPO_MULTIPLA, TIPO_CERTO_ERRADO];
export const DIFICULDADES_PADRAO = ["Muito Fácil", "Fácil", "Médio", "Difícil", "Muito Difícil"];

export const MIN_ALTERNATIVAS = 2;
export const MAX_ALTERNATIVAS = 6;

/** Junta a lista padrão com os valores que já existem no banco, sem repetir. */
export function juntarOpcoes(padrao: string[], existentes: string[]): string[] {
  const vistos = new Set(padrao.map(chave));
  return [...padrao, ...existentes.filter((v) => !vistos.has(chave(v)))];
}

/** Chave de comparação sem acentos e sem diferença de maiúsculas. */
export function chave(s: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Texto simples a partir do HTML da questão. */
export function textoPuro(html: string): string {
  if (!html) return "";
  return html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
    .replace(/<img[^>]*>/gi, " [imagem] ")
    .replace(/<\/(p|div|li|tr|h\d)>|<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export const temConteudo = (html: string) => textoPuro(html).length > 0 || /<img/i.test(html || "");

export function letraAlternativa(tipo: string, indice: number): string {
  if (tipo === TIPO_CERTO_ERRADO) return indice === 0 ? "C" : "E";
  return String.fromCharCode(65 + indice);
}

/** Letra do gabarito ("B", "C"/"E") ou "" se não marcado. */
export function gabarito(tipo: string, opcoes: QuestionOption[]): string {
  const i = opcoes.findIndex((o) => o.isCorrect);
  if (i < 0) return "";
  if (tipo === TIPO_CERTO_ERRADO) return /^errad/i.test(opcoes[i].text) ? "E" : "C";
  return letraAlternativa(tipo, i);
}

export function dataCurta(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, "");
}

/**
 * Separa alternativas coladas de uma vez, como
 * "A) texto  B) texto" ou uma por linha ("a. texto").
 */
export function separarAlternativasColadas(texto: string): string[] {
  const limpo = (texto || "").replace(/\r/g, "").trim();
  if (!limpo) return [];
  const marcador = /(?:^|\n|\s)\(?([A-Fa-f])\s*[).\-–:]\s+/g;
  const posicoes: { letra: string; inicio: number; fimMarcador: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = marcador.exec(limpo))) {
    const letra = m[1].toUpperCase();
    const esperada = String.fromCharCode(65 + posicoes.length);
    if (letra === esperada) posicoes.push({ letra, inicio: m.index, fimMarcador: m.index + m[0].length });
  }
  if (posicoes.length >= 2) {
    return posicoes.map((p, i) =>
      limpo.slice(p.fimMarcador, i + 1 < posicoes.length ? posicoes[i + 1].inicio : undefined).replace(/\s+/g, " ").trim()
    );
  }
  return limpo
    .split(/\n+/)
    .map((l) => l.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}
