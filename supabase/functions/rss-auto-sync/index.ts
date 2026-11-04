// Sincronização de feeds RSS com reescrita por IA, feita no servidor.
//
// Ações (POST JSON):
//   { "action": "sync", "configId"?: string, "limit"?: number }
//       Lê os feeds ativos, reescreve itens novos e cria os posts.
//       Pode ser chamada pelo agendador (pg_cron) com o header
//       x-cron-secret: <RSS_CRON_SECRET>, ou por um usuário da equipe.
//   { "action": "preview", "url"?: string }
//       Lista os itens de um feed (url) ou de todos os feeds ativos.
//   { "action": "process", "item": {...}, "feedName": string, "publish"?: boolean }
//       Reescreve um item escolhido no painel e cria o post.
//
// Só "sync" aceita o segredo do agendador. As outras exigem login de staff
// ou jornalista, igual à rewrite-content.

// @ts-ignore - import remoto do Deno
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore - import remoto do Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.5";
import { authorize, STAFF_ROLES } from "../_shared/auth.ts";
import { extractArticle, fetchFeed, fetchText, type FeedItem } from "../_shared/feeds.ts";
import { rewriteNews } from "../_shared/news.ts";
import { AIError } from "../_shared/ai.ts";
import { creditHtml, findCityImage } from "../_shared/images.ts";

declare const Deno: { env: { get(key: string): string | undefined } };

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const env = (k: string) => (Deno.env.get(k) || "").trim();
const intEnv = (k: string, def: number) => {
  const n = parseInt(env(k), 10);
  return Number.isFinite(n) && n > 0 ? n : def;
};

// Limites pensados para o plano gratuito: a Edge Function tem ~150 s por
// execução e a IA gratuita aceita poucas requisições por minuto.
const MAX_POSTS_PER_RUN = intEnv("RSS_MAX_POSTS_PER_RUN", 3);
const ITEMS_PER_FEED = intEnv("RSS_ITEMS_PER_FEED", 10);
const MAX_ATTEMPTS = 3;
const TIME_BUDGET_MS = 110_000;
const MAX_ITEM_AGE_DAYS = intEnv("RSS_MAX_ITEM_AGE_DAYS", 7);
const AUTHOR_NAME = env("RSS_AUTHOR_NAME") || "Equipe Bom Estudo";

const safeEqual = (a: string, b: string): boolean => {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

function isCronCall(req: Request): boolean {
  const secret = env("RSS_CRON_SECRET");
  // Segredo curto demais é tratado como não configurado.
  return secret.length >= 32 && safeEqual(req.headers.get("x-cron-secret") || "", secret);
}

function createSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .substring(0, 90)
    .replace(/^-|-$/g, "");
}

// deno-lint-ignore no-explicit-any
type Db = any;

interface RssConfig {
  id: string;
  name: string;
  url: string;
  active: boolean;
  auto_publish?: boolean | null;
}

interface Transmitido {
  rss_item_guid: string;
  rss_item_link: string;
  status: string | null;
  attempts: number | null;
  blog_post_id: string | null;
}

async function uniqueSlug(db: Db, base: string): Promise<string> {
  const root = base || `noticia-${Date.now()}`;
  const { data } = await db.from("blog_posts").select("slug").like("slug", `${root}%`).limit(50);
  const taken = new Set((data || []).map((r: { slug: string }) => r.slug));
  if (!taken.has(root)) return root;
  for (let i = 2; i < 100; i++) {
    if (!taken.has(`${root}-${i}`)) return `${root}-${i}`;
  }
  return `${root}-${Date.now()}`;
}

function readingTime(html: string): number {
  const words = html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

async function loadTransmitted(db: Db, items: FeedItem[]): Promise<Map<string, Transmitido>> {
  const map = new Map<string, Transmitido>();
  if (items.length === 0) return map;
  const guids = items.map((i) => i.guid);
  const links = items.map((i) => i.link);
  const [byGuid, byLink] = await Promise.all([
    db.from("rss_transmitidos").select("rss_item_guid, rss_item_link, status, attempts, blog_post_id").in("rss_item_guid", guids),
    db.from("rss_transmitidos").select("rss_item_guid, rss_item_link, status, attempts, blog_post_id").in("rss_item_link", links),
  ]);
  for (const row of [...(byGuid.data || []), ...(byLink.data || [])] as Transmitido[]) {
    map.set(row.rss_item_guid, row);
    map.set(row.rss_item_link, row);
  }
  return map;
}

async function recordResult(
  db: Db,
  item: FeedItem,
  feedName: string,
  fields: { status: string; blog_post_id?: string | null; error?: string | null; attempts: number },
) {
  const { error } = await db.from("rss_transmitidos").upsert({
    rss_item_guid: item.guid,
    rss_item_link: item.link,
    rss_feed_name: feedName,
    blog_post_id: fields.blog_post_id ?? null,
    status: fields.status,
    error: fields.error ?? null,
    attempts: fields.attempts,
    updated_at: new Date().toISOString(),
  }, { onConflict: "rss_item_guid" });
  if (error) console.error("[rss] erro ao registrar item", error.message);
}

interface ProcessOutcome {
  ok: boolean;
  postId?: string;
  slug?: string;
  title?: string;
  published?: boolean;
  provider?: string;
  error?: string;
  rateLimited?: boolean;
}

async function processItem(
  db: Db,
  item: FeedItem,
  feedName: string,
  opts: { publish: boolean; author: string; previousAttempts: number },
): Promise<ProcessOutcome> {
  const attempts = opts.previousAttempts + 1;
  try {
    // 1. Texto da notícia: página original, ou o conteúdo do próprio feed.
    let sourceText = "";
    try {
      const html = await fetchText(item.link);
      sourceText = extractArticle(html, item.link).text;
    } catch (err) {
      console.warn("[rss] não foi possível abrir a página original", item.link, String(err));
    }
    const feedText = item.description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (feedText.length > sourceText.length) sourceText = feedText;
    if (sourceText.length < 200) {
      throw new Error("Não foi possível obter o texto da notícia");
    }

    // 2. Reescrita
    const rewritten = await rewriteNews(item.title, sourceText, item.link);

    // 3. Foto destaque da cidade do concurso (Wikimedia/Unsplash). Se não
    // achar, o post sai sem imagem e pode receber uma pelo painel.
    let featuredImage: string | null = null;
    let content = rewritten.content;
    try {
      const img = await findCityImage(rewritten.city, rewritten.state, rewritten.region);
      if (img) {
        featuredImage = img.url;
        content = `${content}\n${creditHtml(img)}`;
      }
    } catch (err) {
      console.warn("[rss] sem foto destaque", String(err));
    }

    // 4. Post
    const slug = await uniqueSlug(db, createSlug(rewritten.title));
    const { data: post, error } = await db.from("blog_posts").insert({
      title: rewritten.title,
      summary: rewritten.summary,
      content,
      featured_image: featuredImage,
      author: opts.author,
      slug,
      category: "Concursos",
      tags: rewritten.tags,
      meta_description: rewritten.summary,
      meta_keywords: rewritten.metaKeywords,
      region: rewritten.region,
      state: rewritten.state || null,
      reading_time: readingTime(content),
      featured: false,
      is_draft: !opts.publish,
    }).select("id, slug, title").single();
    if (error) throw new Error(`Erro ao salvar o post: ${error.message}`);

    await recordResult(db, item, feedName, {
      status: opts.publish ? "publicado" : "rascunho",
      blog_post_id: post.id,
      attempts,
    });
    return {
      ok: true,
      postId: post.id,
      slug: post.slug,
      title: post.title,
      published: opts.publish,
      provider: `${rewritten.provider}/${rewritten.model}`,
    };
  } catch (err) {
    const rateLimited = err instanceof AIError && err.rateLimited;
    const detail = err instanceof AIError && err.attempts.length
      ? `${err.message}: ${err.attempts.join(" | ")}`
      : err instanceof Error ? err.message : String(err);
    // Limite da IA não é culpa do item: não conta como tentativa.
    await recordResult(db, item, feedName, {
      status: "erro",
      error: detail.slice(0, 1000),
      attempts: rateLimited ? opts.previousAttempts : attempts,
    });
    return { ok: false, error: detail, rateLimited };
  }
}

async function runSync(db: Db, configId?: string, limit?: number) {
  const started = Date.now();
  const maxPosts = Math.min(limit && limit > 0 ? limit : MAX_POSTS_PER_RUN, 10);

  let query = db.from("rss_configs").select("*").eq("active", true);
  if (configId) query = query.eq("id", configId);
  const { data: configs, error } = await query;
  if (error) throw new Error(`Erro ao ler os feeds: ${error.message}`);

  const minDate = Date.now() - MAX_ITEM_AGE_DAYS * 24 * 60 * 60 * 1000;
  const summary = {
    feeds: (configs || []).length,
    created: [] as ProcessOutcome[],
    failed: [] as { title: string; error: string }[],
    skipped: 0,
    stoppedBy: null as null | "limite" | "tempo" | "limite-ia",
    feedErrors: [] as { feed: string; error: string }[],
  };

  // Reúne candidatos de todos os feeds, intercalados, para não esgotar o
  // limite de posts sempre no primeiro feed.
  const queues: { config: RssConfig; items: FeedItem[] }[] = [];
  const attemptsByGuid = new Map<string, number>();
  for (const config of (configs || []) as RssConfig[]) {
    try {
      const feed = await fetchFeed(config.url);
      const recent = feed.items
        .slice(0, ITEMS_PER_FEED)
        .filter((i) => !i.pubDate || !Date.parse(i.pubDate) || Date.parse(i.pubDate) >= minDate);
      const transmitted = await loadTransmitted(db, recent);
      const pending = recent.filter((i) => {
        const t = transmitted.get(i.guid) || transmitted.get(i.link);
        if (!t) return true;
        if (t.status === "erro" && (t.attempts || 0) < MAX_ATTEMPTS) {
          attemptsByGuid.set(i.guid, t.attempts || 0);
          return true;
        }
        summary.skipped++;
        return false;
      });
      queues.push({ config, items: pending });
      await db.from("rss_configs").update({
        lastSync: new Date().toISOString(),
        last_sync: new Date().toISOString(),
        last_error: null,
      }).eq("id", config.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      summary.feedErrors.push({ feed: config.name, error: msg });
      await db.from("rss_configs").update({ last_error: msg.slice(0, 500) }).eq("id", config.id);
    }
  }

  const seenLinks = new Set<string>();

  outer:
  while (queues.some((q) => q.items.length > 0)) {
    for (const q of queues) {
      const item = q.items.shift();
      if (!item) continue;
      if (seenLinks.has(item.link)) continue;
      seenLinks.add(item.link);

      if (summary.created.length >= maxPosts) {
        summary.stoppedBy = "limite";
        break outer;
      }
      if (Date.now() - started > TIME_BUDGET_MS) {
        summary.stoppedBy = "tempo";
        break outer;
      }

      const outcome = await processItem(db, item, q.config.name, {
        publish: !!q.config.auto_publish,
        author: AUTHOR_NAME,
        previousAttempts: attemptsByGuid.get(item.guid) || 0,
      });
      if (outcome.ok) {
        summary.created.push(outcome);
      } else {
        summary.failed.push({ title: item.title, error: outcome.error || "erro" });
        if (outcome.rateLimited) {
          summary.stoppedBy = "limite-ia";
          break outer;
        }
      }
    }
  }

  return { ...summary, durationMs: Date.now() - started };
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  let body: Record<string, unknown> = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  const action = typeof body.action === "string" ? body.action : "sync";

  let callerId: string | null = null;
  if (!(action === "sync" && isCronCall(req))) {
    const auth = await authorize(req, [...STAFF_ROLES, "jornalista"]);
    if (!auth.ok) return json({ error: auth.error }, auth.status);
    callerId = auth.userId;
  }

  const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    if (action === "sync") {
      const result = await runSync(
        db,
        typeof body.configId === "string" ? body.configId : undefined,
        typeof body.limit === "number" ? body.limit : undefined,
      );
      console.log("[rss] sync", JSON.stringify({
        created: result.created.length,
        failed: result.failed.length,
        stoppedBy: result.stoppedBy,
      }));
      return json(result);
    }

    if (action === "preview") {
      if (typeof body.url === "string" && body.url) {
        const feed = await fetchFeed(body.url);
        return json({ feeds: [{ feedName: feed.title || body.url, title: feed.title, items: feed.items }] });
      }
      const { data: configs } = await db.from("rss_configs").select("*").eq("active", true);
      const feeds = [];
      for (const config of (configs || []) as RssConfig[]) {
        try {
          const feed = await fetchFeed(config.url);
          feeds.push({ feedName: config.name, title: feed.title, items: feed.items });
        } catch (err) {
          feeds.push({ feedName: config.name, items: [], error: err instanceof Error ? err.message : String(err) });
        }
      }
      return json({ feeds });
    }

    if (action === "process") {
      const raw = (body.item || {}) as Record<string, unknown>;
      const item: FeedItem = {
        title: String(raw.title || "").slice(0, 300),
        link: String(raw.link || ""),
        description: String(raw.description || "").slice(0, 50_000),
        pubDate: String(raw.pubDate || ""),
        guid: String(raw.guid || raw.link || ""),
      };
      if (!item.title || !item.link) return json({ error: "item.title e item.link são obrigatórios" }, 400);
      const feedName = String(body.feedName || "Manual").slice(0, 200);

      // Post manual fica no nome de quem clicou, para que a pessoa possa
      // editá-lo depois (a RLS de blog_posts compara o autor com o perfil).
      let author = AUTHOR_NAME;
      if (callerId) {
        const { data: profile } = await db.from("profiles").select("nome").eq("id", callerId).maybeSingle();
        if (profile?.nome) author = profile.nome;
      }
      const transmitted = await loadTransmitted(db, [item]);
      const outcome = await processItem(db, item, feedName, {
        publish: body.publish === true,
        author,
        previousAttempts: transmitted.get(item.guid)?.attempts || 0,
      });
      return json(outcome, outcome.ok ? 200 : outcome.rateLimited ? 429 : 502);
    }

    return json({ error: "Ação desconhecida" }, 400);
  } catch (err) {
    console.error("[rss] erro", err);
    return json({ error: err instanceof Error ? err.message : "Erro interno" }, 500);
  }
});
