import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para delay
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Função para chamar a API do Gemini com retry
async function callGeminiAPI(apiKey: string, requestBody: any, model = "gemini-2.0-flash-exp", maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        return response;
      }

      // Se for 429 (rate limit), esperar e tentar novamente
      if (response.status === 429 && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Backoff exponencial
        console.log(`Rate limit atingido. Tentando novamente em ${waitTime}ms...`);
        await delay(waitTime);
        continue;
      }

      // Para outros erros, retornar imediatamente
      return response;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(`Erro na tentativa ${attempt + 1}. Tentando novamente em ${waitTime}ms...`, error);
      await delay(waitTime);
    }
  }
  
  throw new Error("Número máximo de tentativas excedido");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Não autenticado' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { htmlContent, authorName } = await req.json();
    
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY não está configurada");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Credenciais do Supabase não estão configuradas");
    }

    if (!htmlContent) {
      return new Response(
        JSON.stringify({ error: 'htmlContent é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Reescrevendo notícia com Google Gemini');

    const systemInstruction = `Você é um assistente de IA especialista em criar conteúdo para o blog 'Bom Estudo', focado em concursos públicos no Brasil. Sua tarefa é analisar o conteúdo HTML fornecido e reescrevê-lo como uma postagem completa de blog, no formato JSON, seguindo ESTRITAMENTE o schema fornecido. O tom deve ser informativo e claro. Preencha todos os campos do JSON de forma completa e precisa com base no conteúdo fornecido. NÃO INVENTE INFORMAÇÕES.`;

    const blogPostSchema = {
      type: "object",
      properties: {
        titulo: { type: "string", description: "Título atraente e informativo para a postagem do blog, baseado no conteúdo fornecido." },
        resumo: { type: "string", description: "Resumo conciso da postagem, com no máximo 240 caracteres, baseado no conteúdo fornecido." },
        categoria: { type: "string", description: "Categoria principal da notícia (ex: 'Novos Concursos' ou 'Processo Seletivo'), baseado no conteúdo fornecido." },
        conteudo: { type: "string", description: "Conteúdo completo da postagem em formato HTML otimizado, baseado no conteúdo fornecido. PROIBIDO USAR TABELAS HTML. Use listas html. Se for sobre um novo concurso, deve terminar com uma lista HTML com os dados em cada item: 'Website de Inscrição', 'Período de Inscrição', 'Data da Prova', 'Valor da Inscrição', 'Quantidade de Vagas' e 'Banca'." },
        regiao: { type: "string", description: "A região do Brasil do concurso, baseado no conteúdo fornecido. Escolha entre: 'norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul', 'federal', 'nacional'." },
        estado: { type: "string", description: "O estado brasileiro do concurso em siglas maiúsculas (ex: 'SP', 'BH', 'RJ'), baseado no conteúdo fornecido. Deixe como uma string vazia se a região for 'federal' ou 'nacional'." },
        tags: { type: "string", description: "Uma lista de 3 a 5 tags relevantes separadas por vírgula, baseado no conteúdo fornecido." },
        metaDescricao: { type: "string", description: "Uma meta descrição otimizada para SEO, resumindo o conteúdo em até 160 caracteres, baseado no conteúdo fornecido." },
        palavrasChave: { type: "string", description: "Uma lista de 3 a 5 palavras-chave relevantes para SEO, separadas por vírgula, baseado no conteúdo fornecido." },
      },
      required: ['titulo', 'resumo', 'categoria', 'conteudo', 'regiao', 'estado', 'tags', 'metaDescricao', 'palavrasChave']
    };

    const prompt = `Analise o conteúdo HTML fornecido e reescreva-o como uma postagem de blog completa seguindo EXATAMENTE o schema.

INSTRUÇÕES CRÍTICAS:
1. Analise cuidadosamente o conteúdo HTML fornecido
2. PROIBIDO INVENTAR INFORMAÇÕES que não estejam claramente no conteúdo
3. Se alguma informação não estiver clara, não a utilize
4. Baseie-se SOMENTE nas informações presentes no conteúdo HTML
5. Extraia as informações mais importantes como título, datas, vagas, salários, requisitos, disciplinas, etc.
6. Organize as informações de forma estruturada e clara
7. Crie um conteúdo HTML bem formatado com parágrafos, títulos e listas quando apropriado`;

    const response = await callGeminiAPI(GOOGLE_GEMINI_API_KEY, {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: btoa(unescape(encodeURIComponent(htmlContent))),
                mimeType: 'text/html'
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 16000,
        responseMimeType: 'application/json',
        responseSchema: blogPostSchema,
      },
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    }, "gemini-2.0-flash-exp");

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido da API do Google Gemini, tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro da API Google Gemini:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao chamar API do Google Gemini", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('Resposta do Gemini:', JSON.stringify(data, null, 2));
      throw new Error('Resposta vazia da API do Google Gemini');
    }

    console.log('Notícia reescrita com sucesso');

    // O conteúdo já vem em formato JSON graças ao responseSchema
    const parsedContent = JSON.parse(content);

    // Criar cliente Supabase com permissões de serviço
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Gerar slug a partir do título
    const slug = parsedContent.titulo
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[-\s]+/g, '-');

    // Preparar dados do post
    const postData = {
      title: parsedContent.titulo,
      summary: parsedContent.resumo,
      content: parsedContent.conteudo,
      author: authorName || 'Bot N8N',
      slug: slug,
      category: parsedContent.categoria,
      region: parsedContent.regiao,
      state: parsedContent.estado,
      tags: parsedContent.tags ? parsedContent.tags.split(',').map((tag: string) => tag.trim()) : [],
      meta_description: parsedContent.metaDescricao,
      meta_keywords: parsedContent.palavrasChave ? parsedContent.palavrasChave.split(',').map((keyword: string) => keyword.trim()) : [],
      featured: false,
      is_draft: false,
      comment_count: 0,
      likes_count: 0,
      view_count: 0
    };

    // Inserir post no banco de dados
    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('blog_posts')
      .insert([postData])
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar post:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao criar post no banco de dados', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Post criado com sucesso:', insertData.title);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          id: insertData.id,
          title: insertData.title,
          slug: insertData.slug
        } 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Erro na edge function rewrite-and-post-news:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});