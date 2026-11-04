// Reescrita de notícias de concursos: prompt, validação da resposta da IA
// e limpeza do HTML gerado. Usado por rewrite-content e rss-auto-sync.

import { parseHTML } from "npm:linkedom@0.18.15";

// deno-lint-ignore no-explicit-any
type Element = any;
import { generateJson } from "./ai.ts";

export interface RewrittenNews {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  region: string;
  state: string;
  metaKeywords: string[];
  provider?: string;
  model?: string;
}

const REGIONS = ["norte", "nordeste", "centro-oeste", "sul", "sudeste", "nacional", "federal"];
const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB",
  "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];
const UF_REGION: Record<string, string> = {
  AC: "norte", AP: "norte", AM: "norte", PA: "norte", RO: "norte", RR: "norte", TO: "norte",
  AL: "nordeste", BA: "nordeste", CE: "nordeste", MA: "nordeste", PB: "nordeste", PE: "nordeste",
  PI: "nordeste", RN: "nordeste", SE: "nordeste",
  DF: "centro-oeste", GO: "centro-oeste", MT: "centro-oeste", MS: "centro-oeste",
  ES: "sudeste", MG: "sudeste", RJ: "sudeste", SP: "sudeste",
  PR: "sul", RS: "sul", SC: "sul",
};

// Textos longos estouram o limite gratuito de tokens por minuto (Groq: ~12k).
// ~14 mil caracteres ≈ 4 mil tokens, suficiente para um edital resumido.
export const MAX_SOURCE_CHARS = 14_000;

const SYSTEM_PROMPT = `Você é redator sênior de um portal brasileiro de concursos públicos.
Reescreva notícias com suas próprias palavras, em português do Brasil, mantendo todos os fatos
(órgão, banca, cargos, vagas, salários, requisitos, datas, taxas e links oficiais) exatamente como
estão na fonte. Nunca invente números ou datas. Não mencione o site de origem, direitos autorais,
"RSS" ou que o texto foi reescrito. Responda somente com um objeto JSON válido.`;

function buildPrompt(title: string, source: string, sourceUrl?: string): string {
  return `Reescreva a notícia abaixo para o blog.

Título original: ${title}
${sourceUrl ? `Link original (apenas referência, não cite): ${sourceUrl}\n` : ""}
Conteúdo original (pode conter menus e rodapés do site, ignore o que não for a notícia):
"""
${source}
"""

Devolva exatamente este JSON:
{
  "title": "título novo, informativo, até 110 caracteres, sem caixa alta",
  "summary": "resumo de 1 a 2 frases, até 160 caracteres, usado como meta description",
  "content": "corpo em HTML",
  "tags": ["3 a 5 tags: órgão, banca, área, nível"],
  "region": "norte | nordeste | centro-oeste | sul | sudeste | nacional | federal",
  "state": "sigla da UF em maiúsculas, ou vazio se for nacional/federal",
  "metaKeywords": ["5 a 10 palavras-chave"]
}

Regras do "content":
- Use apenas <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <a href>, <blockquote>, <br>.
- Não use <h1> (o título já é o H1 da página).
- Comece com um parágrafo de abertura com o essencial (órgão, vagas, salário, inscrições).
- Organize em seções com <h2>, como "Vagas e salários", "Inscrições", "Provas", "Requisitos".
- Quando houver vários cargos, prefira uma tabela.
- Se a fonte não trouxer uma informação, não crie a seção.`;
}

const ALLOWED_TAGS = new Set([
  "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "b", "em", "i", "u", "table", "thead",
  "tbody", "tfoot", "tr", "th", "td", "caption", "a", "blockquote", "br", "hr", "span", "sup", "sub",
]);
const DROP_WITH_CONTENT = new Set([
  "script", "style", "iframe", "object", "embed", "form", "input", "button", "select",
  "textarea", "noscript", "svg", "math", "link", "meta", "base", "frame", "frameset",
]);

// Mantém só tags e atributos seguros. A IA recebe texto de sites de terceiros,
// então o HTML gerado não pode ser confiado (risco de XSS no blog).
export function sanitizeHtml(html: string): string {
  const doc: Element = (parseHTML(`<!doctype html><html><body><div id="__root">${html}</div></body></html>`) as Element).document;
  const root = doc?.getElementById("__root");
  if (!root) return "";

  const walk = (el: Element) => {
    for (const child of Array.from(el.children) as Element[]) {
      const tag = child.tagName.toLowerCase();
      if (DROP_WITH_CONTENT.has(tag)) {
        child.remove();
        continue;
      }
      walk(child);
      if (tag === "h1") {
        // rebaixa para h2 em vez de perder o texto
        const h2 = doc.createElement("h2");
        h2.innerHTML = child.innerHTML;
        child.replaceWith(h2);
        continue;
      }
      if (!ALLOWED_TAGS.has(tag)) {
        // desembrulha: mantém o conteúdo, remove a tag
        child.replaceWith(...Array.from(child.childNodes));
        continue;
      }
      for (const attr of Array.from(child.attributes) as { name: string; value: string }[]) {
        const name = attr.name.toLowerCase();
        const keep =
          (tag === "a" && name === "href") ||
          ((tag === "td" || tag === "th") && (name === "colspan" || name === "rowspan"));
        if (!keep) child.removeAttribute(attr.name);
      }
      if (tag === "a") {
        const href = (child.getAttribute("href") || "").trim();
        if (!/^https?:\/\//i.test(href)) {
          child.replaceWith(...Array.from(child.childNodes));
        } else {
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer nofollow");
        }
      }
    }
  };
  walk(root);
  return root.innerHTML.trim();
}

const asString = (v: unknown, max = 500): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

const asStringArray = (v: unknown, maxItems: number): string[] => {
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr) {
    const s = asString(item, 60);
    const key = s.toLowerCase();
    if (!s || seen.has(key) || /\b(rss|bot|automatizad[oa]|ia)\b/i.test(s)) continue;
    seen.add(key);
    out.push(s);
    if (out.length >= maxItems) break;
  }
  return out;
};

export function normalizeRewrite(raw: Record<string, unknown>, originalTitle: string): RewrittenNews {
  const title = asString(raw.title, 160) || originalTitle;
  const content = sanitizeHtml(typeof raw.content === "string" ? raw.content : "");
  if (content.replace(/<[^>]+>/g, "").trim().length < 200) {
    throw new Error("Conteúdo reescrito muito curto ou vazio");
  }

  let state = asString(raw.state, 5).toUpperCase();
  if (!UFS.includes(state)) state = "";
  let region = asString(raw.region, 20).toLowerCase();
  if (!REGIONS.includes(region)) region = state ? UF_REGION[state] : "nacional";

  const summaryRaw = asString(raw.summary, 400) ||
    content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const summary = summaryRaw.length > 200 ? summaryRaw.slice(0, 197).trimEnd() + "..." : summaryRaw;

  const tags = asStringArray(raw.tags, 6);
  const metaKeywords = asStringArray(raw.metaKeywords, 10);

  return {
    title,
    summary,
    content,
    tags: tags.length ? tags : ["Concursos"],
    region,
    state,
    metaKeywords: metaKeywords.length ? metaKeywords : ["concursos", "concurso público"],
  };
}

export async function rewriteNews(
  originalTitle: string,
  originalContent: string,
  sourceUrl?: string,
): Promise<RewrittenNews> {
  const source = originalContent.slice(0, MAX_SOURCE_CHARS);
  const result = await generateJson({
    system: SYSTEM_PROMPT,
    prompt: buildPrompt(originalTitle, source, sourceUrl),
    temperature: 0.5,
    maxOutputTokens: 8192,
  });
  return { ...normalizeRewrite(result.data, originalTitle), provider: result.provider, model: result.model };
}
