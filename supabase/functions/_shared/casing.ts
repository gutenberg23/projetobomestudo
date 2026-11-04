// Corrige maiúsculas de títulos e resumos devolvidos pela IA.
//
// Alguns modelos devolvem o título todo em minúsculas (ou todo em caixa
// alta). Aqui a grafia é restaurada a partir do texto original da notícia:
// se "Campinas", "FGV" ou "Polícia Militar" aparecem assim no corpo da
// notícia, o título volta a ter essa grafia.

const LOWER_WORDS = new Set([
  "a", "à", "ao", "aos", "as", "às", "o", "os", "e", "é", "em", "de", "da", "das", "do", "dos",
  "no", "na", "nos", "nas", "por", "para", "pra", "com", "sem", "sob", "um", "uma", "ou", "que",
  "até", "entre", "pelo", "pela", "pelos", "pelas", "se",
]);

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

const WORD_RE = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;

const hasUpper = (s: string) => /\p{Lu}/u.test(s);
const isAllUpper = (s: string) => hasUpper(s) && !/\p{Ll}/u.test(s);

/** Grafia mais comum de cada palavra no texto de referência, fora do início de frase. */
function buildDictionary(reference: string): Map<string, string> {
  const counts = new Map<string, Map<string, number>>();
  for (const m of reference.matchAll(WORD_RE)) {
    const word = m[0];
    const before = reference.slice(Math.max(0, m.index! - 3), m.index!);
    // Início de frase ou de linha não diz nada sobre a grafia da palavra
    if (m.index === 0 || /[.!?:\n#|-]\s*$/.test(before)) continue;
    const key = word.toLowerCase();
    const forms = counts.get(key) || new Map<string, number>();
    forms.set(word, (forms.get(word) || 0) + 1);
    counts.set(key, forms);
  }
  const dict = new Map<string, string>();
  for (const [key, forms] of counts) {
    let best = key;
    let bestCount = -1;
    for (const [form, n] of forms) {
      // Caixa alta longa costuma ser destaque visual, não sigla
      if (isAllUpper(form) && form.length > 6) continue;
      if (n > bestCount) {
        best = form;
        bestCount = n;
      }
    }
    dict.set(key, best);
  }
  return dict;
}

function capitalizeFirst(s: string): string {
  const i = s.search(/\p{L}/u);
  if (i < 0) return s;
  return s.slice(0, i) + s[i].toUpperCase() + s.slice(i + 1);
}

/**
 * Devolve o texto com maiúsculas corretas. Só mexe quando o texto está todo
 * em minúsculas ou quase todo em maiúsculas; caso contrário apenas garante a
 * primeira letra maiúscula.
 */
export function fixCasing(text: string, reference: string): string {
  const value = (text || "").trim();
  if (!value) return value;
  const letters = value.replace(/[^\p{L}]/gu, "");
  if (!letters) return value;
  const upper = letters.replace(/[^\p{Lu}]/gu, "").length;
  const ratio = upper / letters.length;

  if (upper > 0 && ratio < 0.6) return capitalizeFirst(value);

  const dict = buildDictionary(reference || "");
  const lowered = value.toLowerCase();
  const fixed = lowered.replace(WORD_RE, (word, offset: number) => {
    const before = lowered.slice(Math.max(0, offset - 2), offset);
    // Sigla de estado entre parênteses ou depois de traço/barra: "(sp)", "- sp"
    if (UFS.has(word.toUpperCase()) && /[(/–-]\s?$/.test(before)) return word.toUpperCase();
    if (LOWER_WORDS.has(word)) return word;
    const known = dict.get(word);
    if (known && hasUpper(known)) return known;
    // Palavras compostas: "pós-graduação", "sul-mato-grossense"
    if (word.includes("-")) {
      return word.split("-").map((p) => {
        const k = dict.get(p);
        return k && hasUpper(k) ? k : p;
      }).join("-");
    }
    return word;
  });
  return capitalizeFirst(fixed);
}
