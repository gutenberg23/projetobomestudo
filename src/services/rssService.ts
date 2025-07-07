import { supabase } from '@/lib/supabase';
import { createBlogPost } from './blogService';
import { BlogPost } from '@/components/blog/types';
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

// Função para buscar e parsear RSS feed
export async function fetchRSSFeed(url: string): Promise<RSSFeed | null> {
  try {
    const response = await fetch(url);
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
    
    const channel = xmlDoc.querySelector('channel');
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
      const itemDescription = item.querySelector('description')?.textContent || '';
      const itemPubDate = item.querySelector('pubDate')?.textContent || '';
      const itemGuid = item.querySelector('guid')?.textContent || itemLink;
      
      if (itemTitle && itemLink) {
        items.push({
          title: itemTitle,
          link: itemLink,
          description: itemDescription,
          pubDate: itemPubDate,
          guid: itemGuid
        });
      }
    });
    
    return {
      title,
      description,
      link,
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

// Função para reescrever conteúdo usando OpenAI
export async function rewriteContentWithAI(originalContent: string, originalTitle: string): Promise<{ title: string; content: string; summary: string } | null> {
  try {
    // Tentar múltiplas formas de acessar a variável de ambiente
    let openaiApiKey = '';
    
    // Debug: verificar todas as possíveis fontes de variáveis
    console.log('=== DEBUG VARIÁVEIS DE AMBIENTE ===');
    console.log('import.meta.env.VITE_OPENAI_API_KEY:', !!import.meta.env.VITE_OPENAI_API_KEY);
    console.log('process.env.OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY);
    console.log('process.env.VITE_OPENAI_API_KEY:', !!process.env.VITE_OPENAI_API_KEY);
    console.log('window.process?.env?.OPENAI_API_KEY:', !!(typeof window !== 'undefined' && (window as any).process?.env?.OPENAI_API_KEY));
    
    // Tentar diferentes formas de acessar a chave
    if (import.meta.env.VITE_OPENAI_API_KEY) {
      openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      console.log('Chave encontrada via import.meta.env.VITE_OPENAI_API_KEY');
    } else if (process.env.OPENAI_API_KEY) {
      openaiApiKey = process.env.OPENAI_API_KEY;
      console.log('Chave encontrada via process.env.OPENAI_API_KEY');
    } else if (process.env.VITE_OPENAI_API_KEY) {
      openaiApiKey = process.env.VITE_OPENAI_API_KEY;
      console.log('Chave encontrada via process.env.VITE_OPENAI_API_KEY');
    } else if (typeof window !== 'undefined' && (window as any).process?.env?.OPENAI_API_KEY) {
      openaiApiKey = (window as any).process.env.OPENAI_API_KEY;
      console.log('Chave encontrada via window.process.env.OPENAI_API_KEY');
    }
    
    // Se não encontrou a chave, tentar usar a Netlify Function
    if (!openaiApiKey) {
      console.warn('=== Chave OpenAI não encontrada no frontend ===');
      console.warn('Tentando usar Netlify Function como fallback...');
      return await rewriteContentWithNetlifyFunction(originalContent, originalTitle);
    }
    
    // Debug: verificar se a chave está sendo lida corretamente
    console.log('OpenAI API Key presente:', !!openaiApiKey);
    console.log('Primeiros 10 caracteres da chave:', openaiApiKey?.substring(0, 10));
    console.log('Últimos 4 caracteres da chave:', openaiApiKey?.substring(openaiApiKey.length - 4));
    
    // Verificar se a chave tem um formato válido (aceita diferentes prefixos)
    if (!openaiApiKey.startsWith('sk-') && !openaiApiKey.startsWith('sk-admin-') && !openaiApiKey.startsWith('sk-proj-') && !openaiApiKey.startsWith('sk-None-') && !openaiApiKey.startsWith('sk-svcacct-')) {
      console.warn('Formato da chave OpenAI inválido, tentando Netlify Function...');
      return await rewriteContentWithNetlifyFunction(originalContent, originalTitle);
    }

    const prompt = `
Reescreva completamente o seguinte artigo sobre concursos públicos, mantendo as informações importantes mas usando suas próprias palavras para evitar problemas de copyright. 

Título original: ${originalTitle}

Conteúdo original:
${originalContent}

Por favor, retorne um JSON com a seguinte estrutura:
{
  "title": "Novo título reescrito",
  "summary": "Resumo do artigo em 2-3 frases",
  "content": "Conteúdo completo reescrito em HTML, bem formatado com parágrafos, listas quando apropriado, etc."
}

Certifique-se de:
1. Reescrever completamente o conteúdo, não apenas parafrasear
2. Manter todas as informações importantes (datas, valores, requisitos, etc.)
3. Usar linguagem clara e profissional
4. Formatar o conteúdo em HTML válido
5. Criar um título atrativo e informativo
6. Fazer um resumo conciso e envolvente`;

    // Debug: verificar headers da requisição
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`
    };
    
    console.log('Headers da requisição:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': `Bearer ${openaiApiKey.substring(0, 10)}...${openaiApiKey.substring(openaiApiKey.length - 4)}`
    });
    
    const requestBody = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em concursos públicos e redação jornalística. Sua tarefa é reescrever artigos mantendo a precisão das informações mas evitando problemas de copyright. Remova toda referência a direitos autorais e remova tags json, pois o conteúdo vai para um blog. Se possível, mantenha tabelas e listas de dados.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 16384,
      temperature: 0.7
    };
    
    console.log('Fazendo requisição para OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    console.log('Status da resposta:', response.status);
    console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Erro da API OpenAI - Status:', response.status);
      console.log('Erro da API OpenAI - Resposta:', errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        console.log('Detalhes do erro:', errorData);
        throw new Error(`Erro na API OpenAI: ${response.status} - ${errorData.error?.message || errorText}`);
      } catch (parseError) {
        throw new Error(`Erro na API OpenAI: ${response.status} - ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log('Resposta da OpenAI recebida com sucesso');
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('Resposta vazia da OpenAI');
    }
    
    // Tentar fazer parse do JSON retornado
    try {
      const result = JSON.parse(content);
      return {
        title: result.title || originalTitle,
        content: result.content || '',
        summary: result.summary || ''
      };
    } catch (parseError) {
      // Se não conseguir fazer parse do JSON, retornar o conteúdo como está
      return {
        title: originalTitle,
        content: content,
        summary: content.substring(0, 200) + '...'
      };
    }
  } catch (error) {
    console.error('Erro ao reescrever conteúdo com IA:', error);
    return null;
  }
}

// Função auxiliar para usar a Netlify Function quando as variáveis de ambiente não estão disponíveis no frontend
async function rewriteContentWithNetlifyFunction(originalContent: string, originalTitle: string): Promise<{ title: string; content: string; summary: string } | null> {
  try {
    console.log('Usando Netlify Function para reescrever conteúdo...');
    
    const prompt = `
Reescreva completamente o seguinte artigo sobre concursos públicos, mantendo as informações importantes mas usando suas próprias palavras para evitar problemas de copyright. 

Título original: ${originalTitle}

Conteúdo original:
${originalContent}

Por favor, retorne um JSON com a seguinte estrutura:
{
  "title": "Novo título reescrito",
  "summary": "Resumo do artigo em 2-3 frases",
  "content": "Conteúdo completo reescrito em HTML, bem formatado com parágrafos, listas quando apropriado, etc."
}

Certifique-se de:
1. Reescrever completamente o conteúdo, não apenas parafrasear
2. Manter todas as informações importantes (datas, valores, requisitos, etc.)
3. Usar linguagem clara e profissional
4. Formatar o conteúdo em HTML válido
5. Criar um título atrativo e informativo
6. Fazer um resumo conciso e envolvente`;

    const response = await fetch('/.netlify/functions/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em concursos públicos e redação jornalística. Sua tarefa é reescrever artigos mantendo a precisão das informações mas evitando problemas de copyright. Remova toda referência a direitos autorais e remova tags json, pois o conteúdo vai para um blog. Se possível, mantenha tabelas e listas de dados.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 16384,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro na Netlify Function:', response.status, errorText);
      throw new Error(`Erro na Netlify Function: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.content;

    if (!content) {
      throw new Error('Resposta vazia da Netlify Function');
    }

    // Tentar fazer parse do JSON retornado
    try {
      const result = JSON.parse(content);
      return {
        title: result.title || originalTitle,
        content: result.content || '',
        summary: result.summary || ''
      };
    } catch (parseError) {
      // Se não conseguir fazer parse do JSON, retornar o conteúdo como está
      return {
        title: originalTitle,
        content: content,
        summary: content.substring(0, 200) + '...'
      };
    }
  } catch (error) {
    console.error('Erro ao usar Netlify Function:', error);
    return null;
  }
}

// Função para processar um item do RSS e criar um post
export async function processRSSItem(item: RSSItem, authorName: string = 'BomEstudo Bot'): Promise<BlogPost | null> {
  try {
    console.log('Processando item RSS:', item.title);
    
    // Gerar slug base do título original
    const baseSlug = generateSlug(item.title);
    
    // Verificar se já existe um post com este slug
    const { data: existingPost, error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('slug', baseSlug)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erro ao verificar post existente:', checkError);
      return null;
    }
    
    if (existingPost) {
      console.log('Post já existe, pulando:', item.title);
      return null;
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
    
    // Criar o post
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
      tags: ['RSS', 'Automatizado'],
      metaDescription: rewrittenContent.summary,
      featured: false
    };
    
    // Salvar como rascunho (você pode adicionar um campo 'status' na tabela)
    const createdPost = await createBlogPost(newPost);
    
    if (createdPost) {
      console.log('Post criado com sucesso:', createdPost.title);
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