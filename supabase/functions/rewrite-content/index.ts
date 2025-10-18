// @ts-ignore
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
    const { originalContent, originalTitle } = await req.json();
    // @ts-ignore
    const GOOGLE_GEMINI_API_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    
    if (!GOOGLE_GEMINI_API_KEY) {
      throw new Error("GOOGLE_GEMINI_API_KEY não está configurada");
    }

    if (!originalContent || !originalTitle) {
      return new Response(
        JSON.stringify({ error: 'originalContent e originalTitle são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Reescrevendo conteúdo com Google Gemini:', originalTitle);

    const prompt = `
Reescreva completamente o seguinte artigo sobre concursos públicos, mantendo as informações importantes mas usando suas próprias palavras para evitar problemas de copyright. 

Título original: ${originalTitle}

Conteúdo original:
${originalContent}

Por favor, retorne um JSON com a seguinte estrutura:
{
  "title": "Novo título reescrito",
  "summary": "Resumo do artigo em 2-3 frases",
  "content": "Conteúdo completo reescrito em HTML, bem formatado com parágrafos, listas quando apropriado, etc.",
  "tags": ["tag1", "tag2", "tag3"],
  "region": "região do concurso",
  "state": "estado do concurso",
  "metaKeywords": ["palavra-chave1", "palavra-chave2", "palavra-chave3"]
}

Certifique-se de:
1. Reescrever completamente o conteúdo, não apenas parafrasear
2. Manter todas as informações importantes (datas, valores, requisitos, etc.)
3. Usar linguagem clara e profissional
4. Formatar o conteúdo em HTML válido
5. Criar um título atrativo e informativo
6. Fazer um resumo conciso e envolvente
7. NÃO incluir tags H1 no conteúdo, pois o título já será usado como H1
8. Gerar 3-5 tags relevantes baseadas no conteúdo (ex: nome do órgão, tipo de concurso, área, etc.) - evite termos como "automatizado", "RSS", "bot"
9. Para "region", use uma das opções: "norte", "nordeste", "centro-oeste", "sul", "sudeste", "nacional", "federal" (baseado no escopo geográfico do concurso)
10. Para "state", use a sigla do estado brasileiro em maiúsculo (ex: "SP", "RJ", "MG") ou deixe vazio se for nacional/federal
11. Para "metaKeywords", gere 5-10 palavras-chave relevantes separadas em array (ex: nome do órgão, área de atuação, tipo de cargo, nível de escolaridade, etc.)`;

    const systemInstruction = "Você é um especialista em concursos públicos e redação jornalística. Sua tarefa é reescrever artigos mantendo a precisão das informações mas evitando problemas de copyright. Remova toda referência a direitos autorais e retorne apenas o JSON solicitado. Se possível, mantenha tabelas e listas de dados.";
    
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
              { text: systemInstruction + "\n\n" + prompt }
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

    console.log('Conteúdo reescrito com sucesso usando Google Gemini');

    // Tentar fazer parse do JSON retornado
    try {
      // Remover blocos de código markdown se presentes
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      const result = JSON.parse(cleanContent);
      
      // Processar o conteúdo para remover H1s duplicados
      let processedContent = result.content || '';
      
      const titleWords = (result.title || originalTitle).toLowerCase().split(' ');
      processedContent = processedContent.replace(/<h1[^>]*>.*?<\/h1>/gi, (match: string) => {
        const h1Content = match.replace(/<[^>]*>/g, '').toLowerCase();
        const similarity = titleWords.filter((word: string) => word.length > 3 && h1Content.includes(word)).length;
        
        if (similarity > titleWords.length * 0.5) {
          return '';
        }
        return match;
      });
      
      const finalResult = {
        title: result.title || originalTitle,
        content: processedContent,
        summary: result.summary || '',
        tags: result.tags || ['Concursos', 'Educação'],
        region: result.region || 'nacional',
        state: result.state || '',
        metaKeywords: result.metaKeywords || ['concursos', 'educação', 'vagas']
      };
      
      return new Response(
        JSON.stringify(finalResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      // Fallback: retornar conteúdo como está
      const fallbackResult = {
        title: originalTitle,
        content: content,
        summary: content.substring(0, 200) + '...',
        tags: ['Concursos', 'Educação'],
        region: 'nacional',
        state: '',
        metaKeywords: ['concursos', 'educação', 'vagas']
      };
      
      return new Response(
        JSON.stringify(fallbackResult),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error('Erro na edge function rewrite-content:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});