import { supabase } from '@/lib/supabase';
import { createBlogPost } from './blogService';
import { BlogPost, Region } from '@/components/blog/types';
import { generateSlug } from '@/utils/slug-utils';

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

interface RSSFeed {
  title: string;
  description: string;
  link: string;
  items: RSSItem[];
}

interface RSSConfig {
  id?: string;
  name: string;
  url: string;
  active: boolean;
  lastSync?: string;
  created_at?: string;
}

interface RSSTransmitido {
  id: string;
  rss_item_guid: string;
  rss_item_link: string;
  rss_feed_name: string;
  blog_post_id: string | null;
  created_at: string;
}

// Função para buscar e parsear RSS feed
export async function fetchRSSFeed(url: string): Promise<RSSFeed | null> {
  try {
    // Usar proxy para contornar CORS se necessário
    let fetchUrl = url;
    if (url.includes('politepol.com') || url.includes('rss.app')) {
      // Para URLs que não têm CORS habilitado, usar proxy
      fetchUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    }
    
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const xmlText = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
    
    // Verificar se há erros de parsing
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Erro ao fazer parse do XML');
    }
    
    // Tentar encontrar o canal RSS (pode estar em diferentes estruturas)
    let channel = xmlDoc.querySelector('channel');
    if (!channel) {
      // Se não encontrar channel, pode ser um feed RSS 2.0 ou Atom
      channel = xmlDoc.querySelector('rss channel') || xmlDoc.documentElement;
    }
    
    if (!channel) {
      throw new Error('Canal RSS não encontrado');
    }
    
    const title = channel.querySelector('title')?.textContent || '';
    const description = channel.querySelector('description')?.textContent || '';
    const link = channel.querySelector('link')?.textContent || '';
    
    const items: RSSItem[] = [];
    const itemElements = channel.querySelectorAll('item');
    
    itemElements.forEach(item => {
      const itemTitle = item.querySelector('title')?.textContent || '';
      const itemLink = item.querySelector('link')?.textContent || '';
      let itemDescription = item.querySelector('description')?.textContent || '';
      const itemPubDate = item.querySelector('pubDate')?.textContent || '';
      let itemGuid = item.querySelector('guid')?.textContent || itemLink;
      
      // Limpar descrição se estiver vazia ou só com espaços
      if (!itemDescription || itemDescription.trim() === '') {
        itemDescription = 'Sem descrição disponível';
      }
      
      // Garantir que o GUID seja único
      if (!itemGuid || itemGuid.trim() === '') {
        itemGuid = itemLink || `item-${Date.now()}-${Math.random()}`;
      }
      
      if (itemTitle && itemLink) {
        items.push({
          title: itemTitle.trim(),
          link: itemLink.trim(),
          description: itemDescription.trim(),
          pubDate: itemPubDate.trim(),
          guid: itemGuid.trim()
        });
      }
    });
    
    return {
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      items
    };
  } catch (error) {
    console.error('Erro ao buscar RSS feed:', error);
    return null;
  }
}

// Função para extrair conteúdo de uma página web
export async function extractWebContent(url: string): Promise<string | null> {
  try {
    // Usar um proxy ou serviço para contornar CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Criar um parser DOM temporário
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remover scripts, styles e outros elementos desnecessários
    const elementsToRemove = doc.querySelectorAll('script, style, nav, header, footer, aside, .advertisement, .ads');
    elementsToRemove.forEach(el => el.remove());
    
    // Tentar encontrar o conteúdo principal
    let content = '';
    
    // Procurar por seletores comuns de conteúdo
    const contentSelectors = [
      'article',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      'main',
      '.main-content'
    ];
    
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        content = element.textContent || '';
        break;
      }
    }
    
    // Se não encontrou conteúdo específico, pegar o body
    if (!content) {
      const body = doc.querySelector('body');
      content = body?.textContent || '';
    }
    
    // Limpar o conteúdo
    content = content
      .replace(/\s+/g, ' ') // Substituir múltiplos espaços por um
      .replace(/\n+/g, '\n') // Substituir múltiplas quebras de linha
      .trim();
    
    return content;
  } catch (error) {
    console.error('Erro ao extrair conteúdo da web:', error);
    return null;
  }
}

// Cache para evitar reprocessar o mesmo conteúdo múltiplas vezes
const rewriteCache = new Map<string, { title: string; content: string; summary: string; tags: string[]; region: string; state: string; metaKeywords: string[] }>();
const REWRITE_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas em ms
const rewriteCacheTimestamps = new Map<string, number>();

// Função para limpar o cache de reescrita (útil para testes ou limpeza manual)
export function clearRewriteCache(): void {
  rewriteCache.clear();
  rewriteCacheTimestamps.clear();
  console.log('Cache de reescrita limpo');
}

// Função para obter estatísticas do cache
export function getRewriteCacheStats(): { size: number; oldestEntry: number | null; newestEntry: number | null } {
  const timestamps = Array.from(rewriteCacheTimestamps.values());
  return {
    size: rewriteCache.size,
    oldestEntry: timestamps.length > 0 ? Math.min(...timestamps) : null,
    newestEntry: timestamps.length > 0 ? Math.max(...timestamps) : null
  };
}

// Função para reescrever conteúdo usando Google Gemini via Lovable AI
export async function rewriteContentWithAI(originalContent: string, originalTitle: string): Promise<{ title: string; content: string; summary: string; tags: string[]; region: string; state: string; metaKeywords: string[] } | null> {
  try {
    // Criar uma chave única baseada no título e conteúdo
    const cacheKey = `${originalTitle}_${originalContent.substring(0, 100)}`;
    const now = Date.now();
    
    // Verificar se já temos este conteúdo em cache e se não expirou
    if (rewriteCache.has(cacheKey)) {
      const cacheTime = rewriteCacheTimestamps.get(cacheKey) || 0;
      if (now - cacheTime < REWRITE_CACHE_TTL) {
        console.log('Usando conteúdo reescrito do cache para:', originalTitle);
        return rewriteCache.get(cacheKey)!;
      } else {
        // Cache expirado, remover
        rewriteCache.delete(cacheKey);
        rewriteCacheTimestamps.delete(cacheKey);
      }
    }
    
    console.log('Usando Supabase Edge Function (Lovable AI/Gemini) para reescrever conteúdo...');
    
    // Chamar a edge function rewrite-content
    const { data, error } = await supabase.functions.invoke('rewrite-content', {
      body: {
        originalContent,
        originalTitle
      }
    });
    
    if (error) {
      console.error('Erro ao chamar edge function:', error);
      throw new Error(`Erro na edge function: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('Resposta vazia da edge function');
    }
    
    const result = {
      title: data.title || originalTitle,
      content: data.content || '',
      summary: data.summary || '',
      tags: data.tags || ['Concursos', 'Educação'],
      region: data.region || 'nacional',
      state: data.state || '',
      metaKeywords: data.metaKeywords || ['concursos', 'educação', 'vagas']
    };
    
    // Armazenar no cache
    rewriteCache.set(cacheKey, result);
    rewriteCacheTimestamps.set(cacheKey, now);
    console.log('Conteúdo reescrito armazenado no cache para:', originalTitle);
    
    return result;
  } catch (error) {
    console.error('Erro ao reescrever conteúdo com IA:', error);
    return null;
  }
}

// Função auxiliar DEPRECADA - não é mais necessária, mantida apenas para compatibilidade
async function rewriteContentWithNetlifyFunction(originalContent: string, originalTitle: string): Promise<{ title: string; content: string; summary: string; tags: string[]; region: string; state: string; metaKeywords: string[] } | null> {
  console.warn('rewriteContentWithNetlifyFunction está depreciada, use rewriteContentWithAI');
  return rewriteContentWithAI(originalContent, originalTitle);
}

// Função para processar um item do RSS e criar um post
export async function processRSSItem(item: RSSItem, authorName: string = 'BomEstudo Bot'): Promise<BlogPost | null> {
  try {
    console.log('Processando item RSS:', item.title);
    
    // Gerar slug base do título original
    const baseSlug = generateSlug(item.title);
    
    // Verificar se já existe um post com este slug ou título similar
    const { data: existingPosts, error: checkError } = await supabase
      .from('blog_posts')
      .select('id, title, slug')
      .or(`slug.eq.${baseSlug},title.ilike.%${item.title.substring(0, 50)}%`)
      .limit(5);
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar post existente:', checkError);
      return null;
    }
    
    if (existingPosts && existingPosts.length > 0) {
      // Verificar se algum dos posts encontrados é realmente uma duplicata
      const isDuplicate = existingPosts.some(post => 
        post.slug === baseSlug || 
        post.title.toLowerCase().includes(item.title.toLowerCase().substring(0, 30))
      );
      
      if (isDuplicate) {
        console.log('Post similar já existe, pulando:', item.title);
        return null;
      }
    }
    
    // Extrair conteúdo da página
    const webContent = await extractWebContent(item.link);
    if (!webContent) {
      console.error('Não foi possível extrair conteúdo de:', item.link);
      return null;
    }
    
    // Reescrever com IA
    const rewrittenContent = await rewriteContentWithAI(webContent, item.title);
    if (!rewrittenContent) {
      console.error('Não foi possível reescrever conteúdo para:', item.title);
      return null;
    }
    
    // Criar o post como rascunho
    const newPost: Omit<BlogPost, 'id' | 'createdAt'> = {
      title: rewrittenContent.title,
      summary: rewrittenContent.summary,
      content: rewrittenContent.content,
      author: authorName,
      slug: baseSlug, // Usar o slug base gerado do título original
      category: 'Concursos',
      commentCount: 0,
      likesCount: 0,
      viewCount: 0,
      tags: rewrittenContent.tags || ['Concursos', 'Educação'],
      metaDescription: rewrittenContent.summary,
      region: rewrittenContent.region as Region || 'nacional',
      state: rewrittenContent.state || '',
      metaKeywords: rewrittenContent.metaKeywords || ['concursos', 'educação', 'vagas'],
      featured: false,
      isDraft: true // Salvar automaticamente como rascunho
    };
    
    // Salvar como rascunho
    const createdPost = await createBlogPost(newPost);
    
    if (createdPost) {
      console.log('Post criado como rascunho:', createdPost.title);
    }
    
    return createdPost;
  } catch (error) {
    console.error('Erro ao processar item RSS:', error);
    return null;
  }
}

// Função para salvar configuração de RSS
export async function saveRSSConfig(config: Omit<RSSConfig, 'id' | 'created_at'>): Promise<RSSConfig | null> {
  try {
    const { data, error } = await supabase
      .from('rss_configs')
      .insert([config])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao salvar configuração RSS:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao salvar configuração RSS:', error);
    return null;
  }
}

// Função para buscar configurações de RSS
export async function fetchRSSConfigs(): Promise<RSSConfig[]> {
  try {
    const { data, error } = await supabase
      .from('rss_configs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar configurações RSS:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar configurações RSS:', error);
    return [];
  }
}

// Função para atualizar configuração de RSS
export async function updateRSSConfig(id: string, config: Partial<RSSConfig>): Promise<RSSConfig | null> {
  try {
    const { data, error } = await supabase
      .from('rss_configs')
      .update(config)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao atualizar configuração RSS:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao atualizar configuração RSS:', error);
    return null;
  }
}

// Função para deletar configuração de RSS
export async function deleteRSSConfig(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('rss_configs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao deletar configuração RSS:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao deletar configuração RSS:', error);
    return false;
  }
}

// Função para sincronizar todos os RSS feeds ativos
// Nova função para buscar todos os posts de todos os feeds RSS ativos
export async function fetchAllRSSPosts(): Promise<{ feedName: string; items: RSSItem[] }[]> {
  try {
    const configs = await fetchRSSConfigs();
    const activeConfigs = configs.filter(config => config.active);
    
    const allPosts: { feedName: string; items: RSSItem[] }[] = [];
    
    for (const config of activeConfigs) {
      try {
        console.log('Buscando posts do RSS:', config.name);
        
        const feed = await fetchRSSFeed(config.url);
        if (feed && feed.items.length > 0) {
          allPosts.push({
            feedName: config.name,
            items: feed.items
          });
        }
      } catch (error) {
        console.error(`Erro ao buscar posts do RSS ${config.name}:`, error);
      }
    }
    
    return allPosts;
  } catch (error) {
    console.error('Erro ao buscar posts dos RSS feeds:', error);
    return [];
  }
}

// Função para processar um post individual
export async function processIndividualRSSItem(item: RSSItem, authorName: string = 'Administrador'): Promise<BlogPost | null> {
  return await processRSSItem(item, authorName);
}

// Função para registrar um post RSS como transmitido
export async function registerTransmittedRSSItem(item: RSSItem, feedName: string, blogPostId: string | null = null): Promise<RSSTransmitido | null> {
  try {
    const { data, error } = await supabase
      .from('rss_transmitidos')
      .insert([{
        rss_item_guid: item.guid,
        rss_item_link: item.link,
        rss_feed_name: feedName,
        blog_post_id: blogPostId
      }])
      .select()
      .single();

    if (error) {
      console.error('Erro ao registrar item RSS transmitido:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao registrar item RSS transmitido:', error);
    return null;
  }
}

// Função para verificar se um item RSS já foi transmitido
export async function isRSSItemTransmitted(guid: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('rss_transmitidos')
      .select('id')
      .eq('rss_item_guid', guid)
      .limit(1);

    if (error) {
      console.error('Erro ao verificar item RSS transmitido:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar item RSS transmitido:', error);
    return false;
  }
}

// Função para buscar todos os itens RSS transmitidos
export async function fetchAllTransmittedRSSItems(): Promise<RSSTransmitido[]> {
  try {
    const { data, error } = await supabase
      .from('rss_transmitidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar itens RSS transmitidos:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar itens RSS transmitidos:', error);
    return [];
  }
}

export async function syncAllRSSFeeds(): Promise<{ success: number; errors: number }> {
  try {
    const configs = await fetchRSSConfigs();
    const activeConfigs = configs.filter(config => config.active);
    
    let success = 0;
    let errors = 0;
    
    for (const config of activeConfigs) {
      try {
        console.log('Sincronizando RSS:', config.name);
        
        const feed = await fetchRSSFeed(config.url);
        if (!feed) {
          errors++;
          continue;
        }
        
        // Processar apenas os 5 itens mais recentes para evitar sobrecarga
        const recentItems = feed.items.slice(0, 5);
        
        for (const item of recentItems) {
          const post = await processRSSItem(item);
          if (post) {
            success++;
          }
        }
        
        // Atualizar timestamp da última sincronização
        await updateRSSConfig(config.id!, { lastSync: new Date().toISOString() });
        
      } catch (error) {
        console.error(`Erro ao sincronizar RSS ${config.name}:`, error);
        errors++;
      }
    }
    
    return { success, errors };
  } catch (error) {
    console.error('Erro ao sincronizar RSS feeds:', error);
    return { success: 0, errors: 1 };
  }
}