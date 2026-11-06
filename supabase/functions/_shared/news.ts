// Reescrita de notícias de concursos: prompt, validação da resposta da IA
// e limpeza do HTML gerado. Usado por rewrite-content e rss-auto-sync.

import { parseHTML } from "npm:linkedom@0.18.15";

// deno-lint-ignore no-explicit-any
type Element = any;
import { generateJson } from "./ai.ts";
import { fixCasing } from "./casing.ts";
import { hostOf, isBlockedLink } from "./links.ts";

export interface RewrittenNews {
  title: string;
  summary: string;
  content: string;
  tags: string[];
  region: string;
  state: string;
  metaKeywords: string[];
  /** Cidade principal do concurso, para a foto destaque (pode vir vazia). */
  city: string;
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

// Textos longos estouram o limite gratuito de tokens por minuto (Groq gpt-oss:
// 8 mil por minuto, somando entrada e saída). ~12 mil caracteres ≈ 3,5 mil
// tokens, suficiente para um edital resumido.
export const MAX_SOURCE_CHARS = 12_000;

// ---------------------------------------------------------------------
// Instruções enviadas à IA
//
// O texto padrão fica aqui. O painel (/admin/posts > Feeds RSS > Instruções
// da IA) grava alterações na tabela public.ia_instrucoes (id 'noticias_rss');
// campo vazio ou ausente usa o padrão. A cópia do padrão usada pelo painel
// fica em src/pages/admin/posts/components/instrucoesIAPadrao.ts: mantenha
// as duas iguais.
//
// Partes fixas (não editáveis, porque o código depende delas): o bloco com a
// notícia original, as chaves do JSON, os valores aceitos de region/state e
// o pedido de responder só com JSON.
// ---------------------------------------------------------------------

export interface NewsPromptConfig {
  /** Papel e regras gerais (mensagem de sistema). */
  sistema: string;
  /** Regras de redação do corpo do post. */
  instrucoes: string;
  /** O que a IA deve escrever em cada campo do JSON. */
  campos: {
    title: string;
    summary: string;
    content: string;
    tags: string;
    metaKeywords: string;
    city: string;
  };
  /** 0 = mais fiel e previsível, 1 = mais criativo. */
  temperatura: number;
}

export const DEFAULT_NEWS_PROMPT: NewsPromptConfig = {
  sistema: `Você é redator sênior de um portal brasileiro de concursos públicos.
Reescreva notícias com suas próprias palavras, em português do Brasil, mantendo todos os fatos
(órgão, banca, cargos, vagas, salários, requisitos, datas, taxas e links oficiais) exatamente como
estão na fonte. Nunca invente números ou datas. Não mencione o site de origem, direitos autorais,
"RSS" ou que o texto foi reescrito. Escreva títulos e resumos com maiúsculas e minúsculas como
em um jornal brasileiro: primeira letra maiúscula, nomes próprios, órgãos, cidades e siglas com a
grafia oficial (ex.: "Concurso da Prefeitura de Campinas (SP) abre 120 vagas"). Nunca escreva o
título ou o resumo todo em minúsculas nem todo em maiúsculas.`,
  instrucoes: `Regras do "content":
- Use apenas <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <a href>, <blockquote>, <br>.
- Não use <h1> (o título já é o H1 da página).
- Comece com um parágrafo de abertura com o essencial (órgão, vagas, salário, inscrições).
- Organize em seções com <h2>, como "Vagas e salários", "Inscrições", "Provas", "Requisitos".
- Quando houver vários cargos, prefira uma tabela.
- Se a fonte não trouxer uma informação, não crie a seção.
- Links (<a href>): use apenas os que aparecem na fonte e são úteis ao candidato, como edital (PDF),
  página de inscrição, site oficial do órgão ou da banca. Nunca crie links para o site de origem,
  para outros portais de notícias ou para cursinhos. Não invente endereços.
- Não escreva "Fonte:", "Com informações de" nem cite de onde a notícia foi tirada.`,
  campos: {
    title: "título novo, informativo, até 110 caracteres, com maiúsculas só na primeira letra, em nomes próprios e siglas",
    summary: "resumo de 1 a 2 frases, até 160 caracteres, com a mesma regra de maiúsculas do título",
    content: "corpo em HTML",
    tags: "3 a 5 tags: órgão, banca, área, nível",
    metaKeywords: "5 a 10 palavras-chave",
    city: 'cidade principal do concurso, com acentos (ex.: "Campinas"); vazio se for estadual sem cidade definida, nacional ou federal',
  },
  temperatura: 0.5,
};

const PROMPT_ROW_ID = "noticias_rss";
const pick = (v: unknown, fallback: string, max: number): string =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : fallback;

/** Junta o que foi salvo no painel com o padrão. */
export function mergeNewsPrompt(raw: unknown): NewsPromptConfig {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const c = (r.campos && typeof r.campos === "object" ? r.campos : {}) as Record<string, unknown>;
  const d = DEFAULT_NEWS_PROMPT;
  const t = Number(r.temperatura);
  return {
    sistema: pick(r.sistema, d.sistema, 8000),
    instrucoes: pick(r.instrucoes, d.instrucoes, 12000),
    campos: {
      title: pick(c.title, d.campos.title, 600),
      summary: pick(c.summary, d.campos.summary, 600),
      content: pick(c.content, d.campos.content, 600),
      tags: pick(c.tags, d.campos.tags, 600),
      metaKeywords: pick(c.metaKeywords, d.campos.metaKeywords, 600),
      city: pick(c.city, d.campos.city, 600),
    },
    temperatura: Number.isFinite(t) && r.temperatura !== null && r.temperatura !== "" ? Math.min(1, Math.max(0, t)) : d.temperatura,
  };
}

// Cache curto: uma sincronização processa várias notícias seguidas.
let cache: { at: number; value: NewsPromptConfig } | null = null;

/**
 * Lê as instruções salvas no painel. `db` precisa ser um client com a
 * service role. Se a tabela não existir ou der erro, usa o padrão.
 */
// deno-lint-ignore no-explicit-any
export async function loadNewsPrompt(db: any): Promise<NewsPromptConfig> {
  if (cache && Date.now() - cache.at < 60_000) return cache.value;
  let value = DEFAULT_NEWS_PROMPT;
  try {
    const { data, error } = await db.from("ia_instrucoes").select("config").eq("id", PROMPT_ROW_ID).maybeSingle();
    if (error) console.warn("[ia] instruções do painel indisponíveis, usando o padrão:", error.message);
    else value = mergeNewsPrompt(data?.config);
  } catch (err) {
    console.warn("[ia] instruções do painel indisponíveis, usando o padrão:", String(err));
  }
  cache = { at: Date.now(), value };
  return value;
}

const oneLine = (s: string) => s.replace(/\s+/g, " ").replace(/"/g, "'").trim();

function buildSystem(cfg: NewsPromptConfig): string {
  return `${cfg.sistema}\n\nResponda somente com um objeto JSON válido.`;
}

function buildPrompt(cfg: NewsPromptConfig, title: string, source: string, sourceUrl?: string): string {
  const host = sourceUrl ? hostOf(sourceUrl) : "";
  const f = cfg.campos;
  return `Reescreva a notícia abaixo para o blog.

Título original: ${title}
${host ? `Site de origem (não cite e não crie links para ele): ${host}\n` : ""}
Conteúdo original (pode conter menus e rodapés do site, ignore o que não for a notícia):
"""
${source}
"""

Devolva exatamente este JSON:
{
  "title": "${oneLine(f.title)}",
  "summary": "${oneLine(f.summary)}",
  "content": "${oneLine(f.content)}",
  "tags": ["${oneLine(f.tags)}"],
  "region": "norte | nordeste | centro-oeste | sul | sudeste | nacional | federal",
  "state": "sigla da UF em maiúsculas, ou vazio se for nacional/federal",
  "metaKeywords": ["${oneLine(f.metaKeywords)}"],
  "city": "${oneLine(f.city)}"
}

${cfg.instrucoes}`;
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
export function sanitizeHtml(html: string, sourceUrl?: string): string {
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
        if (!/^https?:\/\//i.test(href) || isBlockedLink(href, sourceUrl)) {
          child.replaceWith(...Array.from(child.childNodes));
        } else {
          child.setAttribute("target", "_blank");
          child.setAttribute("rel", "noopener noreferrer nofollow");
        }
      }
    }
  };
  walk(root);
  // Remove parágrafos de crédito ao site de origem ("Fonte: ...")
  for (const p of Array.from(root.querySelectorAll("p")) as Element[]) {
    const t = (p.textContent || "").trim();
    if (/^(fonte|fontes|com informa[çc][õo]es d[eoa]s?|via|leia (tamb[ée]m|mais))\b/i.test(t)) p.remove();
  }
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

export function normalizeRewrite(
  raw: Record<string, unknown>,
  originalTitle: string,
  sourceText = "",
  sourceUrl?: string,
): RewrittenNews {
  const content = sanitizeHtml(typeof raw.content === "string" ? raw.content : "", sourceUrl);
  // Referência de grafia: texto original e o corpo já reescrito
  const reference = `${sourceText}\n${content.replace(/<[^>]+>/g, " ")}`;
  const title = fixCasing(asString(raw.title, 160) || originalTitle, reference);
  if (content.replace(/<[^>]+>/g, "").trim().length < 200) {
    throw new Error("Conteúdo reescrito muito curto ou vazio");
  }

  let state = asString(raw.state, 5).toUpperCase();
  if (!UFS.includes(state)) state = "";
  let region = asString(raw.region, 20).toLowerCase();
  if (!REGIONS.includes(region)) region = state ? UF_REGION[state] : "nacional";

  const summaryRaw = asString(raw.summary, 400) ||
    content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const summaryCut = summaryRaw.length > 200 ? summaryRaw.slice(0, 197).trimEnd() + "..." : summaryRaw;
  const summary = fixCasing(summaryCut, reference);

  const tags = asStringArray(raw.tags, 6).map((t) => fixCasing(t, reference));
  const metaKeywords = asStringArray(raw.metaKeywords, 10);

  return {
    title,
    summary,
    content,
    tags: tags.length ? tags : ["Concursos"],
    region,
    state,
    metaKeywords: metaKeywords.length ? metaKeywords : ["concursos", "concurso público"],
    city: asString(raw.city, 80).replace(/\s*[-/(].*$/, ""),
  };
}

export async function rewriteNews(
  originalTitle: string,
  originalContent: string,
  sourceUrl?: string,
  config: NewsPromptConfig = DEFAULT_NEWS_PROMPT,
): Promise<RewrittenNews> {
  const source = originalContent.slice(0, MAX_SOURCE_CHARS);
  const result = await generateJson({
    system: buildSystem(config),
    prompt: buildPrompt(config, originalTitle, source, sourceUrl),
    temperature: config.temperatura,
    maxOutputTokens: 8192,
  });
  return { ...normalizeRewrite(result.data, originalTitle, source, sourceUrl), provider: result.provider, model: result.model };
}
