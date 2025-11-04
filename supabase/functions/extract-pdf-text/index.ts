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
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'PDF base64 content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracting text from PDF...');

    // Converter base64 para Uint8Array
    const pdfData = Uint8Array.from(atob(pdfBase64), c => c.charCodeAt(0));

    // Função simples para extrair texto de PDF
    // Nota: Esta é uma implementação básica. PDFs complexos podem precisar de bibliotecas mais robustas
    const extractTextFromPDF = (data: Uint8Array): string => {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(data);
      
      // Extrair texto entre objetos de texto do PDF
      const textMatches = text.match(/\(([^)]+)\)/g);
      
      if (!textMatches) {
        // Tentar extrair de outra forma
        const streamMatches = text.match(/stream\s+([\s\S]*?)\s+endstream/g);
        if (streamMatches) {
          let extractedText = '';
          for (const match of streamMatches) {
            const content = match.replace(/stream\s+/, '').replace(/\s+endstream/, '');
            // Tentar decodificar o conteúdo
            try {
              extractedText += content.replace(/[^\x20-\x7E\n\r\t]/g, ' ') + '\n';
            } catch (e) {
              console.error('Error decoding stream:', e);
            }
          }
          return extractedText.trim();
        }
        return 'Não foi possível extrair texto do PDF';
      }
      
      // Limpar e juntar o texto extraído
      const extractedText = textMatches
        .map(match => match.slice(1, -1)) // Remove parênteses
        .map(str => str.replace(/\\[rn]/g, '\n')) // Converte quebras de linha
        .join(' ')
        .replace(/\s+/g, ' ') // Remove espaços extras
        .trim();
      
      return extractedText;
    };

    const extractedText = extractTextFromPDF(pdfData);

    console.log(`Extracted ${extractedText.length} characters from PDF`);

    if (!extractedText || extractedText.length < 50) {
      return new Response(
        JSON.stringify({ 
          error: 'Could not extract meaningful text from PDF. The PDF might be image-based or protected.',
          text: extractedText 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ text: extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
