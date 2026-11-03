// Leitura de feeds RSS/Atom e extração do texto principal de uma notícia.
// Roda no servidor (Edge Function), então não precisa de proxy de CORS.

import { parseHTML } from "npm:linkedom@0.18.15";

// deno-lint-ignore no-explicit-any
type Element = any;
import { XMLParser } from "npm:fast-xml-parser@4.5.7";

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

export interface ParsedFeed {
  title: string;
  link: string;
  items: FeedItem[];
}

const USER_AGENT = "Mozilla/5.0 (compatible; BomEstudoBot/1.0; +https://bomestudo.com.br)";
const MAX_BYTES = 3_000_000;

// Evita que a função seja usada para acessar endereços internos (SSRF).
export function assertPublicHttpUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("URL inválida");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Apenas URLs http(s) são permitidas");
  }
  if (url.username || url.password) throw new Error("URL com credenciais não é permitida");
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const privateHost =
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".internal") ||
    host.endsWith(".local") ||
    /^(127|10|0)\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) ||
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(host) ||
    host === "::1" || host === "::" ||
    /^f[cd][0-9a-f]{2}:/.test(host) || /^fe80:/.test(host) ||
    host.startsWith("::ffff:");
  if (privateHost) throw new Error("Endereço não permitido");
  return url;
}

export async function fetchText(rawUrl: string, timeoutMs = 20_000): Promise<string> {
  let current = assertPublicHttpUrl(rawUrl).toString();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // Segue redirecionamentos manualmente para validar cada destino.
    for (let hop = 0; hop < 5; hop++) {
      const res = await fetch(current, {
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.5",
          "Accept-Language": "pt-BR,pt;q=0.9",
        },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        current = assertPublicHttpUrl(new URL(res.headers.get("location")!, current).toString()).toString();
        await res.body?.cancel();
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status} ao acessar ${new URL(current).hostname}`);
      const buf = new Uint8Array(await res.arrayBuffer());
      const slice = buf.byteLength > MAX_BYTES ? buf.slice(0, MAX_BYTES) : buf;
      const contentType = res.headers.get("content-type") || "";
      const charset = /charset=([\w-]+)/i.exec(contentType)?.[1] ||
        /<\?xml[^>]*encoding=["']([\w-]+)["']/i.exec(new TextDecoder().decode(slice.slice(0, 200)))?.[1] ||
        /<meta[^>]+charset=["']?([\w-]+)/i.exec(new TextDecoder().decode(slice.slice(0, 3000)))?.[1] ||
        "utf-8";
      try {
        return new TextDecoder(charset.toLowerCase()).decode(slice);
      } catch {
        return new TextDecoder().decode(slice);
      }
    }
    throw new Error("Redirecionamentos demais");
  } finally {
    clearTimeout(timer);
  }
}

const textOf = (v: unknown): string => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v).trim();
  if (Array.isArray(v)) return textOf(v[0]);
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return textOf(o["#text"] ?? o["@_href"] ?? "");
  }
  return "";
};

// deno-lint-ignore no-explicit-any
const asArray = (v: any): any[] => (v == null ? [] : Array.isArray(v) ? v : [v]);

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function parseFeed(xml: string): ParsedFeed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    parseTagValue: false, // mantém tudo como texto (ex.: guid "0123", título "E1")
    parseAttributeValue: false,
    processEntities: true,
    htmlEntities: true,
  });
  const doc = parser.parse(xml);

  // RSS 2.0 / RSS 1.0 (RDF)
  const channel = doc?.rss?.channel || doc?.["rdf:RDF"]?.channel;
  if (channel) {
    const rawItems = asArray(channel.item || doc?.["rdf:RDF"]?.item);
    const items: FeedItem[] = rawItems.map((it: Element) => {
      const link = textOf(it.link);
      const encoded = textOf(it["content:encoded"]);
      const description = textOf(it.description);
      return {
        title: stripTags(textOf(it.title)),
        link,
        description: encoded || description,
        pubDate: textOf(it.pubDate) || textOf(it["dc:date"]),
        guid: textOf(it.guid) || link,
      };
    }).filter((i: FeedItem) => i.title && i.link);
    return { title: stripTags(textOf(channel.title)), link: textOf(channel.link), items };
  }

  // Atom
  const feed = doc?.feed;
  if (feed) {
    const items: FeedItem[] = asArray(feed.entry).map((e: Element) => {
      const links = asArray(e.link);
      const alt = links.find((l: Element) => !l["@_rel"] || l["@_rel"] === "alternate") || links[0];
      const link = alt?.["@_href"] || textOf(e.link);
      return {
        title: stripTags(textOf(e.title)),
        link,
        description: textOf(e.content) || textOf(e.summary),
        pubDate: textOf(e.published) || textOf(e.updated),
        guid: textOf(e.id) || link,
      };
    }).filter((i: FeedItem) => i.title && i.link);
    const feedLinks = asArray(feed.link);
    return {
      title: stripTags(textOf(feed.title)),
      link: (feedLinks.find((l: Element) => l["@_rel"] !== "self") || feedLinks[0])?.["@_href"] || "",
      items,
    };
  }

  throw new Error("O endereço não é um feed RSS ou Atom válido");
}

export async function fetchFeed(url: string): Promise<ParsedFeed> {
  const xml = await fetchText(url);
  const feed = parseFeed(xml);
  // Mais recentes primeiro (alguns feeds vêm em ordem crescente)
  feed.items.sort((a, b) => (Date.parse(b.pubDate) || 0) - (Date.parse(a.pubDate) || 0));
  return feed;
}

const NOISE_SELECTORS = [
  "script", "style", "noscript", "iframe", "svg", "form", "nav", "header", "footer", "aside",
  "[role=navigation]", "[role=banner]", "[role=contentinfo]", "[aria-hidden=true]",
  ".advertisement", ".ads", ".ad", ".publicidade", ".banner", ".share", ".social", ".sharing",
  ".comments", "#comments", ".related", ".relacionados", ".newsletter", ".breadcrumb", ".menu",
  ".sidebar", ".cookie", ".popup", ".modal",
];

const CONTENT_SELECTORS = [
  "article .entry-content", "article .post-content", ".entry-content", ".post-content",
  ".article-content", ".article-body", ".materia-conteudo", ".noticia-conteudo", ".content-text",
  "[itemprop=articleBody]", "article", "main", ".main-content", "#content", ".content",
];

// Converte o bloco principal em texto com marcações leves (títulos, listas e
// tabelas), o que ajuda a IA a manter a estrutura e gasta menos tokens que HTML.
function toStructuredText(el: Element): string {
  const out: string[] = [];
  const visit = (node: Element) => {
    for (const child of Array.from(node.children) as Element[]) {
      const tag = child.tagName.toLowerCase();
      const text = () => (child.textContent || "").replace(/\s+/g, " ").trim();
      if (/^h[1-6]$/.test(tag)) {
        const t = text();
        if (t) out.push(`\n## ${t}`);
      } else if (tag === "p" || tag === "blockquote") {
        const t = text();
        if (t) out.push(t);
      } else if (tag === "li") {
        const t = text();
        if (t) out.push(`- ${t}`);
      } else if (tag === "tr") {
        const cells = (Array.from(child.children) as Element[])
          .map((c) => (c.textContent || "").replace(/\s+/g, " ").trim());
        if (cells.some(Boolean)) out.push(`| ${cells.join(" | ")} |`);
      } else if (tag === "a" && /\.pdf(\?|$)/i.test(child.getAttribute("href") || "")) {
        out.push(`[${text() || "PDF"}](${child.getAttribute("href")})`);
      } else {
        visit(child);
        // texto solto dentro de <div> sem <p>
        if (["div", "section", "td"].includes(tag) && child.children.length === 0) {
          const t = text();
          if (t) out.push(t);
        }
      }
    }
  };
  visit(el);
  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export interface ExtractedArticle {
  text: string;
}

export function extractArticle(html: string, baseUrl: string): ExtractedArticle {
  const doc: Element = (parseHTML(html) as Element).document;
  if (!doc) return { text: "" };

  for (const sel of NOISE_SELECTORS) {
    for (const n of Array.from(doc.querySelectorAll(sel)) as Element[]) n.remove();
  }

  // Links relativos de PDF (editais) viram absolutos
  for (const a of Array.from(doc.querySelectorAll("a[href]")) as Element[]) {
    try {
      a.setAttribute("href", new URL(a.getAttribute("href")!, baseUrl).toString());
    } catch { /* ignora */ }
  }

  let best = "";
  for (const sel of CONTENT_SELECTORS) {
    const el = doc.querySelector(sel) as Element | null;
    if (!el) continue;
    const text = toStructuredText(el);
    if (text.length > best.length) best = text;
    if (best.length > 800) break;
  }
  if (best.length < 300 && doc.body) {
    const bodyText = toStructuredText(doc.body as unknown as Element);
    if (bodyText.length > best.length) best = bodyText;
  }
  return { text: best };
}
