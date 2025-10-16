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
    const { prompt } = await req.json();
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY não está configurada");
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'prompt é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Gerando explicação com Google Gemini');

    // Adicionar instruções explícitas sobre formatação HTML no início do prompt
    const enhancedPrompt = `Você é um assistente especializado em explicar questões de concursos.

IMPORTANTE: Formate sua resposta usando HTML válido com as seguintes tags:
- Use <strong> para texto em negrito
- Use <em> para texto em itálico
- Use <u> para texto sublinhado
- Use <h3> para títulos de seções
- Use <p> para parágrafos
- Use <ul> e <li> para listas com marcadores
- Use <ol> e <li> para listas numeradas
- Não use Markdown (asteriscos, underscores, etc.)
- Não use backticks ou código formatado

${prompt}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GOOGLE_GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: enhancedPrompt }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,
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
        JSON.stringify({ error: "Erro ao chamar API do Google Gemini" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      console.error('Resposta do Gemini:', JSON.stringify(data, null, 2));
      throw new Error('Resposta vazia da API do Google Gemini');
    }

    console.log('Explicação gerada com sucesso usando Google Gemini');

    return new Response(
      JSON.stringify({ text: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Erro na edge function generate-question-explanation:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
