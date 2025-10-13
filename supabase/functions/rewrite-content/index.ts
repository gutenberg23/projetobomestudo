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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não está configurada");
    }

    if (!originalContent || !originalTitle) {
      return new Response(
        JSON.stringify({ error: 'originalContent e originalTitle são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Reescrevendo conteúdo:', originalTitle);

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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "Você é um especialista em concursos públicos e redação jornalística. Sua tarefa é reescrever artigos mantendo a precisão das informações mas evitando problemas de copyright. Remova toda referência a direitos autorais e retorne apenas o JSON solicitado. Se possível, mantenha tabelas e listas de dados."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido, tente novamente mais tarde." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "É necessário adicionar créditos ao workspace do Lovable AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("Erro do AI gateway:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao chamar AI gateway" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia do AI gateway');
    }

    console.log('Conteúdo reescrito com sucesso');

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
      processedContent = processedContent.replace(/<h1[^>]*>.*?<\/h1>/gi, (match) => {
        const h1Content = match.replace(/<[^>]*>/g, '').toLowerCase();
        const similarity = titleWords.filter(word => word.length > 3 && h1Content.includes(word)).length;
        
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
