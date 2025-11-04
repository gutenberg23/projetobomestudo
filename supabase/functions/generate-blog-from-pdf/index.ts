import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { pdfBase64, mimeType } = await req.json();
    
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY não está configurada");
    }

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'pdfBase64 é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Gerando notícia a partir do PDF com Google Gemini');

    const systemInstruction = `Você é um assistente de IA especialista em criar conteúdo para o blog 'Bom Estudo', focado em concursos públicos no Brasil. Sua tarefa é analisar EXCLUSIVAMENTE o conteúdo do PDF fornecido e gerar uma postagem de blog completa no formato JSON, seguindo estritamente o schema fornecido. O tom deve ser informativo, claro e encorajador para os concurseiros. Preencha todos os campos do JSON de forma completa e precisa com base APENAS nas informações presentes no PDF. NÃO invente informações.`;

    const blogPostSchema = {
      type: "object",
      properties: {
        titulo: { type: "string", description: "Título atraente e informativo para a postagem do blog, baseado nas informações do PDF." },
        resumo: { type: "string", description: "Resumo conciso da postagem, com no máximo 240 caracteres, baseado nas informações do PDF." },
        categoria: { type: "string", description: "Categoria principal da notícia (ex: 'Novos Concursos'), baseado nas informações do PDF." },
        conteudo: { type: "string", description: "Conteúdo completo da postagem em formato HTML otimizado, baseado nas informações do PDF. Se for sobre um novo concurso, deve terminar com uma tabela HTML com 2 colunas. À esquerda os títulos: 'Website de Inscrição', 'Período de Inscrição', 'Data da Prova', 'Valor da Inscrição', 'Quantidade de Vagas' e 'Banca'." },
        regiao: { type: "string", description: "A região do Brasil do concurso, baseado nas informações do PDF. Escolha entre: 'norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul', 'federal', 'nacional'." },
        estado: { type: "string", description: "O estado brasileiro do concurso em siglas maiúsculas (ex: 'SP', 'BH', 'RJ'), baseado nas informações do PDF. Deixe como uma string vazia se a região for 'federal' ou 'nacional'." },
        tags: { type: "string", description: "Uma lista de 3 a 5 tags relevantes separadas por vírgula, baseado nas informações do PDF." },
        metaDescricao: { type: "string", description: "Uma meta descrição otimizada para SEO, resumindo o conteúdo em até 160 caracteres, baseado nas informações do PDF." },
        palavrasChave: { type: "string", description: "Uma lista de 3 a 5 palavras-chave relevantes para SEO, separadas por vírgula, baseado nas informações do PDF." },
      },
      required: ['titulo', 'resumo', 'categoria', 'conteudo', 'regiao', 'estado', 'tags', 'metaDescricao', 'palavrasChave']
    };

    const prompt = `Analise EXCLUSIVAMENTE o conteúdo do PDF fornecido e crie uma postagem de blog completa seguindo exatamente o schema.

INSTRUÇÕES CRÍTICAS:
1. Analise APENAS o conteúdo do PDF fornecido
2. NÃO invente informações que não estejam claramente no PDF
3. Se alguma informação não estiver clara ou ausente, deixe o campo vazio ou use texto genérico apropriado
4. Baseie-se SOMENTE nas informações presentes no PDF
5. Extraia as informações mais importantes como título, datas, vagas, salários, requisitos, etc.
6. Se for um edital de concurso, organize as informações de forma estruturada e clara
7. Crie um conteúdo HTML bem formatado com parágrafos, títulos e tabelas quando apropriado`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GOOGLE_GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
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
          temperature: 0.7,
          maxOutputTokens: 8000,
          responseMimeType: 'application/json',
          responseSchema: blogPostSchema,
        },
        systemInstruction: {
          parts: [{ text: systemInstruction }]
        }
      }),
    });

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
