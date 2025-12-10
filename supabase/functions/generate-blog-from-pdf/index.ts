import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callGeminiAPI(apiKey: string, requestBody: any, model = "gemini-2.5-pro:generateContent", maxRetries = 3) {
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
        await new Promise(resolve => setTimeout(resolve, waitTime));
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
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error("Número máximo de tentativas excedido");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se é uma requisição interna (sem autenticação) ou externa
    const authHeader = req.headers.get('Authorization');
    let GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    
    // Se não tem chave nas variáveis de ambiente, tentar pegar do corpo da requisição
    // (para uso interno da aplicação)
    let isInternalRequest = false;
    if (!GOOGLE_GEMINI_API_KEY && authHeader) {
      try {
        const authData = JSON.parse(atob(authHeader.replace('Bearer ', '')));
        if (authData.apiKey) {
          GOOGLE_GEMINI_API_KEY = authData.apiKey;
          isInternalRequest = true;
        }
      } catch (e) {
        // Não é uma requisição interna válida
      }
    }
    
    // Se ainda não tem chave, tentar do corpo da requisição
    if (!GOOGLE_GEMINI_API_KEY) {
      let requestData;
      try {
        requestData = await req.json();
      } catch (e) {
        return new Response(
          JSON.stringify({ error: 'JSON inválido no corpo da requisição' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (requestData.geminiApiKey) {
        GOOGLE_GEMINI_API_KEY = requestData.geminiApiKey;
        isInternalRequest = true;
      }
    }
    
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY não está configurada");
    }

    // Se for requisição externa, verificar autenticação
    if (!isInternalRequest) {
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Não autenticado' }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let requestData;
    try {
      requestData = await req.json();
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'JSON inválido no corpo da requisição' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { pdfBase64, mimeType } = requestData;
    
    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'pdfBase64 é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Gerando notícia a partir do PDF com Google Gemini');

    const systemInstruction = `Você é um assistente de IA especialista em criar conteúdo para o blog 'Bom Estudo', focado em concursos públicos no Brasil. Sua tarefa é analisar EXCLUSIVAMENTE o conteúdo do PDF fornecido e gerar uma postagem completa de blog, no formato JSON, seguindo ESTRITAMENTE o schema fornecido. O tom deve ser informativo e claro. Preencha todos os campos do JSON de forma completa e precisa com base APENAS nas informações presentes no PDF. NÃO INVENTE INFORMAÇÕES.`;

    const blogPostSchema = {
      type: "object",
      properties: {
        titulo: { type: "string", description: "Título atraente e informativo para a postagem do blog, baseado APENAS nas informações do PDF." },
        resumo: { type: "string", description: "Resumo conciso da postagem, com no máximo 240 caracteres, baseado APENAS nas informações do PDF." },
        categoria: { type: "string", description: "Categoria principal da notícia (ex: 'Novos Concursos' ou 'Processo Seletivo'), baseado APENAS nas informações do PDF." },
        conteudo: { type: "string", description: "Conteúdo completo da postagem em formato HTML otimizado, baseado nas informações do PDF. PROIBIDO USAR TABELAS HTML. Use listas html. Se for sobre um novo concurso, deve terminar com uma lista HTML com os dados em cada item: 'Website de Inscrição', 'Período de Inscrição', 'Data da Prova', 'Valor da Inscrição', 'Quantidade de Vagas' e 'Banca'." },
        regiao: { type: "string", description: "A região do Brasil do concurso, baseado nas informações do PDF. Escolha entre: 'norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul', 'federal', 'nacional'." },
        estado: { type: "string", description: "O estado brasileiro do concurso em siglas maiúsculas (ex: 'SP', 'BH', 'RJ'), baseado nas informações do PDF. Deixe como uma string vazia se a região for 'federal' ou 'nacional'." },
        tags: { type: "string", description: "Uma lista de 3 a 5 tags relevantes separadas por vírgula, baseado nas informações do PDF." },
        metaDescricao: { type: "string", description: "Uma meta descrição otimizada para SEO, resumindo o conteúdo em até 160 caracteres, baseado APENAS nas informações do PDF." },
        palavrasChave: { type: "string", description: "Uma lista de 3 a 5 palavras-chave relevantes para SEO, separadas por vírgula, baseado APENAS nas informações do PDF." },
      },
      required: ['titulo', 'resumo', 'categoria', 'conteudo', 'regiao', 'estado', 'tags', 'metaDescricao', 'palavrasChave']
    };

    const prompt = `Analise EXCLUSIVAMENTE o conteúdo do PDF fornecido e crie uma postagem de blog completa seguindo EXATAMENTE o schema.

INSTRUÇÕES CRÍTICAS:
1. Analise APENAS o conteúdo do PDF fornecido. O PDF pode ter informações de outros assuntos. Saiba separar os assuntos corretamente.
2. PROIBIDO INVENTAR INFORMAÇÕES que não estejam claramente no PDF. Até mesmo informações que estejam no PDF podem ser de outros assuntos sem ser o novo concurso. Cuidado com as informações.
3. Se alguma informação não estiver clara, não a utilize.
4. Baseie-se SOMENTE nas informações presentes no PDF.
5. Extraia as informações mais importantes como título, datas, vagas, salários, requisitos, disciplinas, etc.
6. É um concurso novo ou processo seletivo. Organize as informações de forma estruturada e clara.
7. Crie um conteúdo HTML bem formatado com parágrafos, títulos e listas quando apropriado`;

    const response = await callGeminiAPI(GOOGLE_GEMINI_API_KEY, {
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: pdfBase64,
                mimeType: mimeType || 'application/pdf'
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

    console.log('Notícia gerada com sucesso a partir do PDF');

    // O conteúdo já vem em formato JSON graças ao responseSchema
    const parsedContent = JSON.parse(content);

    return new Response(
      JSON.stringify({ data: parsedContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Erro na edge function generate-blog-from-pdf:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
