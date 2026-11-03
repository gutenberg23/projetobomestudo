import { supabase } from '@/lib/supabase';

// Toda a parte pesada (ler o feed, abrir a notícia, reescrever com IA e criar
// o post) roda na Edge Function `rss-auto-sync`. Assim não dependemos de
// proxies de CORS, a chave da IA fica no servidor e o mesmo código serve
// para o painel e para o agendamento automático.

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

export interface RSSFeed {
  title: string;
  link?: string;
  items: RSSItem[];
}

export interface RSSConfig {
  id?: string;
  name: string;
  url: string;
  active: boolean;
  auto_publish?: boolean;
  lastSync?: string | null;
  last_sync?: string | null;
  last_error?: string | null;
  created_at?: string;
}

export interface RSSTransmitido {
  id: string;
  rss_item_guid: string;
  rss_item_link: string;
  rss_feed_name: string;
  blog_post_id: string | null;
  status?: string | null;
  error?: string | null;
  attempts?: number | null;
  created_at: string;
  updated_at?: string | null;
}

export interface ProcessResult {
  ok: boolean;
  postId?: string;
  slug?: string;
  title?: string;
  published?: boolean;
  provider?: string;
  error?: string;
  rateLimited?: boolean;
}

export interface SyncResult {
  feeds: number;
  created: ProcessResult[];
  failed: { title: string; error: string }[];
  skipped: number;
  stoppedBy: null | 'limite' | 'tempo' | 'limite-ia';
  feedErrors: { feed: string; error: string }[];
  durationMs: number;
}

// Extrai a mensagem de erro do corpo da resposta da Edge Function.
async function functionError(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response })?.context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.clone().json();
      if (body?.error) return String(body.error);
    } catch {
      /* corpo não é JSON */
    }
  }
  return error instanceof Error ? error.message : 'Erro desconhecido';
}

async function callRssFunction<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('rss-auto-sync', { body });
  if (error) {
    // Respostas 429/502 de "process" trazem detalhes úteis no corpo.
    const ctx = (error as { context?: Response })?.context;
    if (body.action === 'process' && ctx && typeof ctx.json === 'function') {
      try {
        return (await ctx.clone().json()) as T;
      } catch {
        /* segue para o erro genérico */
      }
    }
    throw new Error(await functionError(error));
  }
  return data as T;
}

// Testa uma URL de feed (usado no botão "Testar").
export async function fetchRSSFeed(url: string): Promise<RSSFeed | null> {
  try {
    const data = await callRssFunction<{ feeds: { title?: string; items: RSSItem[] }[] }>({
      action: 'preview',
      url,
    });
    const feed = data.feeds?.[0];
    return feed ? { title: feed.title || '', items: feed.items || [] } : null;
  } catch (error) {
    console.error('Erro ao buscar RSS feed:', error);
    return null;
  }
}

// Lista os itens de todos os feeds ativos.
export async function fetchAllRSSPosts(): Promise<{ feedName: string; items: RSSItem[]; error?: string }[]> {
  const data = await callRssFunction<{ feeds: { feedName: string; items: RSSItem[]; error?: string }[] }>({
    action: 'preview',
  });
  return data.feeds || [];
}

// Reescreve um item escolhido e cria o post (rascunho por padrão).
export async function processIndividualRSSItem(
  item: RSSItem,
  feedName: string,
  publish = false,
): Promise<ProcessResult> {
  try {
    return await callRssFunction<ProcessResult>({ action: 'process', item, feedName, publish });
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// Roda agora a mesma sincronização que o agendador roda sozinho.
export async function syncAllRSSFeeds(limit?: number): Promise<SyncResult> {
  return callRssFunction<SyncResult>({ action: 'sync', ...(limit ? { limit } : {}) });
}

export async function saveRSSConfig(config: Omit<RSSConfig, 'id' | 'created_at'>): Promise<RSSConfig | null> {
  const { data, error } = await supabase.from('rss_configs').insert([config]).select().single();
  if (error) {
    console.error('Erro ao salvar configuração RSS:', error);
    return null;
  }
  return data as RSSConfig;
}

export async function fetchRSSConfigs(): Promise<RSSConfig[]> {
  const { data, error } = await supabase
    .from('rss_configs')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Erro ao buscar configurações RSS:', error);
    return [];
  }
  return (data || []) as RSSConfig[];
}

export async function updateRSSConfig(id: string, config: Partial<RSSConfig>): Promise<RSSConfig | null> {
  const { data, error } = await supabase.from('rss_configs').update(config).eq('id', id).select().single();
  if (error) {
    console.error('Erro ao atualizar configuração RSS:', error);
    return null;
  }
  return data as RSSConfig;
}

export async function deleteRSSConfig(id: string): Promise<boolean> {
  const { error } = await supabase.from('rss_configs').delete().eq('id', id);
  if (error) {
    console.error('Erro ao deletar configuração RSS:', error);
    return false;
  }
  return true;
}

export async function fetchAllTransmittedRSSItems(): Promise<RSSTransmitido[]> {
  const { data, error } = await supabase
    .from('rss_transmitidos')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1000);
  if (error) {
    console.error('Erro ao buscar itens RSS transmitidos:', error);
    return [];
  }
  return (data || []) as RSSTransmitido[];
}
